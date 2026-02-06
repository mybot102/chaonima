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
      reasoning_content?: string;  // 新增：思考过程内容
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
  const instruction = `你是一个专业的社区内容分析助手，擅长深入分析和总结 V2EX 论坛的帖子和讨论。

## 任务
请仔细阅读用户提供的帖子内容和所有评论，进行深入、详细的分析和总结。

## 输出要求

### 1. 帖子核心内容
用 2-3 句话概括帖子的主要问题、背景和作者的核心观点。

### 2. 评论详细分析（如果存在评论）
对评论进行深入、全面的分析，包括：

**2.1 评论概览**
- 评论总数和讨论规模
- 评论的主要话题分布
- 讨论的活跃程度和参与度

**2.2 观点分类与总结**
- 识别并分类不同的观点阵营（支持、反对、中立、补充等）
- 总结每个阵营的核心论点和代表性评论
- 分析观点的演变过程（如果有观点转变或深化）

**2.3 关键讨论点**
- 提取评论中反复提及的关键问题
- 识别讨论中的技术难点、争议焦点
- 总结评论中提出的解决方案、建议或经验分享

**2.4 评论质量分析**
- 识别高质量评论（包含技术细节、实际经验、解决方案等）
- 总结评论中的实用信息（代码示例、工具推荐、最佳实践等）
- 指出评论中的关键洞察和独到见解

**2.5 互动模式分析**
- 分析评论之间的回复关系（如果有）
- 识别讨论中的共识点和分歧点
- 总结讨论的结论或未解决的问题

**2.6 观点分歧详细分析**
如果存在争论，需要：
- 详细列出各方的核心论点和支撑理由
- 分析分歧的根本原因
- 评估各方观点的合理性和局限性
- 总结是否有达成共识的可能性

### 3. 关键信息提取
- 提取重要的技术细节、配置、代码片段
- 总结评论中提到的工具、资源、链接
- 记录重要的数据、统计信息或案例

### 4. AI 观点
基于对帖子 and 所有评论的深入分析，提供你的专业见解：
- 对问题的深入理解和多角度分析
- 可能的解决方案或改进建议
- 对讨论中观点的综合评价和补充
- 相关的背景知识、行业趋势或延伸思考
- 指出讨论中可能遗漏的重要角度

## 格式要求
- 使用自然流畅的中文，避免过于正式或生硬的表达
- 直接开始总结，不要添加"好的"、"我来帮你"等客套话
- 使用清晰的段落和标题结构，便于阅读
- 对于重要信息，可以使用列表或要点形式呈现
- 如果帖子没有评论，只需总结帖子本身即可
- AI 观点部分使用"**AI 观点**"作为小标题

## 语言风格
- 详细但不冗长，确保信息密度高
- 使用通俗易懂的表达，但保留必要的技术术语
- 保持客观中立，但在 AI 观点部分可以提供有价值的专业见解
- AI 观点应该基于讨论内容，有理有据，避免空泛的评论
- 对于评论分析，要深入挖掘，不要停留在表面总结`;

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
            const delta = parsed.choices?.[0]?.delta;

            // 处理主要文本内容
            if (delta?.content) {
              onChunk(delta.content);
            }

            // 处理思考过程内容（如果启用且提供回调）
            if (onThinking && delta?.reasoning_content) {
              onThinking(delta.reasoning_content);
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
 * OpenAI API 模型列表响应类型
 */
interface ModelsListResponse {
  data: Array<{
    id: string;
    object?: string;
    created?: number;
    owned_by?: string;
  }>;
}

/**
 * 从 OpenAI 兼容 API 获取模型列表
 */
export async function fetchModelsList(
  apiKey: string,
  baseUrl?: string
): Promise<Array<{ id: string; name?: string }>> {
  const base = baseUrl || 'https://api.openai.com/v1';
  const url = `${base}/models`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      // 如果 API 不支持或返回错误，返回空数组而不是抛出错误
      console.warn('[获取模型列表] API 请求失败:', response.status, response.statusText);
      return [];
    }

    const data: ModelsListResponse = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.warn('[获取模型列表] 响应格式不正确');
      return [];
    }

    // 转换并过滤模型列表
    return data.data
      .map(model => ({
        id: model.id,
        name: model.id, // 使用 id 作为 name，因为大多数 API 不提供单独的 name 字段
      }))
      .filter(model => model.id) // 过滤掉无效的模型 ID
      .sort((a, b) => a.id.localeCompare(b.id)); // 按 ID 排序
  } catch (error) {
    console.error('[获取模型列表] 请求异常:', error);
    return [];
  }
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
