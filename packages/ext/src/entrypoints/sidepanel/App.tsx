import { useEffect } from 'react';
import { browser } from '#imports';
import { Summary } from 'preview/react';
import { 
  appendText, 
  appendThinking, 
  clearAll,
} from 'preview/react';
import * as z from 'zod';
import {
  MESSAGE_LLM_TEXT_CHUNK,
  MESSAGE_THINKING_CHUNK,
  MESSAGE_REMOTE_TEXT,
  MESSAGE_FETCH_PROGRESS,
  MESSAGE_AI_PROCESSING,
  MESSAGE_SIDEPANEL_READY,
  MESSAGE_CHECK_SIDEPANEL_ALIVE,
  MESSAGE_SIDEPANEL_ALIVE_ACK,
  MessageLlmTextChunk,
  MessageThinkingChunk,
  MessageRemoteText,
  MessageFetchProgress,
  MessageAIProcessing,
  MessageSidepanelReady,
  MessageCheckSidepanelAlive,
  MessageSidepanelAliveAck,
} from '@/utils/message';

export function App() {
  useEffect(() => {
    // 侧边栏挂载时，发送 READY 消息
    browser.runtime.sendMessage({
      type: MESSAGE_SIDEPANEL_READY,
    } satisfies z.infer<typeof MessageSidepanelReady>).catch(err => {
      console.warn('Failed to send sidepanel ready message:', err);
    });

    // 监听来自 background script 的消息
    const messageListener = (
      message: 
        | z.infer<typeof MessageLlmTextChunk>
        | z.infer<typeof MessageThinkingChunk>
        | z.infer<typeof MessageRemoteText>
        | z.infer<typeof MessageFetchProgress>
        | z.infer<typeof MessageAIProcessing>
        | z.infer<typeof MessageCheckSidepanelAlive>
    ) => {
      switch (message.type) {
        case MESSAGE_LLM_TEXT_CHUNK: {
          const msg = MessageLlmTextChunk.parse(message);
          if (msg.payload.firstChunk) {
            clearAll();
          }
          appendText(msg.payload.text);
          break;
        }
        case MESSAGE_THINKING_CHUNK: {
          const msg = MessageThinkingChunk.parse(message);
          appendThinking(msg.payload.text);
          break;
        }
        case MESSAGE_REMOTE_TEXT: {
          const msg = MessageRemoteText.parse(message);
          clearAll();
          appendText(msg.payload.text);
          break;
        }
        case MESSAGE_FETCH_PROGRESS: {
          const msg = MessageFetchProgress.parse(message);
          clearAll();
          appendText(msg.payload.message || `正在获取数据... ${msg.payload.current}/${msg.payload.total}`);
          break;
        }
        case MESSAGE_AI_PROCESSING: {
          clearAll();
          appendText('AI 正在处理中...');
          break;
        }
        case MESSAGE_CHECK_SIDEPANEL_ALIVE: {
          // 收到 PING，回复 PONG
          browser.runtime.sendMessage({
            type: MESSAGE_SIDEPANEL_ALIVE_ACK,
          } satisfies z.infer<typeof MessageSidepanelAliveAck>).catch(err => {
            console.warn('Failed to send sidepanel ack:', err);
          });
          break;
        }
        default:
          // 忽略未知消息类型
          break;
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'auto',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <Summary 
        onClickCloseButton={() => {
          // 关闭侧边栏
          window.close();
        }}
      />
    </div>
  );
}
