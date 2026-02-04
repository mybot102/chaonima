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
