import type { ChatMessage } from '../types';
import { get, post } from './api.client';

export const chatService = {
  send: (message: string) => post<{ reply: string }>('/chat', { message }),
  history: (limit = 50) => get<ChatMessage[]>('/chat/history', { limit }),
};
