#!/bin/bash

# 扩展构建检查脚本
# Extension Build Check Script

set -e

echo "🔍 检查 Chaonima 扩展构建状态..."
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "wxt.config.ts" ]; then
    echo "❌ 错误：请在 packages/ext 目录中运行此脚本"
    echo "   cd packages/ext && bash check-build.sh"
    exit 1
fi

echo "✓ 当前目录正确"

# 检查 .output 目录
if [ ! -d ".output" ]; then
    echo "❌ .output 目录不存在"
    echo "   需要先构建扩展：bun run build"
    exit 1
fi

echo "✓ .output 目录存在"

# 检查 Chrome 构建
if [ -d ".output/chrome-mv3" ]; then
    echo "✓ Chrome 构建目录存在"
    
    if [ -f ".output/chrome-mv3/manifest.json" ]; then
        echo "✓ manifest.json 文件存在"
        
        # 显示 manifest 信息
        if command -v jq &> /dev/null; then
            NAME=$(jq -r '.name' .output/chrome-mv3/manifest.json)
            VERSION=$(jq -r '.version' .output/chrome-mv3/manifest.json)
            echo "  扩展名称: $NAME"
            echo "  版本: $VERSION"
        fi
    else
        echo "❌ manifest.json 文件不存在"
        exit 1
    fi
else
    echo "❌ Chrome 构建目录不存在"
    echo "   运行：bun run build"
    exit 1
fi

# 创建 .output 目录的 README
cat > .output/README.md << 'EOFREADME'
# .output 目录

这个目录包含构建后的浏览器扩展文件。

## 📂 目录结构

```
.output/
├── chrome-mv3/          ← Chrome/Edge 扩展（Manifest V3）
│   ├── manifest.json    ← 扩展清单文件
│   ├── background.js    ← 后台脚本
│   └── ...              ← 其他资源文件
│
└── firefox-mv2/         ← Firefox 扩展（Manifest V2，如果构建了）
    └── ...
```

## 🚀 如何加载扩展

### Chrome/Edge

1. 打开 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. **选择 `chrome-mv3` 目录**

### Firefox

1. 先构建 Firefox 版本：`bun run build:firefox`
2. 打开 `about:debugging#/runtime/this-firefox`
3. 点击"临时载入附加组件"
4. 选择 `firefox-mv2/manifest.json` 文件

## ⚠️ 重要提示

- ✅ **正确**：在浏览器中加载此目录（`.output/chrome-mv3`）
- ❌ **错误**：不要加载上级的源码目录（`packages/ext`）

如果加载源码目录，会出现"清单文件缺失"错误！

## 🔄 重新构建

修改源代码后需要重新构建：

```bash
cd packages/ext

# 生产构建
bun run build

# 开发模式（自动监听变化）
bun run dev
```

## 📝 注意事项

- 此目录在 `.gitignore` 中，不会提交到 Git
- 每个开发者需要自己运行构建命令
- 开发模式下文件会自动更新

## 🆘 需要帮助？

- [快速开始指南](../QUICK_START.md)
- [故障排除指南](../TROUBLESHOOTING.md)
- [开发文档](../README.md)
EOFREADME

echo ""
echo "================================"
echo "✅ 构建检查通过！"
echo ""
echo "📍 在 Chrome 中加载此目录："
echo "   $(pwd)/.output/chrome-mv3"
echo ""
echo "📝 加载步骤："
echo "   1. 打开 chrome://extensions/"
echo "   2. 启用'开发者模式'"
echo "   3. 点击'加载已解压的扩展程序'"
echo "   4. 选择上面的目录"
echo ""
echo "💡 提示：已在 .output 目录创建 README.md 供参考"
echo ""
