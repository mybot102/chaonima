/**
 * AI 客户端 - 直接调用 AI API（Gemini/OpenAI）
 * 用于浏览器扩展中直接与 AI 服务通信
 */

// Gemini API 类型定义
interface GeminiStreamData {
  candidates?: Array<{
    content?: {
      parts: Array<{ text: string }>;
    };
  }>;
}

// OpenAI API 类型定义
interface OpenAIStreamData {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

/**
 * 调用 Gemini API 进行流式生成
 */
export async function callGeminiStream(
  apiKey: string,
  text: string,
  model: string,
  enableThinking: boolean,
  onChunk: (text: string) => void,
  baseUrl?: string
): Promise<void> {
  const instruction = [
    "我会给你发一篇帖子，可能会包含网友们的评论。",
    "用地道易懂的话总结这篇帖子。",
    "如果有网友评论的话，总结一下他们在讨论什么。",
    "如果网友们在争论的话，概括一下各方的论点。",
    '你的输出不要包含额外内容 (比如"好的，没问题！我来帮你总结一下。")',
  ].join("\n");

  const requestBody = {
    system_instruction: { parts: [{ text: instruction }] },
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      thinkingConfig: { includeThoughts: enableThinking },
    },
  };

  const base = baseUrl || 'https://generativelanguage.googleapis.com';
  const url = `${base}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${error}`);
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
          try {
            const data: GeminiStreamData = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts[0]?.text;
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
 * 调用 OpenAI API 进行流式生成
 */
export async function callOpenAIStream(
  apiKey: string,
  text: string,
  model: string,
  onChunk: (text: string) => void,
  baseUrl?: string
): Promise<void> {
  const instruction = [
    "我会给你发一篇帖子，可能会包含网友们的评论。",
    "用地道易懂的话总结这篇帖子。",
    "如果有网友评论的话，总结一下他们在讨论什么。",
    "如果网友们在争论的话，概括一下各方的论点。",
    '你的输出不要包含额外内容 (比如"好的，没问题！我来帮你总结一下。")',
  ].join("\n");

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
      'Authorization': `******,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
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
 * 根据模型名称判断使用哪个 API
 */
export function getAPIProvider(model: string): 'gemini' | 'openai' | 'unknown' {
  const lowerModel = model.toLowerCase();
  
  if (lowerModel.includes('gemini')) {
    return 'gemini';
  }
  
  if (lowerModel.includes('gpt') || lowerModel.includes('o1') || lowerModel.includes('chatgpt')) {
    return 'openai';
  }
  
  if (lowerModel.includes('claude')) {
    // Claude 也使用 OpenAI 兼容格式
    return 'openai';
  }
  
  return 'unknown';
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
  baseUrl?: string
): Promise<void> {
  const provider = getAPIProvider(model);
  
  if (provider === 'gemini') {
    return callGeminiStream(apiKey, text, model, enableThinking, onChunk, baseUrl);
  } else if (provider === 'openai') {
    return callOpenAIStream(apiKey, text, model, onChunk, baseUrl);
  } else {
    throw new Error(`未知的模型类型: ${model}。请选择 Gemini 或 GPT 系列模型。`);
  }
}
