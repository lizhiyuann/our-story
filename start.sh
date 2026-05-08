#!/bin/bash
# Our Story 一键启动脚本（Docker Compose 模式）
set -e

cd "$(dirname "$0")"

echo "❤️  Our Story 启动中..."
echo ""

# 检查 .env
if [ ! -f .env ]; then
    echo "📋 未检测到 .env 文件，从模板创建..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件，修改密码和 API Key"
    echo "   vim .env"
    echo ""
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未安装 Docker，请先安装: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ 未安装 Docker Compose v2，请先安装: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "🚀 启动服务..."
docker compose up -d --build

echo ""
echo "✅ 启动完成！"
echo ""
echo "   🌐 访问地址: http://localhost"
echo "   📊 AI Agent:  http://localhost:8000/health"
echo ""
echo "   📝 默认账号（可在 .env 中修改）:"
echo "      用户 1: boy / .env 中 USER1_PASSWORD"
echo "      用户 2: girl / .env 中 USER2_PASSWORD"
echo ""
echo "   📋 常用命令:"
echo "      查看日志: docker compose logs -f"
echo "      停止服务: docker compose down"
echo "      重启服务: docker compose restart"
echo "      查看状态: docker compose ps"
echo ""
