import { textSignal, thinkingSignal } from './ChaonimaBody.signal';
import { MemoizedMarkdown } from './MemoizedMarkdown';
import { useSignals } from '@preact/signals-react/runtime';
import { Thinking } from './components/Thinking';

export function ChaonimaBody({ content }: { content: string }) {
  useSignals();
  const thinking = thinkingSignal.value;
  const text = textSignal.value || content;
  
  // 如果有思考内容，使用 Thinking 组件显示
  // 当 text 出现时，认为思考过程已经结束
  const thinkingDone = !!text && text.length > 0;

  return (
    <>
      {thinking && <Thinking content={thinking} done={thinkingDone} />}
      <MemoizedMarkdown content={text} id="chaonima-md" />
    </>
  );
}
