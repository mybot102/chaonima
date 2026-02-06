import { appendText, appendThinking, clearAll } from './ChaonimaBody.signal';
import { fetchTextStream } from './utils/fetch.utils';
import { ThinkingContentProcessor } from './utils/ThinkingContentProcessor';

export async function getChaonima(text: string) {
  clearAll(); // 开始新请求前清空
  const sp = new URLSearchParams({ text });
  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v2ex/streamGenerateContent?${sp}`;
  
  const processor = new ThinkingContentProcessor(appendText, appendThinking);

  fetchTextStream(url, {
    method: 'GET',
    onmessage: (t) => {
      processor.process(t);
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_API_JWT}`,
    },
  }).then(() => {
    processor.flush();
  });
}
