# Our Story ❤️

为最爱的人打造的全栈情侣网站，配备 AI 智能助手。

## 特性

- **心情记录** - 6 种心情表情 + 文字记录
- **吐槽专区** - 3 种吐槽类型 + 生气程度滑块
- **倒计时** - 重要日子实时倒计时
- **甜蜜相册** - 照片上传 + 缩略图 + 瀑布流
- **时间轴** - 重要事件时间线
- **AI 智能助手** - LangGraph Agent，具备记忆、工具调用和自我进化能力

## 架构

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Nginx   │────▶│  Client  │     │  Server  │────▶│ Postgres │
│  :80     │     │ React+TS │     │ Fastify  │     │   :5432  │
└──────────┘     └──────────┘     └────┬─────┘     └──────────┘
                                       │
                                  ┌────▼─────┐
                                  │ AI Agent  │
                                  │ LangGraph │
                                  │ ChromaDB  │
                                  └──────────┘
```

## 快速开始

```bash
# 1. 复制并编辑环境变量
cp .env.example .env

# 2. 一键启动
docker compose up -d

# 3. 访问
open http://localhost
```

## AI Agent

Agent 具备以下能力：

| 能力 | 说明 |
|---|---|
| 三层记忆 | 工作记忆(实时上下文) + 短期记忆(对话摘要) + 长期记忆(向量搜索) |
| 5 个技能 | 情绪支持、心情分析、约会规划、记忆守护、礼物建议 |
| 10 个工具 | 操作心情/倒计时/时间轴/记忆/偏好 |
| 自我进化 | 偏好学习 + 人格参数自适应 |
| 结构化日志 | JSON 格式，request_id 链路追踪 |

## 项目结构

```
our-story/
├── client/                 # React 前端
│   └── src/
│       ├── components/     # 通用组件
│       ├── features/       # 功能模块
│       ├── hooks/          # React Query hooks
│       ├── services/       # API 调用层
│       └── stores/         # Zustand 状态
├── server/                 # Node.js 后端
│   └── src/
│       ├── db/             # Drizzle ORM schema
│       ├── routes/         # API 路由
│       ├── services/       # 业务逻辑
│       └── middleware/      # 认证中间件
├── ai-service/             # Python AI Agent
│   ├── agent/              # LangGraph 主图
│   ├── memory/             # 三层记忆系统
│   ├── skills/             # 技能模块
│   ├── tools/              # LangChain 工具
│   ├── evolution/          # 自我进化系统
│   └── logger.py           # 结构化日志
├── config/                 # 项目配置
├── docs/                   # 设计文档
├── nginx/                  # Nginx 配置
├── docker-compose.yml
└── .env.example
```

## 环境变量

参见 `.env.example`，主要配置：

| 变量 | 说明 | 必填 |
|---|---|---|
| `JWT_SECRET` | JWT 密钥（16+ 字符） | 是 |
| `USER1_PASSWORD` / `USER2_PASSWORD` | 用户密码 | 是 |
| `ANTHROPIC_API_KEY` | Claude API Key（可选，无则降级） | 否 |
| `DATABASE_URL` | PostgreSQL 连接串 | 是 |

## 许可证

个人使用，仅供学习和私人用途。

---

**用爱制作，献给最爱的你 ❤️**
