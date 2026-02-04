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
  result: V2exReply[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
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
    
    if (data.result && data.result.length > 0) {
      allReplies.push(...data.result);
    }

    totalPages = data.total_pages || 1;
    
    if (onProgress) {
      onProgress(page, totalPages);
    }

    page++;
  }

  return allReplies;
}

/**
 * 格式化主题和回复为文本
 */
export function formatTopicForAI(topic: V2exTopic, replies: V2exReply[]): string {
  const parts = [`帖子标题:\n${topic.title}`];
  
  if (topic.member) {
    parts.push(`作者:\n${topic.member.username}`);
  }
  
  if (topic.content) {
    parts.push(`帖子内容:\n${topic.content}`);
  } else {
    parts.push(`帖子内容:\n${topic.title}`);
  }
  
  if (replies.length > 0) {
    const comments = replies.map(reply => {
      const username = reply.member?.username || '匿名用户';
      return `${username} 说:\n---\n${reply.content}\n---\n`;
    });
    parts.push(`下面都是大家的评论:\n${comments.join('\n')}`);
  } else {
    parts.push(`该文章目前还没有评论`);
  }
  
  return parts.join('\n\n');
}
