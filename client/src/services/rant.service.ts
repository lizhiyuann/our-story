// 吐槽 API 服务：list / create / delete
import type { Rant } from '../types';
import { get, post, del } from './api.client';

export const rantService = {
  list: (page = 1, limit = 20) => get<Rant[]>('/rants', { page, limit }),
  create: (input: { rantType: string; content: string; intensity: number }) => post<Rant>('/rants', input),
  delete: (id: number) => del<null>(`/rants/${id}`),
};
