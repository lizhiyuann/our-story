#!/bin/bash
# Our Story 本地开发启动脚本（热更新模式）
set -e

cd "$(dirname "$0")"

echo "❤️  Our Story 开发模式启动..."
echo ""

# 检查 .env
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📋 已创建 .env，请先编辑配置"
    exit 1
fi

# 启动数据库
echo "🐘 启动 PostgreSQL..."
docker compose up db -d

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
sleep 3

# 启动 AI Agent（后台）
echo "🤖 启动 AI Agent (端口 8000)..."
cd ai-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python app.py &
AI_PID=$!
cd ..

# 启动后端（后台）
echo "⚙️  启动后端 (端口 3001)..."
cd server
npm install --silent
npm run db:push 2>/dev/null || true
npm run dev &
SERVER_PID=$!
cd ..

# 启动前端
echo "🎨 启动前端 (端口 3000)..."
cd client
npm install --silent
echo ""
echo "✅ 所有服务已启动！"
echo ""
echo "   🌐 前端: http://localhost:3000"
echo "   ⚙️  后端: http://localhost:3001"
echo "   🤖 AI:   http://localhost:8000/health"
echo "   🐘 数据库: localhost:5432"
echo ""
echo "   按 Ctrl+C 停止所有服务"
echo ""

# 捕获退出信号，清理后台进程
trap "echo ''; echo '🛑 停止服务...'; kill $AI_PID $SERVER_PID 2>/dev/null; docker compose down; echo '✅ 已停止'; exit 0" INT TERM

# 前台运行前端（阻塞）
npm run dev
