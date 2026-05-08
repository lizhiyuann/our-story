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

echo "🚀 构建并启动服务（首次可能需要几分钟）..."
docker compose up -d --build

echo ""
echo "⏳ 等待服务就绪..."

# 等待各服务健康检查通过
check_health() {
    local name=$1
    local url=$2
    local max_wait=$3
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "   ✅ $name 就绪"
            return 0
        fi
        sleep 2
        waited=$((waited + 2))
    done
    echo "   ⚠️  $name 启动超时，请检查日志: docker compose logs $name"
    return 1
}

check_health "PostgreSQL" "http://localhost:5432" 30 2>/dev/null || true
check_health "AI Agent"   "http://localhost:8000/health" 60
check_health "后端 API"   "http://localhost:3001/api/health" 30
check_health "前端 + Nginx" "http://localhost:80" 30

echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅  Our Story 启动完成！"
echo "════════════════════════════════════════════════════"
echo ""
echo "  📱 服务地址"
echo "  ─────────────────────────────────────────"
echo "  🌐 网站入口:     http://localhost:80"
echo "  🎨 前端 (Vite):  http://localhost:3000"
echo "  ⚙️  后端 API:     http://localhost:3001"
echo "  🤖 AI Agent:     http://localhost:8000"
echo "  🐘 PostgreSQL:   localhost:5432"
echo ""
echo "  🏥 健康检查"
echo "  ─────────────────────────────────────────"
echo "  后端:  http://localhost:3001/api/health"
echo "  AI:    http://localhost:8000/health"
echo ""
echo "  👤 默认账号（可在 .env 中修改）"
echo "  ─────────────────────────────────────────"
echo "  用户 1: boy  / .env 中 USER1_PASSWORD"
echo "  用户 2: girl / .env 中 USER2_PASSWORD"
echo ""
echo "  📋 常用命令"
echo "  ─────────────────────────────────────────"
echo "  查看日志:   docker compose logs -f"
echo "  查看状态:   docker compose ps"
echo "  停止服务:   ./stop.sh"
echo "  重启服务:   docker compose restart"
echo ""
