import { useState, useEffect } from 'react';
import { getConfig, saveConfig, resetConfig, type Config } from '@/utils/storage.utils';
import { ChaonimaLogo } from 'preview/react';

function App() {
  const [config, setConfig] = useState<Config>({
    apiUrl: '',
    apiKey: '',
    model: 'gemini-2.5-flash-preview-09-2025',
    enableThinking: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig = await getConfig();
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('保存失败，请检查输入');
    }
  };

  const handleReset = async () => {
    if (!confirm('确定要重置所有设置吗？')) return;
    try {
      await resetConfig();
      await loadConfig();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to reset config:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ChaonimaLogo />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Chaonima 设置</h1>
          <p className="mt-2 text-gray-600">配置 API 以接入 OpenAI 兼容的模型</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* API URL */}
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                API URL
              </label>
              <input
                type="url"
                id="apiUrl"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                OpenAI 兼容 API 的基础 URL（留空使用默认值）
              </p>
            </div>

            {/* API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                您的 API 密钥（留空使用默认值）
              </p>
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <select
                id="model"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 Flash Preview</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Experimental</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                选择要使用的 AI 模型
              </p>
            </div>

            {/* Enable Thinking Mode */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableThinking"
                  checked={config.enableThinking}
                  onChange={(e) => setConfig({ ...config, enableThinking: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableThinking" className="ml-2 block text-sm text-gray-700">
                  启用思考模式
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500 ml-6">
                启用后，模型会显示其思考过程（仅支持部分模型）
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {saved ? '✓ 已保存' : '保存设置'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            使用 Chaonima 扩展时，将使用这些配置来连接 AI 服务
          </p>
          <div className="mt-4">
            <a
              href="https://github.com/haishanh/chaonima"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              查看项目源码 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
