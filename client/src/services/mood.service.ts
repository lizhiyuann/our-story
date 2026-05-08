import type { Mood } from '../types';
import { get, post, del } from './api.client';

export const moodService = {
  list: (page = 1, limit = 20) => get<Mood[]>('/moods', { page, limit }),
  create: (input: { moodType: string; emoji: string; content: string }) => post<Mood>('/moods', input),
  delete: (id: number) => del<null>(`/moods/${id}`),
};
