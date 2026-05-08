# Our Story - 给最爱的你

## 项目概述
全栈情侣浪漫网站，具备 AI 智能助手（LangGraph Agent + 三层记忆 + 5 个技能 + 10 个工具 + 自我进化）。
支持 8 家大模型厂商（Anthropic/OpenAI/小米/DeepSeek/通义千问/智谱/月之暗面/文心一言），通过配置文件一键切换。

## 技术栈
- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **后端**: Node.js + Fastify + Drizzle ORM + PostgreSQL
- **AI**: Python + FastAPI + LangChain + LangGraph + ChromaDB
- **部署**: Docker Compose + Nginx

## 项目结构
```
our-story/
├── client/           # React 前端（组件/hooks/services/stores）
├── server/           # Node.js 后端（routes/services/db/middleware）
├── ai-service/       # Python AI Agent（agent/memory/skills/tools/evolution）
├── config/           # 配置文件（app.json + ai.json，中文注释）
├── nginx/            # 反向代理配置
├── docs/             # 设计文档
├── docker-compose.yml
└── .env.example
```

## 开发指南

### Docker Compose（推荐）
```bash
cp .env.example .env    # 编辑密码和 API Key
docker compose up -d    # 一键启动全部服务
```

### 本地开发
```bash
# 1. 启动 PostgreSQL
docker compose up db -d

# 2. 启动 AI Agent（Python）
cd ai-service && pip install -r requirements.txt && python app.py

# 3. 启动后端（Node.js）
cd server && npm install && npm run db:push && npm run dev

# 4. 启动前端（React）
cd client && npm install && npm run dev
```

### 切换大模型厂商
在 `.env` 中设置：
```bash
LLM_PROVIDER=deepseek          # 切换到 DeepSeek
DEEPSEEK_API_KEY=sk-xxx        # 填入对应的 API Key
```
可选值：anthropic / openai / xiaomi / deepseek / qwen / zhipu / moonshot / baidu

### 配置文件
- `config/app.json` - 应用配置（心情类型、吐槽类型、倒计时图标、相册限制等）
- `config/ai.json` - AI 配置（模型厂商、人格参数、技能关键词、降级回复模板）
- 所有字段都有中文 `_comment` 注释

## 代码规范
- TypeScript strict mode，Python type annotations
- 不可变数据模式，函数 < 50 行，文件 < 800 行
- 统一错误处理，结构化日志
- 全量中文注释（docstring + 文件头 + 配置文件）

## 测试
```bash
cd server && npm test           # 后端单元测试（8 tests）
cd client && npm test           # 前端单元测试（9 tests）
cd ai-service && python -m pytest  # AI 服务测试
```

## AI Agent 执行流程
```
用户消息 → load_context → route_skill → think → [tools → think] → reflect → evolve → 回复
```
- **load_context**: 加载工作记忆（心情/倒计时/偏好/长期记忆）
- **route_skill**: 模糊匹配选择技能（情绪支持/心情分析/约会规划/记忆守护/礼物建议）
- **think**: 大模型推理 + 工具选择
- **execute_tools**: 调用 Node.js API 操作数据
- **reflect**: 评估回复质量
- **evolve**: 学习偏好、调整人格参数
