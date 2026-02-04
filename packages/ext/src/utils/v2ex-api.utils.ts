/**
 * V2EX API 2.0 客户端
 * 文档: https://www.v2ex.com/help/api
 */

const V2EX_API_BASE = 'https://www.v2ex.com/api/v2';

export interface V2exTopic {
  id: number;
  title: string;
  content: string;
  content_rendered: string;
  syntax: number;
  url: string;
  replies: number;
  member: {
    id: number;
    username: string;
    url: string;
    avatar: string;
  };
  node: {
    id: number;
    name: string;
    title: string;
    url: string;
  };
  created: number;
  last_modified: number;
  last_reply_time?: number;
}

export interface V2exReply {
  id: number;
  content: string;
  content_rendered: string;
  created: number;
  member: {
    id: number;
    username: string;
    url: string;
    avatar: string;
  };
  reply_to?: number;
}

export interface V2exRepliesResponse {
  success: boolean;
  message: string;
  result: V2exReply[];
  pagination: {
    per_page: number;
    total: number;
    pages: number;
  };
}

/**
 * 从 V2EX URL 中提取 topic ID
 */
export function extractTopicId(url: string): string | null {
  const match = url.match(/\/t\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * 获取主题详情
 */
export async function getTopic(topicId: string, token?: string): Promise<V2exTopic> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${V2EX_API_BASE}/topics/${topicId}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch topic: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.result as V2exTopic;
}

/**
 * 获取主题的所有回复（自动处理分页）
 */
export async function getAllTopicReplies(
  topicId: string,
  token?: string,
  onProgress?: (current: number, total: number) => void
): Promise<V2exReply[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const allReplies: V2exReply[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetch(
      `${V2EX_API_BASE}/topics/${topicId}/replies?p=${page}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch replies: ${response.status} ${error}`);
    }

    const data: V2exRepliesResponse = await response.json();
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.message || 'Unknown error'}`);
    }
    
    if (data.result && data.result.length > 0) {
      allReplies.push(...data.result);
    }

    // 从 pagination.pages 获取总页数
    totalPages = data.pagination?.pages || 1;
    
    // 调用进度回调
    if (onProgress) {
      onProgress(page, totalPages);
    }

    // 如果当前页没有数据或已经获取完所有页面，退出循环
    if (page >= totalPages) {
      break;
    }

    page++;
  }

  return allReplies;
}

/**
 * 格式化主题和回复为文本
 */
export function formatTopicForAI(topic: V2exTopic, replies: V2exReply[]): string {
  const parts: string[] = [];
  
  // 帖子标题
  parts.push(`## 帖子标题\n${topic.title}`);
  
  // 作者信息
  if (topic.member) {
    parts.push(`**作者**：${topic.member.username}`);
  }
  
  // 帖子内容
  if (topic.content && topic.content.trim()) {
    parts.push(`## 帖子内容\n${topic.content}`);
  }
  
  // 评论部分
  if (replies.length > 0) {
    parts.push(`## 评论（共 ${replies.length} 条）`);
    replies.forEach((reply, index) => {
      const username = reply.member?.username || '匿名用户';
      parts.push(`### 评论 ${index + 1} - ${username}\n${reply.content}\n`);
    });
  } else {
    parts.push(`## 评论\n暂无评论`);
  }
  
  return parts.join('\n\n');
}
