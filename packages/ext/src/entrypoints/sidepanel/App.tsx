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
    // 监听来自 background/content script 的消息
    const messageListener = (message: any) => {
      switch (message.type) {
        case MESSAGE_REMOTE_TEXT: {
          const msg = MessageRemoteText.parse(message);
          clearAll();
          appendText(msg.payload.text);
          break;
        }
        default:
          console.log('Sidepanel received unknown message:', message.type);
      }
    };

    // 监听端口连接（用于流式数据）
    const portListener = (port: browser.runtime.Port) => {
      port.onMessage.addListener((message: any) => {
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
          default:
            console.log('Sidepanel port received unknown message:', message.type);
        }
      });
    };

    browser.runtime.onMessage.addListener(messageListener);
    browser.runtime.onConnect.addListener(portListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
      browser.runtime.onConnect.removeListener(portListener);
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
