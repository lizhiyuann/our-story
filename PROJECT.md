# Our Story - 项目文档

## 需求分析

### 1. 项目背景
为女朋友创建一个专属的浪漫网站，记录两人之间的美好时光。配备 AI 智能助手、虚拟宠物猫、多主题切换。

### 2. 核心功能

| 模块 | 功能 |
|---|---|
| 心情记录 | 6 种心情表情 + 文字记录 + 回复互动 |
| 吐槽专区 | 3 种吐槽类型 + 生气程度 1-10 级 + 回复互动 |
| 倒计时 | 重要日子实时倒计时（天/时/分/秒）+ 回复互动 |
| 相册 | 照片上传 + 自动缩略图 + 网格展示 + 回复互动 |
| 时间轴 | 重要事件垂直时间线 + 回复互动 |
| 回复系统 | 所有模块支持多人多条回复 |
| AI 助手 | LangGraph Agent + 三层记忆 + 5 技能 + 10 工具 + 自我进化 |
| 主题系统 | 4 套主题风格（粉/蓝/紫/绿）一键切换 |
| 聊天框 | 3 种风格（经典/信纸/像素）+ 3 种按钮 |
| 虚拟宠物 | 金条（金渐层猫咪）自主活动 + 可拖动 + 抚摸互动 |

### 3. 非功能需求
- 响应式设计（手机 + 桌面）
- JWT 认证保护隐私
- 图片自动压缩 + 缩略图
- Docker 一键部署
- 主题切换持久化
- 家具位置持久化

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

| 表 | 说明 |
|---|---|
| `users` | 用户表（情侣两人） |
| `moods` | 心情记录 |
| `rants` | 吐槽记录 |
| `countdowns` | 倒计时 |
| `photos` | 照片（文件路径 + 缩略图） |
| `timeline_events` | 时间轴事件 |
| `replies` | 回复（支持任意模块条目） |
| `chat_messages` | AI 聊天记录 |

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
| GET/POST/DELETE | /api/replies | 回复 CRUD |
| POST | /api/chat | AI 聊天 |
| GET | /api/chat/history | 聊天历史 |
| GET | /api/config | 应用配置 |

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

| 技能 | 触发条件 |
|---|---|
| 情绪支持 | 检测到负面情绪 |
| 心情分析 | 询问心情状态 |
| 约会规划 | 提到约会/出去玩 |
| 记忆守护 | 分享重要事件 |
| 礼物建议 | 提到礼物/生日 |

### 自我进化

- **偏好学习**: 从对话中自动提取用户偏好
- **人格自适应**: 根据用户反馈调整 humor/warmth/response_length

---

## 主题系统

4 套主题通过 CSS 变量驱动：

| 主题 | 主色 | 背景 |
|---|---|---|
| 浪漫粉 | #ff6b9d | #fff5f7 |
| 清新蓝 | #4A90D9 | #f0f7ff |
| 暗夜紫 | #a78bfa | #1a1024 |
| 自然绿 | #10b981 | #f0fdf4 |

---

## 虚拟宠物猫

金条（金渐层猫咪）：
- 5 个 SVG 姿态（坐/走/睡/吃/撒娇）
- 8 种行为状态 + 自主状态机
- 可拖动（猫/猫窝/粮碗/水碗）
- 位置 localStorage 持久化
- 鼠标抚摸互动 + 爱心粒子

---

## 端口配置

| 服务 | 端口 | 健康检查 |
|---|---|---|
| Nginx | 80 | - |
| Client | 3000 | - |
| Server | 3001 | /api/health |
| AI Agent | 8000 | /health |
| PostgreSQL | 5432 | pg_isready |

---

## 启动方式

```bash
./start.sh    # Docker 一键启动
./stop.sh     # 一键停止
./dev.sh      # 本地开发（热更新）
```

---

**用爱制作，献给最爱的你 ❤️**
