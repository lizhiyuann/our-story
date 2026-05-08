// 时间轴 API 服务：list / create / delete
import type { TimelineEvent } from '../types';
import { get, post, del } from './api.client';

export const timelineService = {
  list: () => get<TimelineEvent[]>('/timeline'),
  create: (input: { eventDate: string; title: string; description?: string; icon?: string }) =>
    post<TimelineEvent>('/timeline', input),
  delete: (id: number) => del<null>(`/timeline/${id}`),
};
