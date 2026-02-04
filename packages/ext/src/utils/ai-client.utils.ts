/**
 * AI 客户端 - 直接调用 OpenAI 兼容 API
 * 用于浏览器扩展中直接与 AI 服务通信
 * 支持所有 OpenAI 兼容的 API（OpenAI、Azure OpenAI、本地服务等）
 */

// OpenAI API 类型定义
interface OpenAIStreamData {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

/**
 * 隐藏 API Key 的敏感部分，只显示前后几位
 */
function maskApiKey(apiKey: string | undefined): string {
  if (!apiKey || apiKey.length <= 8) {
    return '***';
  }
  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  return `${start}...${end}`;
}

/**
 * 调用 OpenAI 兼容 API 进行流式生成
 */
export async function callOpenAIStream(
  apiKey: string,
  text: string,
  model: string,
  onChunk: (text: string) => void,
  onThinking?: (text: string) => void,
  baseUrl?: string
): Promise<void> {
  const instruction = `你是一个专业的社区内容总结助手，擅长分析和总结 V2EX 论坛的帖子和讨论。

## 任务
请仔细阅读用户提供的帖子内容和评论，然后用简洁、准确、易懂的语言进行总结。

## 输出要求
1. **帖子核心内容**：用 2-3 句话概括帖子的主要问题和观点
2. **讨论焦点**：如果存在评论，总结大家在讨论什么核心话题
3. **观点分歧**：如果存在争论，清晰概括各方的核心论点和立场
4. **关键信息**：提取重要的技术细节、建议或结论（如有）

## 格式要求
- 使用自然流畅的中文，避免过于正式或生硬的表达
- 直接开始总结，不要添加"好的"、"我来帮你"等客套话
- 使用段落分隔不同内容，保持结构清晰
- 如果帖子没有评论，只需总结帖子本身即可

## 语言风格
- 简洁明了，避免冗余
- 使用通俗易懂的表达，避免过于专业的术语（除非必要）
- 保持客观中立，不要添加个人评价或情感色彩`;

  const requestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: instruction,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    stream: true,
  };

  const base = baseUrl || 'https://api.openai.com/v1';
  const url = `${base}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    const errorDetails = {
      status: response.status,
      statusText: response.statusText,
      url,
      error,
      model,
      baseUrl: base,
      apiKey: maskApiKey(apiKey),
    };
    console.error('[OpenAI API] 请求失败', errorDetails);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}\n错误详情: ${error}\n请求 URL: ${url}\n模型: ${model}\nBase URL: ${base}`);
  }

  // 处理 SSE 流
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          
          try {
            const parsed: OpenAIStreamData = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) {
              onChunk(text);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 所有模型都使用 OpenAI 兼容 API
 * 此函数保留用于兼容性，始终返回 'openai'
 */
export function getAPIProvider(model: string): 'openai' {
  // 所有模型都使用 OpenAI 兼容 API
  return 'openai';
}

/**
 * 统一的 AI 调用接口
 */
export async function callAIStream(
  apiKey: string,
  text: string,
  model: string,
  enableThinking: boolean,
  onChunk: (text: string) => void,
  onThinking?: (text: string) => void,
  baseUrl?: string
): Promise<void> {
  const provider = getAPIProvider(model);
  const maskedKey = maskApiKey(apiKey);
  const finalBaseUrl = baseUrl || 'https://api.openai.com/v1';
  
  console.log('[AI调用] 开始调用 OpenAI 兼容 API', {
    provider,
    model,
    baseUrl: finalBaseUrl,
    apiKey: maskedKey,
    enableThinking,
    textLength: text.length,
  });
  
  try {
    // 所有模型都使用 OpenAI 兼容 API
    return await callOpenAIStream(apiKey, text, model, onChunk, onThinking, baseUrl);
  } catch (error) {
    const errorInfo = {
      provider,
      model,
      baseUrl: finalBaseUrl,
      apiKey: maskedKey,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    };
    console.error('[AI调用] API 调用失败', errorInfo);
    throw error;
  }
}
