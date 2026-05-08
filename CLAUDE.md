# Our Story - 给最爱的你

## 项目概述
全栈情侣浪漫网站，具备 AI 智能助手（LangGraph Agent + 记忆系统 + 工具调用 + 自我进化）。

## 技术栈
- **前端**: React 19 + TypeScript + Vite + Tailwind CSS
- **后端**: Node.js + Fastify + Drizzle ORM + PostgreSQL
- **AI**: Python + FastAPI + LangChain + LangGraph + ChromaDB
- **部署**: Docker Compose + Nginx

## 项目结构
```
our-story/
├── client/           # React 前端
├── server/           # Node.js 后端
├── ai-service/       # Python AI Agent
├── nginx/            # 反向代理配置
├── config/           # 项目配置文件
├── docs/             # 设计文档
├── docker-compose.yml
└── .env.example
```

## 开发指南

### Docker Compose (推荐)
```bash
cp .env.example .env
docker compose up -d
```

### 本地开发
```bash
# 1. PostgreSQL
docker compose up db -d

# 2. AI Agent
cd ai-service && pip install -r requirements.txt && python app.py

# 3. 后端
cd server && npm install && npm run db:push && npm run dev

# 4. 前端
cd client && npm install && npm run dev
```

## 代码规范
- TypeScript strict mode
- 不可变数据模式
- 函数 < 50 行，文件 < 800 行
- 统一错误处理
- 结构化日志

## 测试
```bash
cd server && npm test      # 后端单元测试
cd client && npm test      # 前端单元测试
cd ai-service && python -m pytest  # AI 服务测试
```
