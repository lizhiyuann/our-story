# Our Story ❤️

> 为最爱的人打造的全栈情侣网站，配备 AI 智能助手。

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 目录

- [特性](#特性)
- [截图](#截图)
- [架构](#架构)
- [前置条件](#前置条件)
- [快速开始](#快速开始)
- [端口说明](#端口说明)
- [默认账号](#默认账号)
- [本地开发](#本地开发)
- [AI Agent](#ai-agent)
- [API 文档](#api-文档)
- [配置说明](#配置说明)
- [测试](#测试)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 特性

| 模块 | 功能 |
|---|---|
| **心情记录** | 6 种心情表情（😊🥰😢😠🤔😴）+ 文字记录 + 历史查看 |
| **吐槽专区** | 3 种吐槽类型（吐槽/骂人/抱怨）+ 生气程度滑块（1-10 级） |
| **倒计时** | 重要日子实时倒计时（天/时/分/秒），支持多个同时显示 |
| **甜蜜相册** | 照片上传（拖拽 + 点击）+ 自动缩略图 + 瀑布流 + 大图预览 |
| **时间轴** | 重要事件垂直时间线，按日期排序 |
| **AI 智能助手** | LangGraph Agent：三层记忆 + 5 个技能 + 10 个工具 + 自我进化 |

---

## 截图

> TODO: 添加截图

---

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└────────────────────────┬────────────────────────────────┘
                         │ :80
┌────────────────────────▼────────────────────────────────┐
│                      Nginx                              │
│              反向代理 + 静态文件服务                      │
└──────┬─────────────────────────────────────┬────────────┘
       │ /                                   │ /api
┌──────▼──────┐                        ┌─────▼──────┐
│   Client    │                        │   Server   │
│  React+TS   │                        │  Fastify   │
│  Vite+TW    │                        │  Drizzle   │
│   :3000     │                        │   :3001    │
└─────────────┘                        └──────┬─────┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                   ┌─────▼─────┐        ┌─────▼─────┐        ┌────▼────┐
                   │ PostgreSQL│        │ AI Agent  │        │ uploads │
                   │   :5432   │        │ FastAPI   │        │  卷     │
                   └───────────┘        │ LangGraph │        └─────────┘
                                        │ ChromaDB  │
                                        │   :8000   │
                                        └───────────┘
```

---

## 前置条件

| 工具 | 版本 | 说明 |
|---|---|---|
| [Docker](https://docs.docker.com/get-docker/) | 20.10+ | 容器运行时 |
| [Docker Compose](https://docs.docker.com/compose/install/) | 2.0+ | 服务编排 |
| [Node.js](https://nodejs.org/) | 18+ | 仅本地开发需要 |
| [Python](https://python.org/) | 3.10+ | 仅本地开发需要 |

**Docker 部署只需安装 Docker 即可，无需安装 Node.js 和 Python。**

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/our-story.git
cd our-story
```

### 2. 一键启动

```bash
./start.sh
```

脚本会自动：
- 检查并创建 `.env` 文件（首次运行）
- 检查 Docker 是否安装
- 启动所有服务（数据库 + 后端 + AI Agent + 前端 + Nginx）

启动后访问 **http://localhost**。

> **手动启动**（不用脚本）：
> ```bash
> cp .env.example .env   # 编辑密码和 API Key
> docker compose up -d   # 启动所有服务
> ```

### 3. 停止服务

```bash
./stop.sh
```

### 4. 配置环境变量

编辑 `.env`，**必须修改的配置**：

```bash
# 修改为你自己的密码（至少 6 位）
USER1_PASSWORD=your-secure-password
USER2_PASSWORD=your-secure-password

# 修改 JWT 密钥（至少 16 位随机字符串）
JWT_SECRET=your-random-secret-key-at-least-16-chars

# （可选）填入大模型 API Key，不填则降级为关键词匹配
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

## 端口说明

| 服务 | 端口 | 说明 | 外部访问 | 健康检查 |
|---|---|---|---|---|
| **Nginx** | `80` | 统一入口（反向代理） | 是（用户访问） | - |
| **Client** | `3000` | React 前端（Vite） | 否（Nginx 代理） | - |
| **Server** | `3001` | Node.js 后端 API | 否（Nginx 代理） | `http://localhost:3001/api/health` |
| **AI Agent** | `8000` | Python AI 服务 | 否（内部调用） | `http://localhost:8000/health` |
| **PostgreSQL** | `5432` | 数据库 | 否（Docker 网络） | `pg_isready` |

### 端口关系图

```
用户浏览器
    │
    ▼ :80
┌─────────┐
│  Nginx  │
└────┬────┘
     │ /              │ /api
     ▼                ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │     │ Server  │────▶│ Postgres│
│  :3000  │     │  :3001  │     │  :5432  │
└─────────┘     └────┬────┘     └─────────┘
                     │
                     ▼
                ┌─────────┐
                │AI Agent │
                │  :8000  │
                └─────────┘
```

> **生产环境只需开放 80 端口**，其余服务通过 Docker 内部网络通信。

### 修改端口

如果默认端口被占用，修改 `docker-compose.yml`：

```yaml
# Nginx 入口改为 8080
nginx:
  ports:
    - "8080:80"

# 后端改为 3002
server:
  ports:
    - "3002:3001"
```

### 验证服务状态

```bash
# 查看所有服务状态
docker compose ps

# 检查各服务健康
curl http://localhost:3001/api/health   # 后端
curl http://localhost:8000/health       # AI Agent
curl http://localhost:80                 # 前端 + Nginx

# 查看实时日志
docker compose logs -f
```

---

## 默认账号

系统启动时自动创建两个账号（在 `.env` 中配置密码）：

| 角色 | 用户名 | 密码 | 说明 |
|---|---|---|---|
| 用户 1 | `boy` | `.env` 中 `USER1_PASSWORD` | 可自定义用户名和显示名 |
| 用户 2 | `girl` | `.env` 中 `USER2_PASSWORD` | 可自定义用户名和显示名 |

修改 `.env` 中的 `USER1_USERNAME`、`USER1_DISPLAY_NAME` 等字段自定义。

---

## 本地开发

如果需要修改代码，建议本地开发（热更新）：

```bash
# 一键启动（自动启动数据库 + AI Agent + 后端 + 前端）
./dev.sh
```

或手动分别启动：

```bash
# 终端 1：启动数据库
docker compose up db -d

# 终端 2：启动 AI Agent
cd ai-service && pip install -r requirements.txt && python app.py

# 终端 3：启动后端
cd server && npm install && npm run db:push && npm run dev

# 终端 4：启动前端
cd client && npm install && npm run dev
```

前端 Vite 已配置代理，`/api` 请求自动转发到 `localhost:3001`。

### 切换大模型厂商

在 `.env` 中设置：

```bash
# 选择厂商
LLM_PROVIDER=deepseek

# 填入对应的 API Key（填一个即可）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
# 或
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
# 或
XIAOMI_API_KEY=xxxxxxxxxxxxxxxx
```

可选厂商：`anthropic` / `openai` / `xiaomi` / `deepseek` / `qwen` / `zhipu` / `moonshot` / `baidu`

详见 `config/ai.json` 中的完整模型列表。

---

## AI Agent

### 执行流程

```
用户消息
  │
  ▼
load_context（加载工作记忆：心情/倒计时/偏好/长期记忆）
  │
  ▼
route_skill（模糊匹配选择技能）
  │
  ▼
think（大模型推理 + 工具选择）
  │
  ├── 有工具调用 → execute_tools → 回到 think
  │
  └── 无工具调用 → reflect（评估回复质量）
                        │
                        ▼
                    evolve（学习偏好、调整人格参数）
                        │
                        ▼
                      回复
```

### 能力总览

| 能力 | 说明 |
|---|---|
| **三层记忆** | 工作记忆（实时上下文）+ 短期记忆（对话摘要）+ 长期记忆（ChromaDB 向量搜索） |
| **5 个技能** | 情绪支持、心情分析、约会规划、记忆守护、礼物建议 |
| **10 个工具** | 操作心情/倒计时/时间轴/记忆/偏好 |
| **自我进化** | 从对话中学习用户偏好，动态调整人格参数 |
| **结构化日志** | JSON 格式，request_id 贯穿全链路 |

### 支持的大模型

| 厂商 | 环境变量 | 默认模型 | 说明 |
|---|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 | 推理能力强 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o | 多模态 |
| **小米** | `XIAOMI_API_KEY` | milm-large | 中文能力强 |
| DeepSeek | `DEEPSEEK_API_KEY` | deepseek-chat | 性价比高 |
| 通义千问 | `DASHSCOPE_API_KEY` | qwen-plus | 阿里云 |
| 智谱 GLM | `ZHIPU_API_KEY` | glm-4-plus | 国产旗舰 |
| 月之暗面 | `MOONSHOT_API_KEY` | moonshot-v1-8k | 长上下文 |
| 文心一言 | `BAIDU_API_KEY` | ernie-4.0-8k | 百度 |

---

## API 文档

### 认证

所有 API 需要登录后访问（JWT Cookie）。

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录（body: `{username, password}`） |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/auth/me` | 获取当前用户 |

### 业务 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/moods?page=1&limit=20` | 心情列表 |
| POST | `/api/moods` | 添加心情（body: `{moodType, emoji, content}`） |
| DELETE | `/api/moods/:id` | 删除心情 |
| GET | `/api/rants?page=1&limit=20` | 吐槽列表 |
| POST | `/api/rants` | 添加吐槽（body: `{rantType, content, intensity}`） |
| DELETE | `/api/rants/:id` | 删除吐槽 |
| GET | `/api/countdowns` | 倒计时列表 |
| POST | `/api/countdowns` | 添加倒计时（body: `{title, targetDate, icon?}`） |
| DELETE | `/api/countdowns/:id` | 删除倒计时 |
| GET | `/api/photos?page=1&limit=20` | 照片列表 |
| POST | `/api/photos/upload` | 上传照片（multipart: `file` + `caption?`） |
| DELETE | `/api/photos/:id` | 删除照片 |
| GET | `/api/timeline` | 时间轴列表 |
| POST | `/api/timeline` | 添加事件（body: `{eventDate, title, description?, icon?}`） |
| DELETE | `/api/timeline/:id` | 删除事件 |
| POST | `/api/chat` | 发送消息给 AI（body: `{message}`） |
| GET | `/api/chat/history?limit=50` | 聊天历史 |

### 响应格式

```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 20 }
}
```

---

## 配置说明

| 文件 | 说明 |
|---|---|
| `.env` | 环境变量（数据库、JWT、API Key、日志级别） |
| `config/app.json` | 应用配置（心情类型、吐槽类型、倒计时图标、相册限制） |
| `config/ai.json` | AI 配置（模型厂商、人格参数、技能关键词、降级回复） |
| `docker-compose.yml` | 服务编排（端口、卷、依赖关系） |
| `nginx/nginx.conf` | Nginx 反向代理配置 |

所有配置字段都有中文 `_comment` 注释。

### 自定义纪念日

修改 `config/app.json` 中的日期：

```json
{
  "love": {
    "startDate": "2024-01-01T00:00:00"
  }
}
```

---

## 测试

```bash
# 后端单元测试
cd server && npm test

# 前端单元测试
cd client && npm test

# AI 服务测试
cd ai-service && pip install pytest && python -m pytest
```

---

## 项目结构

```
our-story/
├── client/                     # React 前端
│   └── src/
│       ├── components/         # 通用组件（Layout/Navbar/Toast/Modal）
│       ├── features/           # 功能模块
│       │   ├── auth/           # 登录页
│       │   ├── home/           # 首页（计时器/粒子效果）
│       │   ├── mood/           # 心情记录
│       │   ├── rant/           # 吐槽专区
│       │   ├── countdown/      # 倒计时
│       │   ├── gallery/        # 相册
│       │   ├── timeline/       # 时间轴
│       │   └── chat/           # AI 聊天浮窗
│       ├── hooks/              # React Query hooks
│       ├── services/           # API 调用层
│       ├── stores/             # Zustand 状态管理
│       ├── types/              # TypeScript 类型定义
│       └── utils/              # 工具函数
├── server/                     # Node.js 后端
│   └── src/
│       ├── config/             # 环境变量验证
│       ├── db/                 # Drizzle ORM schema + 连接
│       ├── middleware/          # JWT 认证中间件
│       ├── routes/             # API 路由
│       ├── services/           # 业务逻辑
│       └── utils/              # 工具函数
├── ai-service/                 # Python AI Agent
│   ├── agent/                  # LangGraph 主图
│   ├── memory/                 # 三层记忆系统
│   ├── skills/                 # 5 个技能模块
│   ├── tools/                  # 10 个 LangChain 工具
│   ├── evolution/              # 自我进化系统
│   ├── logger.py               # 结构化日志
│   ├── config.py               # 配置加载
│   └── app.py                  # FastAPI 入口
├── config/                     # 项目配置文件
│   ├── app.json                # 应用配置
│   └── ai.json                 # AI 配置
├── nginx/                      # Nginx 配置
├── docs/                       # 设计文档
├── docker-compose.yml          # Docker 服务编排
├── .env.example                # 环境变量模板
└── .gitignore
```

---

## 贡献指南

欢迎贡献！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 开发规范

- TypeScript strict mode
- Python type annotations
- 全量中文注释
- 函数 < 50 行，文件 < 800 行
- 提交信息使用 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 许可证

[MIT License](LICENSE)

---

**用爱制作，献给最爱的你 ❤️**
