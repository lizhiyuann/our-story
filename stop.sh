#!/bin/bash
# Our Story 停止脚本
cd "$(dirname "$0")"

echo "🛑 停止服务..."
docker compose down

echo "✅ 已停止"
