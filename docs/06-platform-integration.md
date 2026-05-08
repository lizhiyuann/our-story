# 平台集成设计文档

## 1. 概述

### 1.1 集成目标
将智能助手集成到主流社交平台，让用户可以通过钉钉、微信等平台直接与智能助手交互。

### 1.2 支持平台

| 平台 | 集成方式 | 优先级 | 状态 |
|------|----------|--------|------|
| 微信公众号 | 微信公众平台 API | 高 | 待开发 |
| 微信小程序 | 微信小程序 API | 高 | 待开发 |
| 钉钉 | 钉钉开放平台 | 高 | 待开发 |
| 飞书 | 飞书开放平台 | 中 | 待开发 |
| 企业微信 | 企业微信 API | 中 | 待开发 |
| Telegram | Telegram Bot API | 低 | 待开发 |
| Discord | Discord Bot API | 低 | 待开发 |

---

## 2. 微信集成

### 2.1 微信公众号

#### 集成方式
- **消息接口**：接收和回复用户消息
- **菜单接口**：自定义菜单
- **模板消息**：主动推送消息

#### 技术架构
```
用户微信
    ↓
微信服务器
    ↓
我们的服务器 (FastAPI)
    ↓
LangChain 智能助手
    ↓
MaaS 模型服务
    ↓
回复用户
```

#### API 配置
```python
# app/platforms/wechat.py
from wechatpy import WeChatClient

class WeChatPlatform:
    def __init__(self):
        self.app_id = os.getenv('WECHAT_APP_ID')
        self.app_secret = os.getenv('WECHAT_APP_SECRET')
        self.token = os.getenv('WECHAT_TOKEN')
        self.client = WeChatClient(self.app_id, self.app_secret)
    
    def verify_signature(self, signature, timestamp, nonce):
        """验证微信签名"""
        ...
    
    def parse_message(self, xml_data):
        """解析微信消息"""
        ...
    
    def reply_text(self, to_user, from_user, content):
        """回复文本消息"""
        ...
```

#### 消息处理流程
```python
@app.post("/api/wechat")
async def wechat_callback(request: Request):
    # 验证签名
    signature = request.query_params.get('signature')
    timestamp = request.query_params.get('timestamp')
    nonce = request.query_params.get('nonce')
    
    if not wechat.verify_signature(signature, timestamp, nonce):
        raise HTTPException(status_code=403)
    
    # 解析消息
    xml_data = await request.body()
    message = wechat.parse_message(xml_data)
    
    # 生成回复
    response = await chat_assistant.chat(message.content)
    
    # 返回 XML 响应
    return wechat.reply_text(
        to_user=message.from_user,
        from_user=message.to_user,
        content=response
    )
```

---

### 2.2 微信小程序

#### 集成方式
- **云开发**：使用微信云开发
- **云函数**：调用智能助手 API
- **消息推送**：订阅消息

#### 技术架构
```
小程序前端
    ↓
云函数
    ↓
我们的服务器 (FastAPI)
    ↓
LangChain 智能助手
    ↓
MaaS 模型服务
    ↓
返回结果
```

#### 云函数示例
```javascript
// cloudfunctions/chat/index.js
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init()

exports.main = async (event, context) => {
  const { message, history } = event
  
  try {
    const response = await axios.post('https://your-server.com/api/chat', {
      message,
      history
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

#### 小程序页面
```html
<!-- pages/chat/chat.wxml -->
<view class="chat-container">
  <scroll-view scroll-y class="message-list">
    <block wx:for="{{messages}}" wx:key="id">
      <view class="message {{item.role === 'user' ? 'user' : 'bot'}}">
        <text>{{item.content}}</text>
      </view>
    </block>
  </scroll-view>
  
  <view class="input-area">
    <input 
      value="{{inputValue}}" 
      bindinput="onInput" 
      placeholder="输入消息..."
    />
    <button bindtap="sendMessage">发送</button>
  </view>
</view>
```

---

## 3. 钉钉集成

### 3.1 钉钉机器人

#### 集成方式
- **自定义机器人**：Webhook 方式
- **企业内部机器人**：完整功能
- **群机器人**：群聊场景

#### 技术架构
```
钉钉用户
    ↓
钉钉服务器
    ↓
我们的服务器 (FastAPI)
    ↓
LangChain 智能助手
    ↓
MaaS 模型服务
    ↓
回复用户
```

#### API 配置
```python
# app/platforms/dingtalk.py
import hmac
import hashlib
import base64
import time
import requests

class DingTalkPlatform:
    def __init__(self):
        self.app_key = os.getenv('DINGTALK_APP_KEY')
        self.app_secret = os.getenv('DINGTALK_APP_SECRET')
        self.robot_code = os.getenv('DINGTALK_ROBOT_CODE')
    
    def verify_signature(self, timestamp, sign):
        """验证钉钉签名"""
        string_to_sign = f"{timestamp}\n{self.app_secret}"
        hmac_code = hmac.new(
            self.app_secret.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            digestmod=hashlib.sha256
        ).digest()
        sign_str = base64.b64encode(hmac_code).decode('utf-8')
        return sign_str == sign
    
    def send_message(self, conversation_id, content):
        """发送消息"""
        url = "https://api.dingtalk.com/v1.0/robot/groupMessages/send"
        headers = {
            "Content-Type": "application/json",
            "x-acs-dingtalk-access-token": self.get_access_token()
        }
        data = {
            "msgParam": json.dumps({"content": content}),
            "msgKey": "sampleText",
            "openConversationId": conversation_id
        }
        response = requests.post(url, json=data, headers=headers)
        return response.json()
```

#### 消息处理流程
```python
@app.post("/api/dingtalk")
async def dingtalk_callback(request: Request):
    # 验证签名
    timestamp = request.headers.get('timestamp')
    sign = request.headers.get('sign')
    
    if not dingtalk.verify_signature(timestamp, sign):
        raise HTTPException(status_code=403)
    
    # 解析消息
    body = await request.json()
    message = body.get('text', {}).get('content', '')
    conversation_id = body.get('conversationId')
    
    # 生成回复
    response = await chat_assistant.chat(message)
    
    # 发送回复
    dingtalk.send_message(conversation_id, response)
    
    return {"success": True}
```

---

## 4. 飞书集成

### 4.1 飞书机器人

#### 集成方式
- **自定义机器人**：Webhook 方式
- **应用机器人**：完整功能

#### API 配置
```python
# app/platforms/feishu.py
import lark_oapi as lark

class FeishuPlatform:
    def __init__(self):
        self.app_id = os.getenv('FEISHU_APP_ID')
        self.app_secret = os.getenv('FEISHU_APP_SECRET')
        self.client = lark.Client.builder() \
            .app_id(self.app_id) \
            .app_secret(self.app_secret) \
            .build()
    
    def send_message(self, receive_id, content):
        """发送消息"""
        request = lark.api.im.v1.CreateMessageRequest.builder() \
            .receive_id_type("chat_id") \
            .request_body(lark.api.im.v1.CreateMessageRequestBody.builder()
                .receive_id(receive_id)
                .msg_type("text")
                .content(json.dumps({"text": content}))
                .build()) \
            .build()
        
        response = self.client.im.v1.message.create(request)
        return response
```

---

## 5. 统一消息网关

### 5.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    统一消息网关                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  微信   │ │  钉钉   │ │  飞书   │ │ Telegram│         │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘         │
│       │          │          │          │                   │
│       └──────────┴──────────┴──────────┘                   │
│                        ↓                                    │
│               ┌─────────────┐                              │
│               │  消息路由器  │                              │
│               └─────────────┘                              │
│                        ↓                                    │
│               ┌─────────────┐                              │
│               │  LangChain  │                              │
│               │  智能助手    │                              │
│               └─────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 消息路由器

```python
# app/gateway/router.py
from typing import Dict, Any
from app.platforms.wechat import WeChatPlatform
from app.platforms.dingtalk import DingTalkPlatform
from app.platforms.feishu import FeishuPlatform

class MessageRouter:
    """消息路由器"""
    
    def __init__(self):
        self.platforms = {
            'wechat': WeChatPlatform(),
            'dingtalk': DingTalkPlatform(),
            'feishu': FeishuPlatform(),
        }
        self.chat_assistant = ChatAssistant()
    
    async def handle_message(self, platform: str, message: str, 
                           user_id: str, **kwargs) -> str:
        """处理来自不同平台的消息"""
        # 生成回复
        response = await self.chat_assistant.chat(message)
        
        # 发送到对应平台
        await self.platforms[platform].send_message(
            user_id=user_id,
            content=response,
            **kwargs
        )
        
        return response
```

### 5.3 用户会话管理

```python
# app/gateway/session.py
from typing import Dict, List
from datetime import datetime, timedelta

class SessionManager:
    """会话管理器"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.session_ttl = timedelta(hours=24)
    
    async def get_history(self, platform: str, user_id: str) -> List[Dict]:
        """获取用户对话历史"""
        key = f"session:{platform}:{user_id}"
        history = await self.redis.get(key)
        return json.loads(history) if history else []
    
    async def add_message(self, platform: str, user_id: str, 
                         role: str, content: str):
        """添加消息到历史"""
        key = f"session:{platform}:{user_id}"
        history = await self.get_history(platform, user_id)
        
        history.append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })
        
        # 保留最近 20 条消息
        history = history[-20:]
        
        await self.redis.setex(
            key,
            self.session_ttl,
            json.dumps(history)
        )
```

---

## 6. 部署架构

### 6.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户端                                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │  微信   │ │  钉钉   │ │  飞书   │ │  网站   │         │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘         │
│       │          │          │          │                   │
└───────┼──────────┼──────────┼──────────┼───────────────────┘
        │          │          │          │
        └──────────┴──────────┴──────────┘
                     ↓
        ┌─────────────────────────────────┐
        │         Nginx 反向代理          │
        └─────────────────────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │    FastAPI 应用服务器           │
        │    (统一消息网关)               │
        └─────────────────────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │    LangChain 智能助手           │
        │    + MaaS 模型服务              │
        └─────────────────────────────────┘
                     ↓
        ┌─────────────────────────────────┐
        │    PostgreSQL + Redis           │
        │    (数据存储)                   │
        └─────────────────────────────────┘
```

### 6.2 Docker 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chat
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - WECHAT_APP_ID=${WECHAT_APP_ID}
      - WECHAT_APP_SECRET=${WECHAT_APP_SECRET}
      - DINGTALK_APP_KEY=${DINGTALK_APP_KEY}
      - DINGTALK_APP_SECRET=${DINGTALK_APP_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=chat
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

---

## 7. 安全设计

### 7.1 API 安全

```python
# app/security/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """验证 API Token"""
    token = credentials.credentials
    
    # 验证 Token
    if not validate_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return token
```

### 7.2 平台安全

| 平台 | 安全措施 |
|------|----------|
| 微信 | 消息签名验证、IP 白名单 |
| 钉钉 | 时间戳签名验证、加密传输 |
| 飞书 | 签名验证、Token 认证 |

### 7.3 数据安全

- 敏感信息加密存储
- 传输使用 HTTPS
- 定期备份数据
- 访问日志记录

---

## 8. 监控与日志

### 8.1 日志配置

```python
# app/logging/config.py
import logging
from logging.handlers import RotatingFileHandler

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler('app.log', maxBytes=10*1024*1024, backupCount=5),
            logging.StreamHandler()
        ]
    )
```

### 8.2 监控指标

| 指标 | 说明 | 告警阈值 |
|------|------|----------|
| 请求量 | API 调用次数 | > 1000/min |
| 响应时间 | API 响应延迟 | > 3s |
| 错误率 | 请求失败比例 | > 5% |
| 模型调用 | MaaS 调用次数 | > 500/min |

---

## 9. 开发计划

### 9.1 阶段一：基础架构（第 1-2 周）

- [ ] 统一消息网关设计
- [ ] 消息路由器实现
- [ ] 会话管理实现
- [ ] 基础 API 开发

### 9.2 阶段二：微信集成（第 3-4 周）

- [ ] 微信公众号集成
- [ ] 微信小程序开发
- [ ] 消息处理流程
- [ ] 测试和优化

### 9.3 阶段三：钉钉集成（第 5-6 周）

- [ ] 钉钉机器人开发
- [ ] 消息处理流程
- [ ] 群聊支持
- [ ] 测试和优化

### 9.4 阶段四：飞书集成（第 7-8 周）

- [ ] 飞书机器人开发
- [ ] 消息处理流程
- [ ] 测试和优化

### 9.5 阶段五：优化上线（第 9-10 周）

- [ ] 性能优化
- [ ] 安全加固
- [ ] 文档编写
- [ ] 正式上线

---

## 10. 总结

### 10.1 集成平台

- **微信**：公众号 + 小程序
- **钉钉**：企业内部机器人
- **飞书**：应用机器人
- **扩展**：Telegram、Discord 等

### 10.2 技术架构

- **统一消息网关**：FastAPI
- **智能助手**：LangChain + LangGraph
- **数据存储**：PostgreSQL + Redis
- **部署**：Docker + Nginx

### 10.3 开发周期

**总计**：10 周（约 2.5 个月）

### 10.4 下一步

1. 确定优先集成的平台
2. 申请平台开发者账号
3. 搭建基础架构
4. 开始开发