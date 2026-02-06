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
  
  // 当思考结束时，如果用户没有手动交互过，可能希望自动折叠？
  // 这里我们采用简单策略：根据 done 状态的改变来触发
  useEffect(() => {
    if (done) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
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
