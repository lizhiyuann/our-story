# Our Story - 给最爱的你

## 项目概述
全栈情侣浪漫网站，配备 AI 智能助手（LangGraph Agent）、虚拟宠物猫（金条）、多主题切换、回复互动系统。支持 8 家大模型厂商，通过配置文件一键切换。

## 技术栈
- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **后端**: Node.js + Fastify + Drizzle ORM + PostgreSQL
- **AI**: Python + FastAPI + LangChain + LangGraph + ChromaDB
- **部署**: Docker Compose + Nginx

## 项目结构
```
our-story/
├── client/           # React 前端（组件/features/hooks/services/stores/styles）
├── server/           # Node.js 后端（routes/services/db/middleware）
├── ai-service/       # Python AI Agent（agent/memory/skills/tools/evolution）
├── config/           # 配置文件（app.json + ai.json，中文注释）
├── nginx/            # 反向代理配置
├── docker-compose.yml
├── start.sh / stop.sh / dev.sh
└── .env.example
```

## 核心功能
- 心情/吐槽/倒计时/相册/时间轴 + 回复互动系统
- AI 智能助手（三层记忆 + 5 技能 + 10 工具 + 自我进化）
- 4 套主题风格（粉/蓝/紫/绿）
- 聊天框 3 种风格 + 3 种按钮样式
- 虚拟宠物猫"金条"（自主活动 + 可拖动 + 抚摸互动）
- AI 聊天：流式输出 + Markdown 渲染 + 新建/历史/清空对话

## 开发指南

### Docker Compose（推荐）
```bash
cp .env.example .env && docker compose up -d
```

### 本地开发
```bash
./dev.sh    # 一键启动数据库 + AI Agent + 后端 + 前端
```

### 切换大模型
```bash
# .env 中设置
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx
```

### 配置文件
- `config/app.json` - 应用配置（心情类型、纪念日、端口等）
- `config/ai.json` - AI 配置（模型厂商、人格参数、技能关键词等）

## 代码规范
- TypeScript strict mode / Python type annotations
- 全量中文注释（docstring + 文件头 + 配置文件）
- 函数 < 50 行，文件 < 800 行
- 不可变数据模式

## 测试
```bash
cd server && npm test           # 后端单元测试
cd client && npm test           # 前端单元测试
cd ai-service && python -m pytest  # AI 服务测试
```

## AI Agent 执行流程
```
用户消息 → load_context → route_skill → think → [tools → think] → reflect → evolve → 回复
```
