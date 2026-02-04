import { useState, useEffect } from 'react';
import { getConfig, saveConfig, resetConfig, type Config } from '@/utils/storage.utils';
import { ChaonimaLogo } from 'preview/react';
import { fetchModelsList } from '@/utils/ai-client.utils';

// 预定义的常用模型（所有模型都使用 OpenAI 兼容 API）
const COMMON_MODELS = [
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
    model: 'gpt-4o-mini',
    enableThinking: false,
    v2exToken: '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name?: string }>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    // 检查当前模型是否在预定义列表或可用模型列表中
    const isInCommonList = COMMON_MODELS.some(m => m.value === config.model);
    const isInAvailableList = availableModels.some(m => m.id === config.model);
    setIsCustomModel(!isInCommonList && !isInAvailableList && config.model !== '');
  }, [config.model, availableModels]);

  // 当 API 配置变化时，自动获取模型列表
  useEffect(() => {
    if (config.apiKey && config.apiUrl !== undefined) {
      loadModelsList();
    }
  }, [config.apiKey, config.apiUrl]);

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
      if (COMMON_MODELS.some(m => m.value === config.model) || 
          availableModels.some(m => m.id === config.model)) {
        setConfig({ ...config, model: '' });
      }
    } else {
      setIsCustomModel(false);
      setConfig({ ...config, model: value });
    }
  };

  const loadModelsList = async () => {
    if (!config.apiKey) {
      setAvailableModels([]);
      setModelsError(null);
      return;
    }

    setLoadingModels(true);
    setModelsError(null);

    try {
      const models = await fetchModelsList(config.apiKey, config.apiUrl);
      setAvailableModels(models);
      if (models.length === 0) {
        setModelsError('未获取到模型列表（API 可能不支持此功能）');
      }
    } catch (error) {
      console.error('Failed to load models list:', error);
      setModelsError('获取模型列表失败');
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
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
            {/* OpenAI Base URL */}
            <div>
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI 基础地址（可选）
              </label>
              <input
                type="url"
                id="apiUrl"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                OpenAI API 的基础地址（留空使用默认值）
              </p>
              <p className="mt-1 text-xs text-blue-600">
                💡 支持自定义端点：Azure OpenAI、本地服务（Ollama/LM Studio）等
              </p>
            </div>

            {/* AI API Key */}
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                AI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="OpenAI: sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                您的 AI 服务 API 密钥（OpenAI 或兼容 OpenAI API 的服务）
              </p>
              <p className="mt-1 text-xs text-blue-600">
                💡 获取 API Key：
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800 ml-1"
                >
                  OpenAI
                </a>
                {' '}或使用兼容 OpenAI API 的服务（Azure OpenAI、本地服务等）
              </p>
            </div>

            {/* Model */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  模型
                </label>
                {config.apiKey && (
                  <button
                    type="button"
                    onClick={loadModelsList}
                    disabled={loadingModels}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {loadingModels ? '加载中...' : '刷新模型列表'}
                  </button>
                )}
              </div>
              <select
                id="model"
                value={isCustomModel ? 'custom' : config.model}
                onChange={(e) => handleModelSelectChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="常用模型">
                  {COMMON_MODELS.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </optgroup>
                {availableModels.length > 0 && (
                  <optgroup label="可用模型">
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name || model.id}
                      </option>
                    ))}
                  </optgroup>
                )}
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
              {loadingModels && (
                <p className="mt-1 text-xs text-blue-600">正在获取模型列表...</p>
              )}
              {modelsError && !loadingModels && (
                <p className="mt-1 text-xs text-orange-600">{modelsError}</p>
              )}
              {availableModels.length > 0 && !loadingModels && (
                <p className="mt-1 text-xs text-green-600">
                  已获取 {availableModels.length} 个可用模型
                </p>
              )}
            </div>

            {/* V2EX Token */}
            <div>
              <label htmlFor="v2exToken" className="block text-sm font-medium text-gray-700 mb-2">
                V2EX Personal Access Token
              </label>
              <input
                type="password"
                id="v2exToken"
                value={config.v2exToken}
                onChange={(e) => setConfig({ ...config, v2exToken: e.target.value })}
                placeholder="bd1f2c67-cc7f-48e3-a48a-e5b88b427146"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                用于访问 V2EX API 获取帖子内容和回复
              </p>
              <p className="mt-1 text-xs text-blue-600">
                💡 如何获取 Token：访问{' '}
                <a 
                  href="https://www.v2ex.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-800"
                >
                  V2EX 设置 - Tokens
                </a>
                {' '}创建新的 Personal Access Token
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
                启用后，模型会显示其思考过程（需要模型支持）
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
              ℹ️ 架构说明
            </p>
            <p className="text-xs text-blue-700 text-left">
              Chaonima 使用直连架构，无需独立后端服务器：<br/>
              <span className="font-mono">浏览器扩展 → V2EX API（获取内容）→ OpenAI 兼容 API</span><br/><br/>
              • <strong>V2EX Token</strong>：用于从 V2EX 获取帖子和回复数据<br/>
              • <strong>OpenAI 基础地址</strong>：自定义 AI API 端点（可选，支持 Azure OpenAI、本地服务等）<br/>
              • <strong>AI API Key</strong>：用于调用 OpenAI 或兼容 OpenAI API 的服务<br/>
              • <strong>模型选择</strong>：所有模型都使用 OpenAI 兼容 API 格式<br/>
              • V2EX API 固定使用官方地址：https://www.v2ex.com/api/v2/
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
