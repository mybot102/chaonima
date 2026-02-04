import { textSignal, thinkingSignal } from './ChaonimaBody.signal';
import { MemoizedMarkdown } from './MemoizedMarkdown';
import { useSignals } from '@preact/signals-react/runtime';

export function ChaonimaBody({ content }: { content: string }) {
  useSignals();
  const thinking = thinkingSignal.value;
  const text = textSignal.value || content;
  
  // 如果有思考内容，将其格式化为引用块显示
  const displayContent = thinking
    ? `> **思考过程：**\n> \n${thinking.split('\n').map(line => `> ${line}`).join('\n')}\n\n---\n\n${text}`
    : text;
  
  return <MemoizedMarkdown content={displayContent} id="chaonima-md" />;
}
