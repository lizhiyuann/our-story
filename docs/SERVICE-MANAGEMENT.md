# Our Story 服务管理指南

本文档说明如何启动、停止、重启和监控 Our Story 的各个服务。

---

## 目录

- [服务概览](#服务概览)
- [一键启动（Docker）](#一键启动docker)
- [本地开发启动](#本地开发启动)
- [停止服务](#停止服务)
- [重启服务](#重启服务)
- [服务状态检查](#服务状态检查)
- [日志查看](#日志查看)
- [故障排除](#故障排除)

---

## 服务概览

| 服务 | 端口 | 技术栈 | 说明 |
|---|---|---|---|
| PostgreSQL | 5432 | PostgreSQL 16 | 数据库 |
| AI Agent | 8000 | Python + FastAPI | AI 智能助手 |
| Server | 3001 | Node.js + Fastify | 后端 API |
| Client | 3000 | React + Vite | 前端（开发模式） |
| Nginx | 80 | Nginx | 反向代理（Docker 模式） |

---

## 一键启动（Docker）

### 启动所有服务

```bash
# 方式 1：使用启动脚本（推荐）
./start.sh

# 方式 2：手动启动
cp .env.example .env   # 首次需要配置
docker compose up -d
```

### 停止所有服务

```bash
# 方式 1：使用停止脚本（推荐）
./stop.sh

# 方式 2：手动停止
docker compose down
```

### 重启所有服务

```bash
docker compose restart
```

### 查看服务状态

```bash
docker compose ps
```

### 查看日志

```bash
# 所有服务日志
docker compose logs -f

# 指定服务日志
docker compose logs -f server
docker compose logs -f ai-service
docker compose logs -f client
```

---

## 本地开发启动

本地开发模式支持热更新，修改代码后自动刷新。

### 一键启动

```bash
./dev.sh
```

脚本会自动：
1. 检查并启动 PostgreSQL
2. 启动 AI Agent（端口 8000）
3. 启动后端（端口 3001）
4. 启动前端（端口 3000）

### 手动分步启动

如果需要单独控制每个服务：

#### 1. 启动 PostgreSQL

```bash
# 使用 Docker 启动数据库
docker compose up db -d

# 或使用本地 PostgreSQL（如果已安装）
pg_ctl -D /path/to/data start
```

#### 2. 启动 AI Agent

```bash
cd ai-service

# 安装依赖（首次）
pip install -r requirements.txt
# 或使用 uv
uv pip install -r requirements.txt

# 启动服务
python app.py
```

服务启动后会显示：
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 3. 启动后端

```bash
cd server

# 安装依赖（首次）
npm install

# 创建数据库表（首次）
npm run db:push

# 启动开发服务器
npm run dev
```

服务启动后会显示：
```
Server running on port 3001
```

#### 4. 启动前端

```bash
cd client

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

服务启动后会显示：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

---

## 停止服务

### 停止所有服务（Docker）

```bash
./stop.sh
# 或
docker compose down
```

### 停止本地服务

```bash
# 停止前端（端口 3000）
kill $(lsof -ti:3000)

# 停止后端（端口 3001）
kill $(lsof -ti:3001)

# 停止 AI Agent（端口 8000）
kill $(lsof -ti:8000)

# 停止所有服务
kill $(lsof -ti:3000) $(lsof -ti:3001) $(lsof -ti:8000)

# 停止 PostgreSQL（Docker）
docker compose down db
```

### 停止并清除数据（Docker）

```bash
# 停止服务并删除数据卷（⚠️ 会丢失所有数据）
docker compose down -v
```

---

## 重启服务

### 重启所有服务（Docker）

```bash
docker compose restart
```

### 重启单个服务（Docker）

```bash
docker compose restart server
docker compose restart ai-service
docker compose restart client
```

### 重启本地服务

```bash
# 重启后端
kill $(lsof -ti:3001)
cd server && npm run dev &

# 重启前端
kill $(lsof -ti:3000)
cd client && npm run dev &

# 重启 AI Agent
kill $(lsof -ti:8000)
cd ai-service && python app.py &
```

---

## 服务状态检查

### 检查所有服务状态

```bash
# Docker 模式
docker compose ps

# 本地模式 - 检查端口
lsof -i:3000   # 前端
lsof -i:3001   # 后端
lsof -i:8000   # AI Agent
lsof -i:5432   # PostgreSQL
```

### 健康检查端点

```bash
# 后端 API
curl http://localhost:3001/api/health

# AI Agent
curl http://localhost:8000/health

# 前端（检查 HTTP 状态码）
curl -o /dev/null -s -w "%{http_code}" http://localhost:3000
```

### 预期响应

**后端** (`/api/health`)：
```json
{
  "status": "ok",
  "timestamp": "2026-05-08T19:25:41.622Z"
}
```

**AI Agent** (`/health`)：
```json
{
  "status": "ok",
  "model": "claude-sonnet-4-20250514",
  "ai_enabled": true
}
```

---

## 日志查看

### Docker 模式

```bash
# 所有服务日志（实时）
docker compose logs -f

# 指定服务日志
docker compose logs -f server
docker compose logs -f ai-service
docker compose logs -f client
docker compose logs -f db

# 最近 100 行日志
docker compose logs --tail 100 server
```

### 本地模式

```bash
# 后端日志
tail -f /tmp/server.log

# 前端日志
tail -f /tmp/client.log

# AI Agent 日志（标准输出）
# 直接在运行 AI Agent 的终端查看

# PostgreSQL 日志
tail -f /tmp/pg-data/logfile
```

### 日志级别配置

在 `.env` 文件中设置：

```bash
# 日志级别：DEBUG / INFO / WARNING / ERROR
LOG_LEVEL=INFO

# 日志格式：json（生产）/ text（开发）
LOG_FORMAT=text
```

---

## 故障排除

### 问题：端口被占用

```bash
# 查看占用端口的进程
lsof -i:3001

# 强制停止占用端口的进程
kill -9 $(lsof -ti:3001)
```

### 问题：数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
docker compose ps db

# 检查数据库连接
psql -h localhost -U love -d love_db

# 重建数据库（⚠️ 会丢失数据）
docker compose down -v
docker compose up db -d
cd server && npm run db:push
```

### 问题：AI Agent 无法连接

```bash
# 检查 AI Agent 是否运行
curl http://localhost:8000/health

# 检查 API Key 配置
cat .env | grep API_KEY

# 查看 AI Agent 日志
docker compose logs ai-service
```

### 问题：前端无法访问后端 API

```bash
# 检查后端是否运行
curl http://localhost:3001/api/health

# 检查 Vite 代理配置
cat client/vite.config.ts

# 检查 CORS 配置
# 开发模式下 CORS 应该允许所有来源
```

### 问题：照片上传失败

```bash
# 检查 uploads 目录权限
ls -la server/uploads/

# 检查文件大小限制
# 默认限制：10MB
cat .env | grep MAX_FILE_SIZE

# 检查磁盘空间
df -h
```

### 问题：主题切换不生效

```bash
# 清除浏览器缓存
# 或在浏览器控制台执行：
localStorage.removeItem('our-story-theme')
location.reload()
```

### 问题：虚拟宠物猫不显示

```bash
# 检查猫咪图片是否存在
ls -la client/public/pet/

# 如果图片不存在，重新拉取代码
git pull origin master

# 清除位置缓存
# 在浏览器控制台执行：
localStorage.removeItem('our-story-cat-pos-cat')
localStorage.removeItem('our-story-cat-pos-bed')
localStorage.removeItem('our-story-cat-pos-food')
localStorage.removeItem('our-story-cat-pos-water')
location.reload()
```

---

## 环境变量说明

| 变量 | 说明 | 必填 | 默认值 |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL 连接串 | 是 | - |
| `JWT_SECRET` | JWT 密钥（16+ 字符） | 是 | - |
| `USER1_PASSWORD` | 用户 1 密码 | 是 | - |
| `USER2_PASSWORD` | 用户 2 密码 | 是 | - |
| `LLM_PROVIDER` | 大模型厂商 | 否 | anthropic |
| `ANTHROPIC_API_KEY` | Anthropic API Key | 否 | - |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | 否 | - |
| `PORT` | 后端端口 | 否 | 3001 |
| `LOG_LEVEL` | 日志级别 | 否 | INFO |
| `LOG_FORMAT` | 日志格式 | 否 | json |

---

## 快速参考

### 启动命令

| 场景 | 命令 |
|---|---|
| Docker 一键启动 | `./start.sh` |
| 本地开发一键启动 | `./dev.sh` |
| 只启动数据库 | `docker compose up db -d` |
| 只启动后端 | `cd server && npm run dev` |
| 只启动前端 | `cd client && npm run dev` |
| 只启动 AI Agent | `cd ai-service && python app.py` |

### 停止命令

| 场景 | 命令 |
|---|---|
| Docker 一键停止 | `./stop.sh` |
| 停止所有本地服务 | `kill $(lsof -ti:3000) $(lsof -ti:3001) $(lsof -ti:8000)` |
| 停止后端 | `kill $(lsof -ti:3001)` |
| 停止前端 | `kill $(lsof -ti:3000)` |

### 检查命令

| 场景 | 命令 |
|---|---|
| Docker 服务状态 | `docker compose ps` |
| 后端健康检查 | `curl http://localhost:3001/api/health` |
| AI Agent 健康检查 | `curl http://localhost:8000/health` |
| 查看后端日志 | `tail -f /tmp/server.log` |
| 查看前端日志 | `tail -f /tmp/client.log` |

---

**用爱制作，献给最爱的你 ❤️**
