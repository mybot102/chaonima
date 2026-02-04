# 快速开始指南 Quick Start Guide

## 🚀 快速安装扩展

### 从源码构建安装

> ⚠️ **注意**：本项目目前**未在 Chrome Web Store 上架**，需要从源码构建安装。

### 方法 1: 从 GitHub Actions 下载构建产物（推荐）

每次代码推送到 GitHub 后，GitHub Actions 会自动构建并打包扩展：
1. 访问仓库的 [Actions](https://github.com/mybot102/chaonima/actions) 页面
2. 选择最新的构建任务
3. 在 Artifacts 部分下载构建好的扩展 ZIP 包
4. 解压后按照下面的步骤加载到浏览器

### 方法 2: 从源码构建（开发者）

#### 步骤 1: 安装 Bun (推荐) 或 Node.js

```bash
# 安装 Bun（推荐）
curl -fsSL https://bun.sh/install | bash

# 或者使用 Node.js (需要 v18+)
```

#### 步骤 2: 克隆并安装依赖

```bash
git clone https://github.com/mybot102/chaonima.git
cd chaonima
bun install
```

#### 步骤 3: 构建扩展

```bash
cd packages/ext
bun run build
```

构建完成后，你会看到：
```
✓ Building extension for chrome-mv3
✓ Built in XXXms
```

构建产物位于项目根目录的 `dist` 文件夹：
- Chrome: `dist/chrome-mv3/`
- Firefox: `dist/firefox-mv2/`

#### 步骤 4: 在 Chrome 中加载

1. 打开 Chrome 浏览器
2. 地址栏输入 `chrome://extensions/` 并回车
3. 打开右上角的 **"开发者模式"** 开关
4. 点击 **"加载已解压的扩展程序"**
5. 导航到项目根目录下的 `dist/chrome-mv3` 目录并选择
6. 完成！扩展已安装

#### 步骤 5: 配置 API

1. 点击浏览器工具栏中的扩展图标
2. 点击 **"⚙️ 设置"** 按钮
3. 配置你的 API URL、API Key 和模型
4. 点击保存

## ⚠️ 常见错误

### 错误：清单文件缺失或不可读取

**原因：** 你尝试加载了源码目录 `packages/ext` 而不是构建后的目录。

**解决：**
- ✅ 正确：加载项目根目录下的 `dist/chrome-mv3`
- ❌ 错误：加载 `packages/ext`

**检查清单：**
```bash
# 确认构建目录存在
ls dist/chrome-mv3/manifest.json

# 如果文件不存在，运行构建
cd packages/ext
bun run build
```

### 错误：bun install 失败

如果 bun 安装依赖失败，可以使用 npm：

```bash
npm install
cd packages/ext
npm run build
```

## 🔧 开发模式

如果你想开发或修改扩展：

```bash
cd packages/ext
bun run dev
```

这会启动开发服务器，自动监听文件变化。加载项目根目录下的 `dist/chrome-mv3` 目录到浏览器后，修改代码会自动重新编译。

## 📝 需要帮助？

- 查看 [故障排除指南](./TROUBLESHOOTING.md) - 详细的问题诊断和解决方案
- 查看 [README.md](../../README.md) 获取更多信息
- 查看 [packages/ext/README.md](./README.md) 获取开发文档
- 提交 Issue 到 GitHub
