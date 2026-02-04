<img width="128" height="128" alt="chaonima logo" src="https://github.com/user-attachments/assets/88a087bb-e96c-4676-87d6-4364cb0ff869" />

# chaonima

一个用于总结 V2EX 帖子和评论的浏览器扩展。

## Features

- 🤖 使用 AI 智能总结 V2EX 帖子和评论
- ⚙️ 支持自定义 API 配置（URL、密钥、模型）
- 🎯 支持多种 AI 模型（Gemini、GPT、Claude）及自定义模型
- 🧠 支持启用/禁用思考模式
- 💾 本地存储配置，无需重新构建扩展
- 🎨 美观的设置界面

## Install

### 方式一：从 Chrome Web Store 安装（推荐）

 <a href="https://chromewebstore.google.com/detail/chaonima-%E5%90%B5%E6%B3%A5%E9%A9%AC/hpjdgebpmeghdajniclmlfkbablmmnhc">Chrome Web Store</a>

### 方式二：从源码构建安装

如果你想从源码安装或进行开发，请按照以下步骤操作：

#### 1. 克隆仓库并安装依赖

```bash
git clone https://github.com/mybot102/chaonima.git
cd chaonima
bun install  # 或使用 npm install
```

#### 2. 构建扩展

```bash
cd packages/ext
bun run build  # 或使用 npm run build
```

构建完成后，扩展文件会生成在 `packages/ext/.output/chrome-mv3` 目录中。

#### 3. 在浏览器中加载扩展

**Chrome/Edge:**
1. 打开浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `packages/ext/.output/chrome-mv3` 目录

**Firefox:**
```bash
# 使用 Firefox 构建
bun run build:firefox
```
然后访问 `about:debugging#/runtime/this-firefox`，点击"临时载入附加组件"，选择 `packages/ext/.output/firefox-mv2/manifest.json`。

> ⚠️ **重要提示**：不要尝试直接加载 `packages/ext` 源码目录，这会导致"清单文件缺失"错误。必须先构建，然后加载 `.output` 目录中的构建产物。

## Configuration

安装扩展后，点击扩展图标，然后点击"⚙️ 设置"按钮即可配置：

- **OpenAI 基础地址**（可选）- 自定义 OpenAI API 端点（支持 Azure OpenAI、本地服务等，留空使用官方 API）
- **AI API Key** - AI 服务的 API 密钥（[Gemini](https://aistudio.google.com/app/apikey) 或 [OpenAI](https://platform.openai.com/api-keys)）
- **V2EX Personal Access Token** - 用于访问 V2EX API 获取帖子内容（[获取 Token](https://www.v2ex.com/settings/tokens)）
- **模型** - 选择 AI 模型（Gemini、GPT 系列）或输入自定义模型名称
- **思考模式** - 启用后，模型会显示其思考过程（仅支持 Gemini 模型）

### 架构说明

Chaonima 使用直连架构，无需独立后端服务器：

```
浏览器扩展 → V2EX API（获取内容）→ AI API（Gemini/OpenAI）
```

**工作流程：**
1. **获取内容**：使用 V2EX API 获取帖子和回复（固定端点：`https://www.v2ex.com/api/v2/`）
2. **AI 总结**：根据模型类型调用对应 AI API
   - Gemini 模型 → Gemini API
   - GPT 模型 → OpenAI API（支持自定义 base URL）
3. **显示结果**：流式显示 AI 生成的总结

**支持的 AI 端点：**
- ✅ OpenAI 官方 API（默认）
- ✅ Azure OpenAI（自定义 base URL）
- ✅ 本地 OpenAI 兼容服务（Ollama、LM Studio 等）
- ✅ Gemini API（固定端点）

### 配置示例

#### 使用 OpenAI 官方 API
```
OpenAI 基础地址：（留空）
AI API Key: sk-proj-...
模型: gpt-4o
```

#### 使用 Azure OpenAI
```
OpenAI 基础地址：https://your-resource.openai.azure.com
AI API Key: Azure API Key
模型: gpt-4o
```

#### 使用本地 Ollama
```
OpenAI 基础地址：http://localhost:11434/v1
AI API Key: 可留空
模型: llama3
```

#### 使用 Google Gemini
```
OpenAI 基础地址：（留空或任意，不影响）
AI API Key: AIza...
模型: gemini-2.5-flash-preview-09-2025
```

### V2EX API 使用

扩展使用 V2EX API 2.0 Beta 获取帖子内容：
- 固定端点：`https://www.v2ex.com/api/v2/`
- 无需页面跳转，用户体验更好
- 自动获取所有回复（支持分页）
- Rate Limit：120 次/小时

## Development

- __`packages/ext`__, browser extension code, the extension is built using [WXT](https://wxt.dev/).
- __`packages/api`__, a simple backend service built with Deno. The service is running on [Deno Deploy Classic](https://docs.deno.com/deploy/manual/).
- __`packages/preview`__, Vite based React app for preview components for the extension.

Some quick commands to get started:

```sh
# install deps
bun install

# develop the extension
bun run -F ext dev

# build the extension for production
bun run -F ext build

# develop the preview app
bun run -F preview dev
```

### 📚 详细文档

- [扩展快速开始指南](./packages/ext/QUICK_START.md) - 如何构建和安装扩展
- [扩展开发文档](./packages/ext/README.md) - 开发和构建说明
- [API 文档](./packages/api/README.md) - 后端 API 文档

### ⚠️ 常见问题

**问：为什么浏览器提示"清单文件缺失"？**

答：你可能尝试直接加载源码目录。正确做法是：
1. 先运行 `bun run -F ext build` 构建扩展
2. 在浏览器中加载 `packages/ext/.output/chrome-mv3` 目录

详见 [快速开始指南](./packages/ext/QUICK_START.md)。

