# 架构设计文档

## 1. 架构概述

### 1.1 架构风格
**单页应用（SPA）** - 纯前端架构，无后端服务

### 1.2 设计原则
- **单一职责**：每个模块负责一个功能
- **模块化**：组件独立，便于维护
- **响应式**：自适应不同设备
- **性能优先**：优化加载和渲染

### 1.3 技术架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  首页   │ │  心情   │ │  吐槽   │ │ 倒计时  │ │  相册   │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐                                     │
│  │ 时间轴  │ │ 智能助手 │                                     │
│  └─────────┘ └─────────┘                                     │
├─────────────────────────────────────────────────────────────┤
│                        交互逻辑层                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │  事件处理   │ │  数据验证   │ │  动画控制   │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │  文件处理   │ │  聊天逻辑   │ │  路由管理   │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│                        数据存储层                            │
├─────────────────────────────────────────────────────────────┤
│              ┌─────────────────────────────────┐             │
│              │     localStorage (浏览器)       │             │
│              └─────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 模块划分

### 2.1 目录结构

```
test000001/
├── index.html                 # 主页面（SPA入口）
├── css/
│   ├── style.css             # 主样式文件
│   ├── components/           # 组件样式（可选）
│   └── animations.css        # 动画样式（可选）
├── js/
│   ├── app.js                # 主逻辑文件
│   ├── modules/              # 功能模块（可选）
│   │   ├── mood.js          # 心情模块
│   │   ├── rant.js          # 吐槽模块
│   │   ├── countdown.js     # 倒计时模块
│   │   ├── gallery.js       # 相册模块
│   │   ├── timeline.js      # 时间轴模块
│   │   └── chat.js          # 智能助手模块
│   └── utils/                # 工具函数（可选）
│       ├── storage.js       # 存储工具
│       └── helpers.js       # 辅助函数
├── assets/                   # 静态资源
│   ├── images/              # 图片资源
│   └── icons/               # 图标资源
├── docs/                     # 项目文档
│   ├── 01-requirements-analysis.md
│   ├── 02-architecture-design.md
│   ├── 03-tech-stack-selection.md
│   ├── 04-frontend-design.md
│   └── 05-development-plan.md
├── PROJECT.md                # 项目概述
├── CLAUDE.md                 # Claude Code 配置
└── README.md                 # 项目说明
```

### 2.2 模块职责

| 模块 | 文件 | 职责 |
|------|------|------|
| 主页面 | index.html | 页面结构、导航、布局 |
| 样式 | css/style.css | 全局样式、组件样式、响应式 |
| 主逻辑 | js/app.js | 模块初始化、事件绑定、数据流 |
| 心情模块 | js/modules/mood.js | 心情记录的增删改查 |
| 吐槽模块 | js/modules/rant.js | 吐槽记录的增删改查 |
| 倒计时模块 | js/modules/countdown.js | 倒计时的添加、删除、更新 |
| 相册模块 | js/modules/gallery.js | 照片的上传、展示、删除 |
| 时间轴模块 | js/modules/timeline.js | 事件的添加、展示、删除 |
| 智能助手 | js/modules/chat.js | 聊天逻辑、关键词匹配、回复生成 |

---

## 3. 数据流设计

### 3.1 数据流图

```
用户操作
    ↓
事件监听（Event Listener）
    ↓
数据验证（Validation）
    ↓
数据处理（Processing）
    ↓
存储操作（localStorage）
    ↓
UI 更新（DOM Manipulation）
    ↓
动画反馈（Animation）
```

### 3.2 数据存储设计

#### 存储键名规范
```
moods      - 心情记录数组
rants      - 吐槽记录数组
countdowns - 倒计时数组
photos     - 照片数组
timeline   - 时间轴事件数组
```

#### 存储操作封装
```javascript
const storage = {
    // 获取数据
    get(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    // 保存数据
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    // 删除数据
    remove(key) {
        localStorage.removeItem(key);
    }
};
```

---

## 4. 组件设计

### 4.1 导航栏组件

#### 结构
```html
<nav class="navbar">
    <div class="nav-brand">❤️ My Love</div>
    <ul class="nav-menu">
        <li><a href="#home">首页</a></li>
        <li><a href="#mood">心情</a></li>
        <li><a href="#rant">吐槽</a></li>
        <li><a href="#countdown">倒计时</a></li>
        <li><a href="#gallery">相册</a></li>
        <li><a href="#timeline">时间轴</a></li>
    </ul>
    <div class="hamburger">汉堡菜单</div>
</nav>
```

#### 功能
- 固定顶部导航
- 平滑滚动到对应区域
- 移动端汉堡菜单
- 当前区域高亮

### 4.2 心情记录组件

#### 结构
```html
<section id="mood">
    <div class="mood-input-box">
        <div class="mood-selector">心情选择器</div>
        <textarea>心情输入框</textarea>
        <button>记录心情</button>
    </div>
    <div class="mood-history">
        <div class="mood-list">心情列表</div>
    </div>
</section>
```

#### 功能
- 心情表情选择
- 文字输入
- 记录提交
- 历史展示

### 4.3 吐槽组件

#### 结构
```html
<section id="rant">
    <div class="rant-input-box">
        <div class="rant-type-selector">类型选择</div>
        <textarea>内容输入</textarea>
        <div class="rant-intensity">强度滑块</div>
        <button>发泄</button>
    </div>
    <div class="rant-history">
        <div class="rant-list">吐槽列表</div>
    </div>
</section>
```

#### 功能
- 吐槽类型选择
- 内容输入
- 强度调整
- 记录展示

### 4.4 倒计时组件

#### 结构
```html
<section id="countdown">
    <div class="countdown-add">
        <input>事件名称</input>
        <input>目标日期</input>
        <select>事件图标</select>
        <button>添加</button>
    </div>
    <div class="countdown-list">
        <div class="countdown-card">倒计时卡片</div>
    </div>
</section>
```

#### 功能
- 事件添加
- 实时倒计时
- 卡片展示
- 事件删除

### 4.5 相册组件

#### 结构
```html
<section id="gallery">
    <div class="gallery-upload">
        <div class="upload-area">上传区域</div>
        <input>照片描述</input>
        <button>上传</button>
    </div>
    <div class="gallery-grid">
        <div class="gallery-item">照片卡片</div>
    </div>
</section>
```

#### 功能
- 照片上传（拖拽/点击）
- 描述输入
- 照片展示
- 大图查看

### 4.6 时间轴组件

#### 结构
```html
<section id="timeline">
    <div class="timeline-add">
        <input>事件日期</input>
        <input>事件标题</input>
        <textarea>事件描述</textarea>
        <select>事件图标</select>
        <button>添加</button>
    </div>
    <div class="timeline">
        <div class="timeline-item">时间轴事件</div>
    </div>
</section>
```

#### 功能
- 事件添加
- 时间轴展示
- 事件详情
- 事件删除

### 4.7 智能助手组件

#### 结构
```html
<div class="chat-window">
    <div class="chat-header">聊天头部</div>
    <div class="chat-messages">消息列表</div>
    <div class="chat-input-area">输入区域</div>
</div>
<div class="chat-assistant-btn">聊天按钮</div>
```

#### 功能
- 聊天窗口开关
- 消息发送
- 智能回复
- 消息展示

---

## 5. 响应式设计

### 5.1 断点设计

| 设备 | 断点 | 布局 |
|------|------|------|
| 手机 | < 768px | 单列布局 |
| 平板 | 768px - 1024px | 双列布局 |
| 桌面 | > 1024px | 多列布局 |

### 5.2 响应式策略

#### 导航栏
- 桌面端：水平导航
- 移动端：汉堡菜单

#### 内容区域
- 桌面端：双列/多列布局
- 移动端：单列布局

#### 卡片组件
- 桌面端：网格布局
- 移动端：堆叠布局

---

## 6. 动画设计

### 6.1 动画类型

| 类型 | 用途 | 示例 |
|------|------|------|
| 入场动画 | 元素出现 | fadeIn、slideUp |
| 交互动画 | 用户操作 | 按钮点击、卡片悬停 |
| 加载动画 | 数据加载 | 旋转、脉冲 |
| 粒子动画 | 背景装饰 | 爱心飘落 |

### 6.2 动画实现

#### CSS 动画
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
```

#### JavaScript 动画
```javascript
// 使用 requestAnimationFrame
function animate(element, property, target, duration) {
    const start = performance.now();
    const startValue = parseFloat(getComputedStyle(element)[property]);
    
    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        element[property] = startValue + (target - startValue) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}
```

---

## 7. 性能优化

### 7.1 加载优化
- 图片懒加载
- 代码分割（可选）
- 资源压缩

### 7.2 渲染优化
- 减少 DOM 操作
- 使用文档碎片
- 避免强制重排

### 7.3 存储优化
- 压缩图片数据
- 定期清理旧数据
- 限制存储容量

---

## 8. 安全设计

### 8.1 数据安全
- 数据本地存储，不上传服务器
- 输入验证，防止 XSS
- 敏感信息不存储

### 8.2 隐私保护
- 仅本地访问
- 无用户追踪
- 无数据收集

---

## 9. 扩展性设计

### 9.1 功能扩展
- 模块化设计，便于添加新功能
- 预留接口，支持功能升级

### 9.2 技术扩展
- 支持迁移到后端存储
- 支持添加用户认证
- 支持多设备同步

---

## 10. 技术选型建议

### 10.1 前端框架
- **推荐**：原生 HTML/CSS/JS（当前方案）
- **备选**：Vue.js、React（如需复杂交互）

### 10.2 UI 框架
- **推荐**：自定义 CSS（当前方案）
- **备选**：Bootstrap、Tailwind CSS

### 10.3 图标库
- **推荐**：Font Awesome（当前方案）
- **备选**：Material Icons、Ionicons

### 10.4 存储方案
- **推荐**：localStorage（当前方案）
- **备选**：IndexedDB（大量数据）

---

## 11. 部署架构

### 11.1 静态部署
```
用户浏览器
    ↓
CDN / 静态服务器
    ↓
HTML/CSS/JS 文件
```

### 11.2 部署选项
- **GitHub Pages**：免费、稳定
- **Vercel**：自动部署、全球 CDN
- **Netlify**：表单处理、函数支持
- **自有服务器**：完全控制

---

## 12. 监控与维护

### 12.1 性能监控
- 页面加载时间
- 动画流畅度
- 存储使用情况

### 12.2 错误监控
- JavaScript 错误捕获
- 存储操作异常
- 用户反馈收集

### 12.3 维护计划
- 定期更新依赖
- 优化性能问题
- 修复已知 Bug