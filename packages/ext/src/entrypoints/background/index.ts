import { browser, defineBackground, type Browser } from '#imports';
import { logger } from '@/utils/log.utils';
import {
  MESSAGE_LLM_TEXT_CHUNK,
  MESSAGE_RETRIEVE_POST_INFO,
  MESSAGE_RETRIEVE_COMMENTS,
  MESSAGE_START,
  MESSAGE_UPDATE_INFO,
  MessageLlmTextChunk,
  MessageRetrieveComments,
  MessageRetrievePostInfo,
  MessageStart,
  MessageUpdateInfo,
  MESSAGE_CHECKING_REMOTE_SAVED,
  MessageCheckingRemoteSaved,
  MESSAGE_REMOTE_TEXT,
  MessageRemoteText,
  MESSAGE_FETCH_PROGRESS,
  MessageFetchProgress,
  MESSAGE_THINKING_CHUNK,
  MessageThinkingChunk,
} from '@/utils/message';
import { getConfig } from '@/utils/storage.utils';
import { extractTopicId, getTopic, getAllTopicReplies, formatTopicForAI } from '@/utils/v2ex-api.utils';
import { callAIStream } from '@/utils/ai-client.utils';
import * as z from 'zod';

export default defineBackground(() => {
  armListeners();
});

type Sender = Browser.runtime.MessageSender;
type Tab = Browser.tabs.Tab;

type PostInfo = {
  time: number;
  url: string;
  title: string;
  body: string;
  author: string;
  totalPages: number;
  commentsByPage: Record<string, any>;
};

const PostByUrl = new Map<string, Partial<PostInfo>>();

const handler = {
  [MESSAGE_START]: async (m: unknown, sender: Sender) => {
    const msg = MessageStart.parse(m);

    const tab = await getCurrentTab(sender);
    if (!tab || !tab.url || !tab.id) {
      throw new Error(`Invalid tab url=${tab?.url} id=${tab?.id}`);
    }
    
    const topicId = extractTopicId(tab.url);
    if (!topicId) {
      throw new Error('Can not extract topic id from URL');
    }
    
    const id = await getPostId(tab.url);
    const info = PostByUrl.get(id);

    if (msg.payload.checkState && !info) {
      logger.info('noop as user have not initiated a "start" yet');
      return;
    }

    if (msg.payload.checkState && info?.time) {
      const now = Date.now();
      const diff = now - info.time;
      if (diff > 60_000) {
        logger.info(`looks like a staled session info.time=${info.time} now=${now}`);
        PostByUrl.delete(id);
        return;
      }
    }

    // 使用 V2EX API 获取数据并直接调用 AI
    if (!msg.payload.checkState) {
      PostByUrl.set(id, { time: Date.now(), url: id });
      deletePost10MinLater(id);
      
      try {
        const config = await getConfig();
        const token = config.v2exToken;
        
        // 获取主题详情
        const topic = await getTopic(topicId, token);
        
        // 获取所有回复，显示进度
        const replies = await getAllTopicReplies(topicId, token, (current, total) => {
          // 发送进度消息到 content script
          browser.tabs.sendMessage(tab.id!, {
            type: MESSAGE_FETCH_PROGRESS,
            payload: {
              current,
              total,
              message: `正在获取评论... (${current}/${total})`,
            },
          } satisfies z.infer<typeof MessageFetchProgress>).catch(err => {
            // 忽略发送失败的错误（可能 content script 还未准备好）
            logger.warn('Failed to send progress message:', err);
          });
        });
        
        // 格式化为文本
        const formattedText = formatTopicForAI(topic, replies);
        
        // 发送给 AI 总结
        getChaonima(formattedText, id, tab);
      } catch (error) {
        logger.error('Failed to fetch topic from V2EX API:', error);
        // 发送错误消息到 content script
        browser.tabs.sendMessage(tab.id, {
          type: MESSAGE_REMOTE_TEXT,
          payload: { text: `获取 V2EX 数据失败: ${error.message}\n\n请检查：\n1. 是否已在设置中配置 V2EX Token\n2. Token 是否有效\n3. 网络连接是否正常` },
        } satisfies z.infer<typeof MessageRemoteText>);
      }
    }
  },

  // MESSAGE_UPDATE_INFO 不再需要，因为我们通过 API 直接获取所有数据
  [MESSAGE_UPDATE_INFO]: async (m: unknown, sender: Sender) => {
    // 保留以兼容旧消息，但不执行任何操作
    logger.info('MESSAGE_UPDATE_INFO received but ignored (using V2EX API now)');
  },
};

function armListeners() {
  browser.runtime.onMessage.addListener((msg, sender, _reply) => {
    logger.info('==> %s %s', msg.type, sender.url);

    const handle = handler[msg.type as keyof typeof handler];
    if (!handle) {
      logger.error(`No handler for message type: %s`, msg.type);
      return false;
    }

    (async () => {
      try {
        await handle(msg, sender);
      } catch (e) {
        logger.error('message handler error %o', e);
      }
    })();
    return false;
  });
}

async function getCurrentTab(sender?: Browser.runtime.MessageSender) {
  if (sender && 'tab' in sender) return sender.tab;

  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
}

async function getPostId(url: string) {
  const u = new URL(url);
  return `${u.origin}${u.pathname}`;
}

async function getChaonima(text: string, id: string, tab: Tab) {
  const port = browser.tabs.connect(tab.id!);
  const config = await getConfig();

  let firstChunk = true;
  function onChunk(chunkText: string) {
    const msg = {
      type: MESSAGE_LLM_TEXT_CHUNK,
      payload: { text: chunkText, firstChunk },
    } satisfies z.infer<typeof MessageLlmTextChunk>;
    port.postMessage(msg);
    firstChunk = false;
  }

  function onThinking(thinkingText: string) {
    const msg = {
      type: MESSAGE_THINKING_CHUNK,
      payload: { text: thinkingText },
    } satisfies z.infer<typeof MessageThinkingChunk>;
    port.postMessage(msg);
  }

  const apiKey = config.apiKey || import.meta.env.VITE_API_KEY;
  const apiUrl = config.apiUrl; // OpenAI base URL
  const model = config.model || 'gpt-4o-mini';
  const enableThinking = config.enableThinking || false;
  
  if (!apiKey) {
    const errorMsg = '请在设置中配置 AI API Key';
    onChunk(errorMsg);
    port.disconnect();
    return;
  }
  
  try {
    // 直接调用 OpenAI 兼容 API，支持自定义 base URL
    logger.info('开始调用 AI API', {
      model,
      baseUrl: apiUrl || '默认',
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '未设置',
      enableThinking,
    });
    await callAIStream(apiKey, text, model, enableThinking, onChunk, enableThinking ? onThinking : undefined, apiUrl);
    PostByUrl.delete(id);
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '未设置';
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      model,
      baseUrl: apiUrl || '默认',
      apiKey: maskedKey,
      enableThinking,
    };
    logger.error('AI API call failed:', errorDetails);
    
    // 构建详细的错误信息
    let errorMsg = `AI 调用失败: ${error.message}\n\n`;
    errorMsg += `详细信息：\n`;
    errorMsg += `- 模型名称: ${model}\n`;
    errorMsg += `- API 地址: ${apiUrl || '默认（api.openai.com/v1）'}\n`;
    errorMsg += `- API Key: ${maskedKey}\n`;
    errorMsg += `- 思考模式: ${enableThinking ? '启用' : '禁用'}\n\n`;
    errorMsg += `请检查：\n`;
    errorMsg += `1. API Key 是否正确（当前: ${maskedKey}）\n`;
    errorMsg += `2. 模型名称是否正确（当前: ${model}）\n`;
    errorMsg += `3. API 地址是否正确（当前: ${apiUrl || '默认'}）\n`;
    errorMsg += `4. 网络连接是否正常\n`;
    if (error.stack) {
      errorMsg += `\n技术详情（开发者模式）：\n${error.stack}`;
    }
    
    onChunk(errorMsg);
    port.disconnect();
  }
}

function deletePost10MinLater(id: string) {
  setTimeout(() => {
    PostByUrl.delete(id);
  }, 600_000 /* 10 minutes */);
}
