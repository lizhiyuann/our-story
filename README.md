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
| 三层记忆 | 工作记忆(实时上下文) + 短期记忆(对话摘要) + 长期记忆(ChromaDB 向量搜索) |
| 5 个技能 | 情绪支持、心情分析、约会规划、记忆守护、礼物建议（模糊匹配触发） |
| 10 个工具 | 操作心情/倒计时/时间轴/记忆/偏好 |
| 自我进化 | 偏好自动学习 + 人格参数自适应（warmth/humor/emoji_frequency 等） |
| 结构化日志 | JSON 格式，request_id 贯穿全链路，每个环节记录耗时 |
| 多厂商模型 | 支持 8 家大模型厂商，通过配置文件一键切换 |

### 支持的大模型厂商

| 厂商 | 环境变量 | 默认模型 |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` | claude-sonnet-4-6 |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| **小米** | `XIAOMI_API_KEY` | milm-large |
| DeepSeek | `DEEPSEEK_API_KEY` | deepseek-chat |
| 通义千问 | `DASHSCOPE_API_KEY` | qwen-plus |
| 智谱 GLM | `ZHIPU_API_KEY` | glm-4-plus |
| 月之暗面 | `MOONSHOT_API_KEY` | moonshot-v1-8k |
| 文心一言 | `BAIDU_API_KEY` | ernie-4.0-8k |

在 `.env` 中设置 `LLM_PROVIDER` 和对应的 API Key 即可切换厂商。

## 配置文件

| 文件 | 说明 |
|---|---|
| `config/app.json` | 应用配置：心情类型、吐槽类型、倒计时图标、相册限制等 |
| `config/ai.json` | AI 配置：模型厂商、人格参数、技能关键词、降级回复模板 |
| `.env` | 环境变量：数据库、JWT 密钥、API Key、日志级别 |

所有配置字段都有中文 `_comment` 注释说明。

## 项目结构

```
our-story/
├── client/                 # React 前端
│   └── src/
│       ├── components/     # 通用组件（Layout/Navbar/Toast/Modal）
│       ├── features/       # 功能模块（home/mood/rant/countdown/gallery/timeline/chat）
│       ├── hooks/          # React Query hooks
│       ├── services/       # API 调用层
│       └── stores/         # Zustand 状态管理
├── server/                 # Node.js 后端
│   └── src/
│       ├── db/             # Drizzle ORM schema
│       ├── routes/         # API 路由（auth/mood/rant/countdown/timeline/photo/chat）
│       ├── services/       # 业务逻辑
│       └── middleware/      # JWT 认证（支持 Agent 内部调用）
├── ai-service/             # Python AI Agent
│   ├── agent/              # LangGraph 主图（graph/state/nodes/prompts）
│   ├── memory/             # 三层记忆（working/short_term/long_term）
│   ├── skills/             # 5 个技能模块
│   ├── tools/              # 10 个 LangChain 工具
│   ├── evolution/          # 自我进化（tracker/preferences/personality）
│   ├── logger.py           # 结构化日志系统
│   └── config.py           # 配置加载（读取 config/ai.json）
├── config/                 # 项目配置（app.json + ai.json）
├── docs/                   # 设计文档
├── nginx/                  # Nginx 反向代理配置
├── docker-compose.yml      # 服务编排（db + server + client + ai-service + nginx）
└── .env.example            # 环境变量模板
```

## 环境变量

参见 `.env.example`，主要配置：

| 变量 | 说明 | 必填 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 连接串 | 是 |
| `JWT_SECRET` | JWT 密钥（16+ 字符） | 是 |
| `USER1_PASSWORD` / `USER2_PASSWORD` | 用户密码（至少 6 位） | 是 |
| `LLM_PROVIDER` | 大模型厂商（anthropic/openai/xiaomi/deepseek/qwen/zhipu/moonshot/baidu） | 否 |
| `ANTHROPIC_API_KEY` 等 | 对应厂商的 API Key（填一个即可） | 否 |
| `LOG_LEVEL` | 日志级别（DEBUG/INFO/WARNING/ERROR） | 否 |
| `LOG_FORMAT` | 日志格式（json=生产 / text=开发） | 否 |

无 API Key 时自动降级为关键词匹配回复。

## 许可证

个人使用，仅供学习和私人用途。

---

**用爱制作，献给最爱的你 ❤️**
