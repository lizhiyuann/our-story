# 技术栈选型文档

## 1. 前端技术栈

### 1.1 核心技术

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| HTML5 | - | 页面结构 | 语义化标签，更好的可访问性 |
| CSS3 | - | 样式设计 | Flexbox/Grid 布局，动画支持 |
| TypeScript | 5.x | 交互逻辑 | 类型安全、更好的开发体验、IDE 支持 |

### 1.2 构建工具

| 工具 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Vite | 5.x | 构建工具 | 快速热更新、原生 ESM 支持 |
| TypeScript | 5.x | 类型检查 | 编译时类型检查 |
| ESLint | 8.x | 代码规范 | 代码质量保证 |
| Prettier | 3.x | 代码格式化 | 统一代码风格 |

### 1.3 UI 资源

| 资源 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Font Awesome | 6.4.0 | 图标库 | 丰富的图标资源，易于使用 |
| Google Fonts | - | 字体 | 免费、美观、易加载 |

### 1.4 开发工具

| 工具 | 用途 |
|------|------|
| VS Code | 代码编辑器（推荐安装 TypeScript 插件） |
| Chrome DevTools | 调试和测试 |
| Node.js | 运行时环境 |

---

## 2. 智能助手技术栈

### 2.1 核心框架

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| LangChain | 最新 | LLM 应用框架 | 标准化的 LLM 应用开发框架 |
| LangGraph | 最新 | 多智能体编排 | 支持复杂的工作流编排 |
| LangSmith | 最新 | 监控和调试 | LLM 应用的可观测性 |

### 2.2 MaaS 模型服务

| 服务商 | 模型 | API | 用途 |
|--------|------|-----|------|
| OpenAI | GPT-4o, GPT-4o-mini | OpenAI API | 通用对话、高质量回复 |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Opus | Anthropic API | 长文本理解、复杂推理 |
| Google | Gemini 1.5 Pro, Gemini 1.5 Flash | Google AI API | 多模态理解、快速响应 |
| 阿里云 | 通义千问 Max, 通义千问 Plus | 阿里云 API | 中文优化、本地化 |
| 百度 | 文心一言 4.0 | 百度 API | 中文理解、知识丰富 |
| 智谱 | GLM-4 | 智谱 API | 中文对话、性价比高 |
| 月之暗面 | Kimi | Kimi API | 长文本处理、中文优化 |
| DeepSeek | DeepSeek-V2 | DeepSeek API | 代码生成、推理能力 |

### 2.3 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    智能助手架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   用户输入  │ →  │  LangChain  │ →  │  模型路由   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                           ↓                                 │
│                    ┌─────────────┐                          │
│                    │  LangGraph  │                          │
│                    │  工作流编排  │                          │
│                    └─────────────┘                          │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MaaS 模型服务层                         │   │
│  ├─────────┬─────────┬─────────┬─────────┬─────────┤   │
│  │ OpenAI  │Anthropic│ Google  │  阿里云 │  百度   │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                           ↓                                 │
│                    ┌─────────────┐                          │
│                    │  回复生成   │                          │
│                    └─────────────┘                          │
│                           ↓                                 │
│                    ┌─────────────┐                          │
│                    │  用户展示   │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. TypeScript 配置

### 3.1 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.2 项目结构

```
test000001/
├── src/
│   ├── main.ts              # 入口文件
│   ├── app.ts               # 应用主逻辑
│   ├── types/               # 类型定义
│   │   ├── index.ts         # 类型导出
│   │   ├── mood.ts          # 心情类型
│   │   ├── rant.ts          # 吐槽类型
│   │   ├── countdown.ts     # 倒计时类型
│   │   ├── gallery.ts       # 相册类型
│   │   ├── timeline.ts      # 时间轴类型
│   │   └── chat.ts          # 聊天类型
│   ├── modules/             # 功能模块
│   │   ├── mood.ts          # 心情模块
│   │   ├── rant.ts          # 吐槽模块
│   │   ├── countdown.ts     # 倒计时模块
│   │   ├── gallery.ts       # 相册模块
│   │   ├── timeline.ts      # 时间轴模块
│   │   └── chat.ts          # 智能助手模块
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # 存储工具
│   │   ├── dom.ts           # DOM 操作工具
│   │   └── helpers.ts       # 辅助函数
│   ├── styles/              # 样式文件
│   │   ├── main.css         # 主样式
│   │   ├── components/      # 组件样式
│   │   └── animations.css   # 动画样式
│   └── assets/              # 静态资源
│       ├── images/          # 图片资源
│       └── icons/           # 图标资源
├── public/                  # 公共资源
│   └── index.html           # HTML 模板
├── docs/                    # 项目文档
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── PROJECT.md               # 项目概述
├── CLAUDE.md                # Claude Code 配置
└── README.md                # 项目说明
```

---

## 4. 类型定义示例

### 4.1 心情类型

```typescript
// src/types/mood.ts
export type MoodType = 'happy' | 'love' | 'sad' | 'angry' | 'thinking' | 'sleepy';

export interface MoodRecord {
  id: number;
  emoji: string;
  mood: MoodType;
  text: string;
  time: string;
}

export interface MoodFormData {
  mood: MoodType | null;
  text: string;
}
```

### 4.2 吐槽类型

```typescript
// src/types/rant.ts
export type RantType = 'rant' | 'scold' | 'complain';

export interface RantRecord {
  id: number;
  type: RantType;
  typeName: string;
  text: string;
  intensity: number; // 1-10
  time: string;
}

export interface RantFormData {
  type: RantType;
  text: string;
  intensity: number;
}
```

### 4.3 倒计时类型

```typescript
// src/types/countdown.ts
export type CountdownIcon = '🎂' | '💕' | '🎄' | '✈️' | '🎓' | '💍' | '❤️';

export interface CountdownItem {
  id: number;
  title: string;
  date: string; // ISO 格式
  icon: CountdownIcon;
}

export interface CountdownFormData {
  title: string;
  date: string;
  icon: CountdownIcon;
}
```

### 4.4 相册类型

```typescript
// src/types/gallery.ts
export interface Photo {
  id: number;
  src: string; // Base64
  caption: string;
  time: string;
}

export interface GalleryFormData {
  photos: File[];
  caption: string;
}
```

### 4.5 时间轴类型

```typescript
// src/types/timeline.ts
export type TimelineIcon = '💕' | '🎉' | '✈️' | '🍽️' | '🎬' | '🎵' | '📸' | '❤️';

export interface TimelineEvent {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  desc: string;
  icon: TimelineIcon;
}

export interface TimelineFormData {
  date: string;
  title: string;
  desc: string;
  icon: TimelineIcon;
}
```

### 4.6 聊天类型

```typescript
// src/types/chat.ts
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: number;
  role: MessageRole;
  content: string;
  time: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  modelProvider?: string;
}

export interface ChatResponse {
  response: string;
  emotion?: string;
  modelUsed?: string;
}
```

---

## 5. 模块实现示例

### 5.1 存储工具

```typescript
// src/utils/storage.ts
export class Storage {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }
}
```

### 5.2 心情模块

```typescript
// src/modules/mood.ts
import { Storage } from '../utils/storage';
import type { MoodRecord, MoodFormData, MoodType } from '../types/mood';

export class MoodModule {
  private storageKey = 'moods';

  getMoods(): MoodRecord[] {
    return Storage.get<MoodRecord[]>(this.storageKey, []);
  }

  addMood(data: MoodFormData): void {
    if (!data.mood || !data.text.trim()) {
      throw new Error('请选择心情并填写文字');
    }

    const moods = this.getMoods();
    const moodEmojis: Record<MoodType, string> = {
      happy: '😊',
      love: '🥰',
      sad: '😢',
      angry: '😠',
      thinking: '🤔',
      sleepy: '😴'
    };

    const newMood: MoodRecord = {
      id: Date.now(),
      emoji: moodEmojis[data.mood],
      mood: data.mood,
      text: data.text,
      time: new Date().toLocaleString('zh-CN')
    };

    moods.unshift(newMood);
    Storage.set(this.storageKey, moods);
  }

  deleteMood(id: number): void {
    const moods = this.getMoods().filter(m => m.id !== id);
    Storage.set(this.storageKey, moods);
  }
}
```

---

## 6. Vite 配置

### 6.1 vite.config.ts

```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### 6.2 package.json

```json
{
  "name": "test000001",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

---

## 7. 智能助手后端技术栈

### 7.1 核心框架

| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| Python | 3.11+ | 后端语言 | LangChain 生态支持好 |
| FastAPI | 最新 | Web 框架 | 高性能、异步支持 |
| LangChain | 最新 | LLM 框架 | 标准化 LLM 开发 |
| LangGraph | 最新 | 工作流编排 | 多智能体编排 |

### 7.2 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                      部署架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   浏览器    │ →  │   Vercel    │ →  │  FastAPI    │     │
│  │   (TS)      │    │   (前端)    │    │  (后端)     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                           ↓                                 │
│                    ┌─────────────┐                          │
│                    │  LangChain  │                          │
│                    │  应用层     │                          │
│                    └─────────────┘                          │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              MaaS 模型服务                           │   │
│  │  OpenAI / Anthropic / 通义千问 / 文心一言 / ...     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. 开发工具配置

### 8.1 ESLint 配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
};
```

### 8.2 Prettier 配置

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

---

## 9. 总结

### 9.1 前端技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| **语言** | TypeScript 5.x | 类型安全、更好的开发体验 |
| **构建** | Vite 5.x | 快速热更新、原生 ESM |
| **样式** | CSS3 | Flexbox/Grid 布局、动画 |
| **图标** | Font Awesome 6.4.0 | 丰富的图标资源 |

### 9.2 智能助手技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| **后端** | Python + FastAPI | 高性能、异步支持 |
| **框架** | LangChain + LangGraph | LLM 应用开发、工作流编排 |
| **模型** | 多厂商 MaaS | OpenAI、Anthropic、通义千问等 |

### 9.3 开发流程

1. **初始化项目**：`npm create vite@latest`
2. **安装依赖**：`npm install`
3. **开发调试**：`npm run dev`
4. **类型检查**：`npm run build`
5. **代码规范**：`npm run lint`
6. **代码格式化**：`npm run format`

### 9.4 下一步

1. 初始化 TypeScript + Vite 项目
2. 配置 TypeScript、ESLint、Prettier
3. 实现前端功能模块
4. 开发智能助手后端
5. 集成 LangChain 智能助手