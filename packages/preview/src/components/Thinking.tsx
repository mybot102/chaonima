import { useState } from 'react';
import { CaretRight, Brain } from '@phosphor-icons/react';
import { MemoizedMarkdown } from '../MemoizedMarkdown';
import styles from './Thinking.module.scss';
import cn from 'clsx';

interface ThinkingProps {
  content: string;
  done?: boolean;
}

export function Thinking({ content, done = false }: ThinkingProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // 思考内容默认保持展开状态，不自动折叠
  // 用户可以手动点击标题栏来折叠或展开

  if (!content) return null;

  return (
    <div className={styles.container}>
      <div 
        className={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.title}>
          <Brain size={16} weight={done ? "regular" : "fill"} className={cn(styles.icon, { [styles.thinking]: !done })} />
          <span>思考过程</span>
        </div>
        <CaretRight size={14} className={cn(styles.arrow, { [styles.open]: isOpen })} />
      </div>
      
      <div className={cn(styles.gridWrapper, { [styles.open]: isOpen })}>
        <div className={styles.overflowHidden}>
          <div className={styles.content}>
            <MemoizedMarkdown content={content} id="thinking-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
