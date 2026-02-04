# 故障排除指南

## 问题：清单文件缺失或不可读取

### 错误信息
```
未能成功加载扩展程序
错误：清单文件缺失或不可读取
无法加载清单。
```

### 问题原因

这个错误通常发生在你尝试直接在浏览器中加载**源代码目录**时。浏览器扩展需要经过构建步骤才能生成可加载的文件，包括 `manifest.json`。

### 正确 vs 错误的做法

#### ❌ 错误做法
```
加载目录：/path/to/chaonima/packages/ext
          └── 这是源代码目录，没有 manifest.json
```

#### ✅ 正确做法
```
加载目录：/path/to/chaonima/packages/ext/.output/chrome-mv3
          └── 这是构建后的目录，包含 manifest.json
```

### 解决步骤

#### 步骤 1: 确认你有必要的工具

```bash
# 检查是否安装了 Bun 或 Node.js
bun --version
# 或
node --version
```

如果没有安装，请先安装：
```bash
# 安装 Bun（推荐）
curl -fsSL https://bun.sh/install | bash

# 或使用 Node.js (v18+)
# 访问 https://nodejs.org/
```

#### 步骤 2: 安装依赖

```bash
cd /path/to/chaonima
bun install
```

#### 步骤 3: 构建扩展

```bash
cd packages/ext
bun run build
```

你应该看到类似这样的输出：
```
✓ Building extension for chrome-mv3
✓ Built in XXXms
```

#### 步骤 4: 验证构建

运行检查脚本：
```bash
bun run check
```

或手动检查：
```bash
ls .output/chrome-mv3/manifest.json
```

如果看到 `manifest.json` 文件存在，说明构建成功！

#### 步骤 5: 在浏览器中加载

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. **重要**：导航到并选择 `packages/ext/.output/chrome-mv3` 目录

### 快速诊断检查清单

- [ ] 是否在 `packages/ext` 目录中？
- [ ] 是否运行了 `bun install`？
- [ ] 是否运行了 `bun run build`？
- [ ] `.output/chrome-mv3` 目录是否存在？
- [ ] `.output/chrome-mv3/manifest.json` 文件是否存在？
- [ ] 在浏览器中是否加载了 `.output/chrome-mv3` 而不是 `packages/ext`？

### 仍然有问题？

#### 问题：构建失败

如果 `bun run build` 失败，尝试：

1. 清理并重新构建
```bash
rm -rf .output .wxt node_modules
bun install
bun run build
```

2. 使用 npm 代替 bun
```bash
npm install
npm run build
```

#### 问题：依赖安装失败

如果网络问题导致依赖安装失败：

1. 使用国内镜像（如果在中国）
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install
```

2. 或使用 VPN/代理

#### 问题：构建成功但扩展不工作

1. 检查浏览器控制台错误
2. 确认已配置 API 设置（点击扩展图标 -> 设置）
3. 检查环境变量是否正确（如果使用默认配置）

### 获取更多帮助

- 查看 [QUICK_START.md](./QUICK_START.md)
- 查看主项目 [README.md](../../README.md)
- 在 GitHub 提交 Issue：https://github.com/mybot102/chaonima/issues

### 目录结构说明

```
chaonima/
├── packages/
│   └── ext/                    ← 扩展源代码
│       ├── src/                ← 源代码文件
│       ├── public/             ← 静态资源
│       ├── wxt.config.ts       ← 构建配置
│       ├── package.json        ← 依赖和脚本
│       └── .output/            ← 构建输出（构建后才有）
│           ├── chrome-mv3/     ← Chrome 扩展（加载这个！）
│           │   └── manifest.json
│           └── firefox-mv2/    ← Firefox 扩展
│               └── manifest.json
```

**记住：永远加载 `.output/chrome-mv3` 目录，不是 `packages/ext` 目录！**
