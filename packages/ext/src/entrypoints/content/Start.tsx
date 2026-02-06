import { browser } from '#imports';
import { MESSAGE_START, MessageStart, MESSAGE_OPEN_SIDEPANEL, MessageOpenSidepanel } from '@/utils/message';
import { signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { Button, StarAi } from 'preview/react';
import { useCallback } from 'react';
import * as z from 'zod';

const loadingSignal = signal<boolean>(false);
const progressSignal = signal<{ current: number; total: number; message?: string } | null>(null);
const aiStatusSignal = signal<'idle' | 'processing' | 'thinking'>('idle');

export function setLoading(v: boolean) {
  loadingSignal.value = v;
  if (!v) {
    // 当 loading 为 false 时，重置 AI 状态
    aiStatusSignal.value = 'idle';
  }
}

export function setProgress(progress: { current: number; total: number; message?: string } | null) {
  progressSignal.value = progress;
}

export function setAIStatus(status: 'idle' | 'processing' | 'thinking') {
  aiStatusSignal.value = status;
}

export function Start() {
  useSignals();

  const onClick = useCallback(() => {
    setLoading(true);
    (async () => {
      // 打开侧边栏并自动开始任务
      try {
        await browser.runtime.sendMessage({ 
          type: MESSAGE_OPEN_SIDEPANEL,
          payload: { autoStart: true }
        } satisfies z.infer<typeof MessageOpenSidepanel>);
        
        // 移除原有的 MESSAGE_START 发送，改为由 Sidepanel Ready 触发或 Sidepanel Alive Ack 触发
        // 但为了保证 UI 状态正确，我们可能需要监听来自 background 的进度消息
        // 上面的 setLoading(true) 已经设置了初始状态
      } catch (error) {
        console.error('Failed to open sidepanel:', error);
        setLoading(false);
        // TODO: 显示错误提示给用户
      }
    })();
  }, []);
  const progress = progressSignal.value;
  const loading = loadingSignal.value;
  const aiStatus = aiStatusSignal.value;
  
  let buttonText = '他们在吵什么';
  if (loading) {
    if (aiStatus === 'thinking') {
      buttonText = 'AI 思考中...';
    } else if (aiStatus === 'processing') {
      buttonText = 'AI 处理中...';
    } else if (progress) {
      buttonText = `获取评论中... (${progress.current}/${progress.total})`;
    } else {
      buttonText = '读取评论中...';
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
      <Button onClick={onClick} loading={loading} disabled={loading}>
        {buttonText}
      </Button>
      {progress && (
        <div style={{
          position: 'absolute',
          top: '-2rem',
          right: 0,
          fontSize: '0.75rem',
          color: '#666',
          whiteSpace: 'nowrap',
        }}>
          {progress.message || `第 ${progress.current} 页，共 ${progress.total} 页`}
        </div>
      )}
      <StarAi style={{ position: 'absolute', right: 0, top: 0 }} />
    </div>
  );
}
