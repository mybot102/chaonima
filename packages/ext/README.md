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

### 问题：依赖安装失败

如果 `bun install` 失败，可以尝试使用 npm：

```bash
npm install
npm run build
```

## Configuration

The extension now supports runtime configuration through the Settings page. Users can configure:

1. **API URL** - Custom API endpoint URL (defaults to env var `VITE_API_BASE_URL`)
2. **API Key** - API key for authentication (defaults to env var `VITE_API_KEY`)
3. **Model** - AI model selection (defaults to `gemini-2.5-flash-preview-09-2025`)
4. **Thinking Mode** - Enable/disable thinking mode for supported models

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
