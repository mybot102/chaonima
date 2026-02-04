import { browser } from '#imports';
import { MESSAGE_START, MessageStart } from '@/utils/message';
import { signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import { Button, StarAi } from 'preview/react';
import { useCallback } from 'react';
import * as z from 'zod';

const loadingSignal = signal<boolean>(false);
const progressSignal = signal<{ current: number; total: number; message?: string } | null>(null);

export function setLoading(v: boolean) {
  loadingSignal.value = v;
}

export function setProgress(progress: { current: number; total: number; message?: string } | null) {
  progressSignal.value = progress;
}

export function Start() {
  useSignals();

  const onClick = useCallback(() => {
    setLoading(true);
    (async () => {
      const m = { type: MESSAGE_START, payload: {} } satisfies z.infer<typeof MessageStart>;
      browser.runtime.sendMessage(m);
    })();
  }, []);
  const progress = progressSignal.value;
  const loading = loadingSignal.value;
  
  let buttonText = '他们在吵什么';
  if (loading) {
    if (progress) {
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
