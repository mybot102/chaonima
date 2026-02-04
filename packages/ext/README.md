## Development

### 开发环境设置

1. **安装依赖**

```bash
cd packages/ext
cp env.example .env

# 填写 .env 文件中的环境变量
# VITE_API_KEY="your-api-key"
# VITE_API_BASE_URL="your-api-url"

bun install  # 或使用 npm install
```

2. **开发模式运行**

```bash
bun run dev  # Chrome
# 或
bun run dev:firefox  # Firefox
```

开发模式会自动监听文件变化并重新构建。

3. **在浏览器中加载**

开发模式会在 `.output` 目录生成扩展文件：
- Chrome: 加载 `.output/chrome-mv3` 目录
- Firefox: 加载 `.output/firefox-mv2` 目录

## Build for Production

### 构建扩展

```bash
bun run build        # Chrome
bun run build:firefox  # Firefox
```

### 打包成 ZIP

```bash
bun run zip        # Chrome
bun run zip:firefox  # Firefox
```

打包后的 zip 文件位于 `.output` 目录，可用于发布到扩展商店。

## Troubleshooting

### 问题：清单文件缺失或不可读取

**症状：** 在浏览器中加载扩展时提示"清单文件缺失或不可读取"

**原因：** 尝试直接加载源码目录（`packages/ext`），而不是构建后的目录。

**解决方案：**
1. 确保已运行 `bun run build` 或 `bun run dev`
2. 在浏览器中加载 `packages/ext/.output/chrome-mv3` 目录，而不是 `packages/ext` 目录
3. 检查 `.output` 目录是否存在且包含 `manifest.json` 文件

运行构建检查脚本：
```bash
bun run check
```

**详细诊断步骤：** 查看 [故障排除指南](./TROUBLESHOOTING.md)

### 问题：依赖安装失败

如果 `bun install` 失败，可以尝试使用 npm：

```bash
npm install
npm run build
```

### 更多帮助

- [快速开始指南](./QUICK_START.md) - 完整的安装和构建步骤
- [故障排除指南](./TROUBLESHOOTING.md) - 详细的问题诊断

## Configuration

The extension supports runtime configuration through the Settings page:

1. **OpenAI Base URL** (Optional) - Custom OpenAI API endpoint
   - Leave empty to use official OpenAI API (`https://api.openai.com/v1`)
   - Azure OpenAI: `https://your-resource.openai.azure.com`
   - Local services: `http://localhost:11434/v1` (Ollama), `http://localhost:1234/v1` (LM Studio)
   - Only affects OpenAI/GPT models, Gemini models use fixed endpoint

2. **AI API Key** (Required) - API key for AI service
   - Gemini: Get at https://aistudio.google.com/app/apikey
   - OpenAI: Get at https://platform.openai.com/api-keys
   - Extension calls AI API directly (no backend proxy)

3. **V2EX Personal Access Token** (Required) - For V2EX API access
   - Get at: https://www.v2ex.com/settings/tokens
   - Used to fetch topic content and replies via V2EX API 2.0

4. **Model** - AI model selection
   - Select from common models: Gemini, GPT series
   - Or input custom model name
   - Auto-detects API provider based on model name

5. **Thinking Mode** - Enable/disable thinking mode (Gemini models only)

### Architecture

```
Browser Extension → V2EX API (fetch content) → AI API (Gemini/OpenAI)
```

**How it works:**
1. Extension fetches topic and replies from V2EX API 2.0 (fixed endpoint: `https://www.v2ex.com/api/v2/`)
2. Extension calls AI API based on model type:
   - Gemini models → Gemini API (fixed endpoint)
   - GPT models → OpenAI API (customizable base URL)
3. Results stream back to user

**Supported AI Endpoints:**
- ✅ OpenAI Official API (default)
- ✅ Azure OpenAI (custom base URL)
- ✅ Local OpenAI-compatible services (Ollama, LM Studio)
- ✅ Gemini API (fixed endpoint)

### Configuration Examples

#### Using OpenAI Official API
```
OpenAI Base URL: (leave empty)
AI API Key: sk-proj-...
Model: gpt-4o
```

#### Using Azure OpenAI
```
OpenAI Base URL: https://your-resource.openai.azure.com
AI API Key: your-azure-key
Model: gpt-4o
```

#### Using Local Ollama
```
OpenAI Base URL: http://localhost:11434/v1
AI API Key: (can be empty)
Model: llama3
```

#### Using Google Gemini
```
OpenAI Base URL: (leave empty or any, doesn't affect Gemini)
AI API Key: AIza...
Model: gemini-2.5-flash-preview-09-2025
```

### V2EX API

The extension uses V2EX API 2.0 Beta to fetch topic content:
- Fixed endpoint: `https://www.v2ex.com/api/v2/`
- No page navigation required (better UX)
- Automatically fetches all replies (pagination handled)
- Rate limit: 120 requests/hour

To access settings:
- Click the extension icon in your browser
- Click the "⚙️ 设置" button
- Or right-click the extension icon and select "Options"

## Publish

For Chrome only

1. Bump verion in `package.json`
2. Build and zip

    ```bash
    bun run build
    bun run zip
    ````

3. Go to the _Chrome Web Store Developer Dashbaord_ page of the extension. Select "Upload new package". Select the zip file named like `ext-x.x.x-chrome.zip` from the `.output` dir.
