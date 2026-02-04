<img width="128" height="128" alt="chaonima logo" src="https://github.com/user-attachments/assets/88a087bb-e96c-4676-87d6-4364cb0ff869" />

# chaonima

一个用于总结 V2EX 帖子和评论的浏览器扩展。

## Features

- 🤖 使用 AI 智能总结 V2EX 帖子和评论
- ⚙️ 支持自定义 API 配置（URL、密钥、模型）
- 🎯 支持所有 OpenAI 兼容的 AI 模型（GPT、Claude、本地模型等）
- 🔄 自动获取可用模型列表
- 🧠 支持启用/禁用思考模式（需要模型支持）
- 📊 显示获取评论进度
- 💾 本地存储配置，无需重新构建扩展
- 🎨 美观的设置界面

## Install

### 从源码构建安装

本项目目前**未在 Chrome Web Store 上架**，需要从源码构建安装。请按照以下步骤操作：

#### 1. 克隆仓库并安装依赖

```bash
git clone https://github.com/mybot102/chaonima.git
cd chaonima
bun install  # 或使用 npm install
```

#### 2. 构建扩展

```bash
cd packages/ext
bun run build  # 构建 Chrome 扩展
# 或
bun run build:firefox  # 构建 Firefox 扩展
```

构建完成后，扩展文件会生成在项目根目录的 `dist` 文件夹中：
- Chrome: `dist/chrome-mv3/`
- Firefox: `dist/firefox-mv2/`

#### 3. 在浏览器中加载扩展

**Chrome/Edge:**
1. 打开浏览器，访问 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录下的 `dist/chrome-mv3` 目录

**Firefox:**
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击"临时载入附加组件"
3. 选择项目根目录下的 `dist/firefox-mv2/manifest.json` 文件

> ⚠️ **重要提示**：不要尝试直接加载 `packages/ext` 源码目录，这会导致"清单文件缺失"错误。必须先构建，然后加载 `dist` 目录中的构建产物。

#### 4. 从 GitHub Actions 下载构建产物（推荐）

每次代码推送到 GitHub 后，GitHub Actions 会自动构建并打包扩展。你可以：
1. 访问仓库的 [Actions](https://github.com/mybot102/chaonima/actions) 页面
2. 选择最新的构建任务
3. 在 Artifacts 部分下载构建好的扩展 ZIP 包或构建目录
4. 解压后按照上述步骤加载到浏览器

## Configuration

安装扩展后，点击扩展图标，然后点击"⚙️ 设置"按钮即可配置：

- **OpenAI 基础地址**（可选）- 自定义 OpenAI API 端点（支持 Azure OpenAI、本地服务等，留空使用官方 API）
- **AI API Key** - AI 服务的 API 密钥（[OpenAI](https://platform.openai.com/api-keys) 或兼容 OpenAI API 的服务）
- **V2EX Personal Access Token** - 用于访问 V2EX API 获取帖子内容（[获取 Token](https://www.v2ex.com/settings/tokens)）
- **模型** - 选择常用模型、从 API 自动获取的可用模型，或输入自定义模型名称
- **思考模式** - 启用后，模型会显示其思考过程（需要模型支持）

### 架构说明

Chaonima 使用直连架构，无需独立后端服务器：

```
浏览器扩展 → V2EX API（获取内容）→ OpenAI 兼容 API
```

**工作流程：**
1. **获取内容**：使用 V2EX API 获取帖子和回复（固定端点：`https://www.v2ex.com/api/v2/`）
   - 自动翻页获取所有评论
   - 显示获取进度
2. **AI 总结**：调用 OpenAI 兼容 API 进行总结
   - 所有模型统一使用 OpenAI API 格式
   - 支持自定义 base URL（可用于 Azure OpenAI、本地服务等）
   - 流式显示 AI 生成的总结
   - 支持显示模型的思考过程（如果启用且模型支持）

**支持的 AI 端点：**
- ✅ OpenAI 官方 API（默认：`https://api.openai.com/v1`）
- ✅ Azure OpenAI（自定义 base URL）
- ✅ 本地 OpenAI 兼容服务（Ollama、LM Studio、vLLM 等）
- ✅ 其他兼容 OpenAI API 的服务

### 配置示例

#### 使用 OpenAI 官方 API
```
OpenAI 基础地址：（留空，使用默认值）
AI API Key: sk-proj-...
模型: gpt-4o 或 gpt-4o-mini
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
AI API Key: ollama（可留空，某些版本需要）
模型: llama3 或 qwen2.5
```

#### 使用本地 LM Studio
```
OpenAI 基础地址：http://localhost:1234/v1
AI API Key: lm-studio（可留空）
模型: 你本地运行的模型名称
```

#### 使用其他兼容 OpenAI API 的服务
```
OpenAI 基础地址：你的服务地址
AI API Key: 你的 API Key
模型: 服务支持的模型名称
```

> 💡 **提示**：设置页面支持自动获取可用模型列表。配置好 API Key 和基础地址后，点击"刷新模型列表"即可看到该服务支持的所有模型。

### V2EX API 使用

扩展使用 V2EX API 2.0 Beta 获取帖子内容：
- 固定端点：`https://www.v2ex.com/api/v2/`
- 无需页面跳转，用户体验更好
- 自动获取所有回复（支持分页）
- Rate Limit：120 次/小时

## Development

### 项目结构

- **`packages/ext`** - 浏览器扩展代码，使用 [WXT](https://wxt.dev/) 构建
- **`packages/preview`** - 基于 Vite 的 React 应用，用于预览扩展组件
- **`packages/api`** - Deno 后端服务（已弃用，扩展现在直接调用 AI API）

### 开发命令

```sh
# 安装依赖
bun install

# 开发模式运行扩展（Chrome）
cd packages/ext
bun run dev

# 开发模式运行扩展（Firefox）
cd packages/ext
bun run dev:firefox

# 构建生产版本（Chrome）
cd packages/ext
bun run build

# 构建生产版本（Firefox）
cd packages/ext
bun run build:firefox

# 打包成 ZIP（Chrome）
cd packages/ext
bun run zip

# 打包成 ZIP（Firefox）
cd packages/ext
bun run zip:firefox

# 开发预览应用
bun run -F preview dev
```

### 构建输出

构建产物位于项目根目录的 `dist` 文件夹：
- Chrome: `dist/chrome-mv3/`
- Firefox: `dist/firefox-mv2/`
- ZIP 包: `dist/*.zip`

### 📚 详细文档

- [扩展快速开始指南](./packages/ext/QUICK_START.md) - 如何构建和安装扩展
- [扩展开发文档](./packages/ext/README.md) - 开发和构建说明
- [API 文档](./packages/api/README.md) - 后端 API 文档

### ⚠️ 常见问题

**问：为什么浏览器提示"清单文件缺失"？**

答：你可能尝试直接加载源码目录。正确做法是：
1. 先运行 `cd packages/ext && bun run build` 构建扩展
2. 在浏览器中加载项目根目录下的 `dist/chrome-mv3` 目录

详见 [快速开始指南](./packages/ext/QUICK_START.md)。

**问：如何获取最新版本的扩展？**

答：本项目未在 Chrome Web Store 上架，获取最新版本的方式：
1. 从 GitHub Actions 下载构建产物（推荐）
2. 从源码构建安装

**问：支持哪些 AI 模型？**

答：支持所有兼容 OpenAI API 格式的模型，包括：
- OpenAI 官方模型（GPT-4o、GPT-4o-mini、GPT-3.5-turbo 等）
- Azure OpenAI 服务
- 本地模型（Ollama、LM Studio、vLLM 等）
- 其他兼容 OpenAI API 的服务

**问：如何获取可用模型列表？**

答：在设置页面配置好 API Key 和基础地址后，系统会自动获取可用模型列表，你也可以点击"刷新模型列表"手动刷新。

