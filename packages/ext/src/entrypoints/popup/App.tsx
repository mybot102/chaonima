import { ChaonimaLogo } from 'preview/react';
import { browser } from '#imports';

function App() {
  const openSettings = () => {
    browser.runtime.openOptionsPage();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ChaonimaLogo />
      </div>
      <p>访问 v2ex 话题页</p>
      <p>点击页面的"他们在吵什么"按钮开始</p>
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={openSettings}
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          ⚙️ 设置
        </button>
      </div>
      <footer style={{ textAlign: 'right', marginTop: '1rem' }}>
        <a target="_blank" href="https://github.com/haishanh/chaonima">
          码子
        </a>
      </footer>
    </>
  );
}

export default App;
