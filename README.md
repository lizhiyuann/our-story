# Our Story ❤️

> 为最爱的人打造的全栈情侣网站，配备 AI 智能助手和虚拟宠物猫。

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
- [架构](#架构)
- [前置条件](#前置条件)
- [快速开始](#快速开始)
- [端口说明](#端口说明)
- [默认账号](#默认账号)
- [本地开发](#本地开发)
- [AI Agent](#ai-agent)
- [回复系统](#回复系统)
- [主题系统](#主题系统)
- [虚拟宠物猫](#虚拟宠物猫)
- [聊天框](#聊天框)
- [API 文档](#api-文档)
- [配置说明](#配置说明)
- [项目结构](#项目结构)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 特性

| 模块 | 功能 |
|---|---|
| **心情记录** | 6 种心情表情 + 文字记录 + 历史查看 + 回复互动 |
| **吐槽专区** | 3 种吐槽类型 + 生气程度滑块 + 回复互动 |
| **倒计时** | 重要日子实时倒计时（天/时/分/秒）+ 回复互动 |
| **甜蜜相册** | 照片上传 + 自动缩略图 + 网格展示 + 大图预览 + 回复互动 |
| **时间轴** | 重要事件垂直时间线 + 回复互动 |
| **回复系统** | 所有模块支持多人多条回复，实时对话 |
| **AI 智能助手** | LangGraph Agent：三层记忆 + 5 个技能 + 10 个工具 + 自我进化 |
| **主题切换** | 4 套主题风格（浪漫粉/清新蓝/暗夜紫/自然绿） |
| **聊天框美化** | 3 种聊天风格（经典/信纸/像素）+ 3 种唤起按钮 |
| **虚拟宠物猫** | 金条（金渐层猫咪）自主活动 + 可拖动 + 抚摸互动 |

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

脚本会自动检查 `.env`、Docker 环境，启动所有服务并等待健康检查通过。

启动后访问 **http://localhost**。

> **手动启动**：
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
USER1_PASSWORD=your-secure-password
USER2_PASSWORD=your-secure-password
JWT_SECRET=your-random-secret-key-at-least-16-chars

# （可选）填入大模型 API Key，不填则降级为关键词匹配
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

## 端口说明

| 服务 | 端口 | 说明 | 外部访问 | 健康检查 |
|---|---|---|---|---|
| **Nginx** | `80` | 统一入口 | 是 | - |
| **Client** | `3000` | React 前端 | 否 | - |
| **Server** | `3001` | Node.js 后端 | 否 | `/api/health` |
| **AI Agent** | `8000` | Python AI 服务 | 否 | `/health` |
| **PostgreSQL** | `5432` | 数据库 | 否 | `pg_isready` |

> **生产环境只需开放 80 端口**，其余服务通过 Docker 内部网络通信。

---

## 默认账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 用户 1 | `boy` | `.env` 中 `USER1_PASSWORD` |
| 用户 2 | `girl` | `.env` 中 `USER2_PASSWORD` |

---

## 本地开发

```bash
# 一键启动（热更新模式）
./dev.sh
```

> 详细的服务启动、停止、重启、日志查看和故障排除，请参阅 [服务管理指南](docs/SERVICE-MANAGEMENT.md)。

或手动分别启动：

```bash
docker compose up db -d                                    # 数据库
cd ai-service && pip install -r requirements.txt && python app.py  # AI Agent
cd server && npm install && npm run db:push && npm run dev         # 后端
cd client && npm install && npm run dev                            # 前端
```

### 切换大模型厂商

```bash
# .env 中设置
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

可选：`anthropic` / `openai` / `xiaomi` / `deepseek` / `qwen` / `zhipu` / `moonshot` / `baidu`

---

## AI Agent

### 执行流程

```
用户消息 → load_context → route_skill → think → [tools → think] → reflect → evolve → 回复
```

### 能力总览

| 能力 | 说明 |
|---|---|
| **三层记忆** | 工作记忆 + 短期记忆（对话摘要）+ 长期记忆（ChromaDB 向量搜索） |
| **5 个技能** | 情绪支持、心情分析、约会规划、记忆守护、礼物建议 |
| **10 个工具** | 操作心情/倒计时/时间轴/记忆/偏好 |
| **自我进化** | 从对话中学习用户偏好，动态调整人格参数 |
| **结构化日志** | JSON 格式，request_id 贯穿全链路 |

### 支持的大模型

| 厂商 | 环境变量 | 默认模型 |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| 小米| `XIAOMI_API_KEY` | milm-large |
| DeepSeek | `DEEPSEEK_API_KEY` | deepseek-chat |
| 通义千问 | `DASHSCOPE_API_KEY` | qwen-plus |
| 智谱 GLM | `ZHIPU_API_KEY` | glm-4-plus |
| 月之暗面 | `MOONSHOT_API_KEY` | moonshot-v1-8k |
| 文心一言 | `BAIDU_API_KEY` | ernie-4.0-8k |

---

## 回复系统

所有模块（心情/吐槽/倒计时/时间轴/相册）支持回复互动：

- 两人均可对任意条目回复多条
- 点击"回复"展开/收起回复列表
- 回复实时显示发送者名称
- 支持删除自己的回复

---

## 主题系统

4 套主题风格，导航栏右侧一键切换：

| 主题 | 主色 | 风格 |
|---|---|---|
| 💕 浪漫粉 | #ff6b9d | 温馨甜蜜（默认） |
| 🌊 清新蓝 | #4A90D9 | 清爽舒适 |
| 🌙 暗夜紫 | #a78bfa | 暗色护眼 |
| 🌿 自然绿 | #10b981 | 清新自然 |

- CSS 变量驱动，切换后全局生效
- localStorage 持久化，刷新保持
- 暗色主题自动适配输入框和滚动条

---

## 虚拟宠物猫

金条是一只金渐层猫咪，会在页面上自主活动：

| 状态 | 表现 |
|---|---|
| 发呆 | 原地不动 |
| 散步 | 慢悠悠走动，偶尔冲刺 |
| 睡觉 | 走向猫窝，呼吸动画 |
| 吃饭 | 走向粮碗 |
| 喝水 | 走向水碗 |
| 撒娇 | 气泡消息 + 摇摆动画 |
| 被摸 | 爱心粒子 + 开心消息 |

- **拖动**：按住金条/猫窝/粮碗/水碗可拖到任意位置，自动保存
- **抚摸**：鼠标悬停触发，生成 ❤️ 粒子
- **睡觉被摸醒**：显示"被摸醒了 😿"
- **自定义形象**：替换 `client/public/pet/` 下的 SVG 图片即可

---

## 聊天框

### 聊天风格（3 种）

| 风格 | 效果 |
|---|---|
| 💬 经典 | 圆角气泡（默认） |
| 💌 信纸 | 信纸背景 + 衬线字体 |
| 🎮 像素 | 像素边框 + 等宽字体 |

### 唤起按钮（3 种）

| 样式 | 效果 |
|---|---|
| 💬 气泡 | 渐变圆形（默认） |
| 💖 心跳 | 心形 + 心跳动画 |
| 🐱 萌宠 | 猫咪头像 |

聊天窗口右上角 ⚙️ 按钮打开设置面板切换风格。

---

## API 文档

### 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| GET | `/api/auth/me` | 当前用户 |

### 业务 API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET/POST/DELETE | `/api/moods` | 心情 CRUD |
| GET/POST/DELETE | `/api/rants` | 吐槽 CRUD |
| GET/POST/DELETE | `/api/countdowns` | 倒计时 CRUD |
| GET/POST/DELETE | `/api/photos` | 照片 CRUD |
| GET/POST/DELETE | `/api/timeline` | 时间轴 CRUD |
| GET/POST/DELETE | `/api/replies` | 回复 CRUD |
| POST | `/api/chat` | AI 聊天 |
| GET | `/api/chat/history` | 聊天历史 |
| GET | `/api/config` | 应用配置 |

---

## 配置说明

| 文件 | 说明 |
|---|---|
| `.env` | 环境变量（数据库、JWT、API Key、日志级别） |
| `config/app.json` | 应用配置（心情类型、倒计时图标、纪念日、端口） |
| `config/ai.json` | AI 配置（模型厂商、人格参数、技能关键词） |
| `docker-compose.yml` | 服务编排（端口、卷、健康检查） |
| `nginx/nginx.conf` | Nginx 反向代理 |

所有配置字段都有中文 `_comment` 注释。

---

## 项目结构

```
our-story/
├── client/                     # React 前端
│   ├── public/pet/             # 虚拟宠物猫图片素材
│   └── src/
│       ├── components/         # 通用组件
│       │   ├── CatPet.tsx      # 虚拟宠物猫
│       │   ├── ThemeSwitcher.tsx # 主题切换
│       │   ├── ReplySection.tsx  # 回复组件
│       │   └── ...
│       ├── features/           # 功能模块（auth/home/mood/rant/countdown/gallery/timeline/chat）
│       ├── hooks/              # React Query hooks
│       ├── services/           # API 调用层
│       ├── stores/             # Zustand 状态（auth/theme）
│       ├── styles/             # 主题 CSS 变量
│       └── utils/              # 工具函数
├── server/                     # Node.js 后端
│   └── src/
│       ├── db/                 # Drizzle ORM schema
│       ├── routes/             # API 路由（auth/mood/rant/countdown/photo/timeline/reply/chat/config）
│       ├── services/           # 业务逻辑
│       └── middleware/          # JWT 认证
├── ai-service/                 # Python AI Agent
│   ├── agent/                  # LangGraph 主图
│   ├── memory/                 # 三层记忆系统
│   ├── skills/                 # 5 个技能模块
│   ├── tools/                  # 10 个 LangChain 工具
│   ├── evolution/              # 自我进化系统
│   └── logger.py               # 结构化日志
├── config/                     # 配置文件
├── nginx/                      # Nginx 配置
├── docker-compose.yml
├── start.sh / stop.sh / dev.sh # 启动脚本
└── .env.example
```

---

## 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

### 开发规范

- TypeScript strict mode / Python type annotations
- 全量中文注释
- 函数 < 50 行，文件 < 800 行
- 提交信息使用 [Conventional Commits](https://www.conventionalcommits.org/)

---

## 许可证

[MIT License](LICENSE)

---

**用爱制作，献给最爱的你 ❤️**
