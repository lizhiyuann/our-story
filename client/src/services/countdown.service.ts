// 倒计时 API 服务：list / create / delete
import type { Countdown } from '../types';
import { get, post, del } from './api.client';

export const countdownService = {
  list: () => get<Countdown[]>('/countdowns'),
  create: (input: { title: string; targetDate: string; icon?: string }) => post<Countdown>('/countdowns', input),
  delete: (id: number) => del<null>(`/countdowns/${id}`),
};
