import { useState, useEffect } from 'react';
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
  
  // 思考完成后自动折叠（但不隐藏），用户仍可手动展开
  useEffect(() => {
    if (done) {
      setIsOpen(false);
    }
  }, [done]);

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
