// 回复 API 服务
import { get, post, del } from './api.client';

export interface Reply {
  id: number;
  userId: number;
  targetType: string;
  targetId: number;
  content: string;
  createdAt: string;
  displayName: string | null;
}

export const replyService = {
  list: (targetType: string, targetId: number) =>
    get<Reply[]>(`/replies/${targetType}/${targetId}`),
  create: (input: { targetType: string; targetId: number; content: string }) =>
    post<Reply>('/replies', input),
  delete: (id: number) => del<null>(`/replies/${id}`),
};
