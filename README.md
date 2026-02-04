<img width="128" height="128" alt="chaonima logo" src="https://github.com/user-attachments/assets/88a087bb-e96c-4676-87d6-4364cb0ff869" />

# chaonima

一个用于总结 V2EX 帖子和评论的浏览器扩展。

## Features

- 🤖 使用 AI 智能总结 V2EX 帖子和评论
- ⚙️ 支持自定义 API 配置（URL、密钥、模型）
- 🧠 支持启用/禁用思考模式
- 💾 本地存储配置，无需重新构建扩展
- 🎨 美观的设置界面

## Install

 <a href="https://chromewebstore.google.com/detail/chaonima-%E5%90%B5%E6%B3%A5%E9%A9%AC/hpjdgebpmeghdajniclmlfkbablmmnhc">Chrome Web Store</a>

## Configuration

安装扩展后，点击扩展图标，然后点击"⚙️ 设置"按钮即可配置：

- **API URL** - 自定义 API 端点 URL
- **API Key** - API 密钥
- **模型** - 选择要使用的 AI 模型（支持 Gemini 和 GPT 系列）
- **思考模式** - 启用后，模型会显示其思考过程

## Development

- __`packages/ext`__, browser extension code, the extension is built using [WXT](https://wxt.dev/).
- __`packages/api`__, a simple backend service built with Deno. The service is running on [Deno Deploy Classic](https://docs.deno.com/deploy/manual/).
- __`packages/preview`__, Vite based React app for preview components for the extension.

Some quick commands to get started:

```sh
# install deps
bun install

bun run -F ext dev
bun run -F preview dev
```
