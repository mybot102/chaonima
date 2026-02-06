import { useEffect } from 'react';
import { browser } from '#imports';
import { Summary } from 'preview/react';
import { 
  appendText, 
  appendThinking, 
  clearAll,
} from 'preview/react';
import {
  MESSAGE_LLM_TEXT_CHUNK,
  MESSAGE_THINKING_CHUNK,
  MESSAGE_REMOTE_TEXT,
  MessageLlmTextChunk,
  MessageThinkingChunk,
  MessageRemoteText,
} from '@/utils/message';

export function App() {
  useEffect(() => {
    // 监听来自 background script 的消息
    const messageListener = (
      message: 
        | z.infer<typeof MessageLlmTextChunk>
        | z.infer<typeof MessageThinkingChunk>
        | z.infer<typeof MessageRemoteText>
    ) => {
      switch (message.type) {
        case MESSAGE_LLM_TEXT_CHUNK: {
          const msg = MessageLlmTextChunk.parse(message);
          if (msg.payload.firstChunk) {
            clearAll();
          }
          appendText(msg.payload.text);
          break;
        }
        case MESSAGE_THINKING_CHUNK: {
          const msg = MessageThinkingChunk.parse(message);
          appendThinking(msg.payload.text);
          break;
        }
        case MESSAGE_REMOTE_TEXT: {
          const msg = MessageRemoteText.parse(message);
          clearAll();
          appendText(msg.payload.text);
          break;
        }
        default:
          // 忽略未知消息类型
          break;
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      overflow: 'auto',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <Summary 
        onClickCloseButton={() => {
          // 关闭侧边栏
          window.close();
        }}
      />
    </div>
  );
}
