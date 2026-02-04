import { useState, useEffect } from 'react';
import { getConfig, saveConfig, resetConfig, type Config } from '@/utils/storage.utils';
import { ChaonimaLogo } from 'preview/react';

// 预定义的常用模型
const COMMON_MODELS = [
  { value: 'gemini-2.5-flash-preview-09-2025', label: 'Gemini 2.5 Flash Preview' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Experimental' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
];

function App() {
  const [config, setConfig] = useState<Config>({
    apiUrl: '',
    apiKey: '',
    model: 'gemini-2.5-flash-preview-09-2025',
    enableThinking: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCustomModel, setIsCustomModel] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // 检查当前模型是否在预定义列表中
    const isInList = COMMON_MODELS.some(m => m.value === config.model);
    setIsCustomModel(!isInList && config.model !== '');
  }, [config.model]);

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
      setIsCustomModel(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to reset config:', error);
    }
  };

  const handleModelSelectChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomModel(true);
      // 保持当前模型值或清空
      if (COMMON_MODELS.some(m => m.value === config.model)) {
        setConfig({ ...config, model: '' });
      }
    } else {
      setIsCustomModel(false);
      setConfig({ ...config, model: value });
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
          <p className="mt-2 text-gray-600">配置后端服务和 AI 模型偏好</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            {/* API URL */}
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                后端 API 地址
              </label>
              <input
                type="url"
                id="apiUrl"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://your-backend-server.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Chaonima 后端服务的地址（留空使用默认服务器）
              </p>
              <p className="mt-1 text-xs text-gray-400">
                ⚠️ 注意：这不是 OpenAI/Gemini API 地址，而是 Chaonima 后端代理服务器地址
              </p>
            </div>

            {/* API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                后端 API 密钥
              </label>
              <input
                type="password"
                id="apiKey"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="your-backend-api-key"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Chaonima 后端服务的访问密钥（留空使用默认服务器）
              </p>
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <select
                id="model"
                value={isCustomModel ? 'custom' : config.model}
                onChange={(e) => handleModelSelectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_MODELS.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
                <option value="custom">自定义模型...</option>
              </select>
              
              {isCustomModel && (
                <div className="mt-3">
                  <label htmlFor="customModel" className="block text-sm font-medium text-gray-700 mb-2">
                    自定义模型名称
                  </label>
                  <input
                    type="text"
                    id="customModel"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="例如: claude-3-opus-20240229"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    输入任意 OpenAI 兼容的模型名称
                  </p>
                </div>
              )}
              
              <p className="mt-1 text-sm text-gray-500">
                选择常用模型或输入自定义模型名称
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              ℹ️ 关于架构说明
            </p>
            <p className="text-xs text-blue-700 text-left">
              Chaonima 使用三层架构：<br/>
              <span className="font-mono">浏览器扩展 → 后端代理服务 → AI 服务（Gemini/OpenAI/Claude）</span><br/><br/>
              • <strong>后端 API 地址</strong>：Chaonima 后端服务器，用于代理和缓存 AI 请求<br/>
              • <strong>模型选择</strong>：后端服务器会将您的选择转发给对应的 AI 服务<br/>
              • 默认情况下使用公共后端服务器，您也可以部署自己的后端服务
            </p>
          </div>
          <p className="text-sm text-gray-500">
            需要帮助？查看 <a href="https://github.com/haishanh/chaonima" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">项目文档</a>
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
