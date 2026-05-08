// 聊天 API 服务：发送消息、流式输出、清空历史
import type { ChatMessage } from '../types';
import { get, post, del } from './api.client';

export const chatService = {
  /** 非流式发送 */
  send: (message: string) => post<{ reply: string }>('/chat', { message }),

  /** 流式发送（返回 EventSource） */
  sendStream: (message: string, onChunk: (text: string) => void, onDone: () => void, onError: (err: string) => void) => {
    const controller = new AbortController();

    fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message }),
      signal: controller.signal,
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        onError(`HTTP ${res.status}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) onChunk(data.text);
            if (data.done) { onDone(); return; }
            if (data.error) { onError(data.error); return; }
          } catch { /* skip */ }
        }
      }
      onDone();
    }).catch((err) => {
      if (err.name !== 'AbortError') onError(err.message);
    });

    return controller;
  },

  /** 获取历史 */
  history: (limit = 50) => get<ChatMessage[]>('/chat/history', { limit }),

  /** 清空历史 */
  clear: () => del<null>('/chat/history'),
};
