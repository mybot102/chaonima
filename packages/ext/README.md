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

开发模式会在项目根目录的 `dist` 目录生成扩展文件：
- Chrome: 加载 `dist/chrome-mv3` 目录
- Firefox: 加载 `dist/firefox-mv2` 目录

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

打包后的 zip 文件位于项目根目录的 `dist` 目录。

## Troubleshooting

### 问题：清单文件缺失或不可读取

**症状：** 在浏览器中加载扩展时提示"清单文件缺失或不可读取"

**原因：** 尝试直接加载源码目录（`packages/ext`），而不是构建后的目录。

**解决方案：**
1. 确保已运行 `bun run build` 或 `bun run dev`
2. 在浏览器中加载项目根目录下的 `dist/chrome-mv3` 目录，而不是 `packages/ext` 目录
3. 检查 `dist/chrome-mv3` 目录是否存在且包含 `manifest.json` 文件

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
   - All models use OpenAI-compatible API format

2. **AI API Key** (Required) - API key for AI service
   - OpenAI: Get at https://platform.openai.com/api-keys
   - Or use API key from OpenAI-compatible services
   - Extension calls AI API directly (no backend proxy)

3. **V2EX Personal Access Token** (Required) - For V2EX API access
   - Get at: https://www.v2ex.com/settings/tokens
   - Used to fetch topic content and replies via V2EX API 2.0

4. **Model** - AI model selection
   - Select from common models (GPT series, Claude series)
   - Auto-fetch available models from API (if supported)
   - Or input custom model name
   - All models use OpenAI-compatible API format

5. **Thinking Mode** - Enable/disable thinking mode (requires model support)

### Architecture

```
Browser Extension → V2EX API (fetch content) → OpenAI-compatible API
```

**How it works:**
1. Extension fetches topic and replies from V2EX API 2.0 (fixed endpoint: `https://www.v2ex.com/api/v2/`)
   - Automatically paginates to fetch all comments
   - Shows progress during fetching
2. Extension calls OpenAI-compatible API for summarization
   - All models use OpenAI API format
   - Supports custom base URL (for Azure OpenAI, local services, etc.)
   - Streams results back to user
   - Supports thinking mode (if enabled and model supports it)

**Supported AI Endpoints:**
- ✅ OpenAI Official API (default: `https://api.openai.com/v1`)
- ✅ Azure OpenAI (custom base URL)
- ✅ Local OpenAI-compatible services (Ollama, LM Studio, vLLM, etc.)
- ✅ Other OpenAI-compatible services

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

#### Using Local LM Studio
```
OpenAI Base URL: http://localhost:1234/v1
AI API Key: lm-studio (can be empty)
Model: your-local-model-name
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

## Build Artifacts

构建产物位于项目根目录的 `dist` 文件夹：
- Chrome: `dist/chrome-mv3/`
- Firefox: `dist/firefox-mv2/`
- ZIP 包: `dist/*.zip`

### GitHub Actions 自动构建

每次代码推送到 GitHub 后，GitHub Actions 会自动：
1. 构建 Chrome 和 Firefox 扩展
2. 打包成 ZIP 文件
3. 上传构建产物作为 artifacts

你可以在 [Actions](https://github.com/mybot102/chaonima/actions) 页面下载构建好的扩展。

> ⚠️ **注意**：本项目目前未在 Chrome Web Store 上架，需要从源码构建或从 GitHub Actions 下载构建产物。
