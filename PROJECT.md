# Our Story - 项目文档

## 需求分析

### 1. 项目背景
为女朋友创建一个专属的浪漫网站，记录两人之间的美好时光。配备 AI 智能助手，具备记忆、工具调用和自我进化能力。

### 2. 核心功能

| 模块 | 功能 |
|---|---|
| 心情记录 | 6 种心情表情 + 文字记录 + 历史查看 |
| 吐槽专区 | 3 种吐槽类型 + 生气程度 1-10 级 |
| 倒计时 | 重要日子实时倒计时（天/时/分/秒） |
| 相册 | 照片上传 + 自动缩略图 + 瀑布流 |
| 时间轴 | 重要事件垂直时间线 |
| AI 助手 | LangGraph Agent + 记忆 + 工具 + 技能 + 进化 |

### 3. 非功能需求
- 响应式设计（手机 + 桌面）
- JWT 认证保护隐私
- 图片自动压缩 + 缩略图
- Docker 一键部署

---

## 架构设计

### 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS |
| 状态管理 | Zustand + React Query |
| 后端 | Node.js + Fastify + Drizzle ORM |
| 数据库 | PostgreSQL 16 |
| AI | Python + LangChain + LangGraph + ChromaDB |
| 部署 | Docker Compose + Nginx |

### 数据库 Schema

```
users           - 用户表（情侣两人）
moods           - 心情记录
rants           - 吐槽记录
countdowns      - 倒计时
photos          - 照片（文件路径 + 缩略图）
timeline_events - 时间轴事件
chat_messages   - AI 聊天记录
```

### API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/login | 登录 |
| GET | /api/auth/me | 当前用户 |
| GET/POST/DELETE | /api/moods | 心情 CRUD |
| GET/POST/DELETE | /api/rants | 吐槽 CRUD |
| GET/POST/DELETE | /api/countdowns | 倒计时 CRUD |
| GET/POST/DELETE | /api/photos | 照片 CRUD |
| GET/POST/DELETE | /api/timeline | 时间轴 CRUD |
| POST | /api/chat | AI 聊天 |
| GET | /api/chat/history | 聊天历史 |

---

## AI Agent 设计

### 执行流程

```
用户消息 → load_context → route_skill → think → [tools → think] → reflect → evolve → 回复
```

### 记忆系统

| 层 | 存储 | 用途 |
|---|---|---|
| 工作记忆 | 内存 | 当前上下文（心情/倒计时/偏好） |
| 短期记忆 | 内存 | 最近 20 条对话 + 自动摘要 |
| 长期记忆 | ChromaDB | 向量语义搜索（偏好/事件/情绪模式） |

### 技能模块

| 技能 | 触发条件 | 可用工具 |
|---|---|---|
| 情绪支持 | 检测到负面情绪 | search_memory, save_memory, get_recent_moods |
| 心情分析 | 询问心情状态 | get_recent_moods, search_memory |
| 约会规划 | 提到约会/出去玩 | get_countdowns, search_memory, create_countdown |
| 记忆守护 | 分享重要事件 | save_memory, record_event, search_memory |
| 礼物建议 | 提到礼物/生日 | get_user_preferences, get_countdowns, search_memory |

### 自我进化

- **偏好学习**: 从对话中自动提取用户偏好
- **人格自适应**: 根据用户反馈调整 humor/warmth/response_length

---

## 端口配置

| 服务 | 端口 | 健康检查 | 说明 |
|---|---|---|---|
| Nginx | 80 | - | 统一入口，反向代理 |
| Client | 3000 | - | React 前端（Nginx 代理） |
| Server | 3001 | /api/health | Node.js 后端 API |
| AI Agent | 8000 | /health | Python AI 服务 |
| PostgreSQL | 5432 | pg_isready | 数据库 |

端口配置集中在 `config/app.json` 的 `ports` 字段和 `docker-compose.yml` 中。

---

## 启动方式

```bash
# 一键启动（推荐）
./start.sh

# 一键停止
./stop.sh

# 本地开发（热更新）
./dev.sh

# 手动 Docker 启动
cp .env.example .env
docker compose up -d
```

---

**用爱制作，献给最爱的你 ❤️**
