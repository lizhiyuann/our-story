// 聊天 API 服务：发送消息、获取历史
import type { ChatMessage } from '../types';
import { get, post } from './api.client';

export const chatService = {
  send: (message: string) => post<{ reply: string }>('/chat', { message }),
  history: (limit = 50) => get<ChatMessage[]>('/chat/history', { limit }),
};
