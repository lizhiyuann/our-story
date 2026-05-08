// 共享类型定义：API 响应、业务实体、常量
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface User {
  id: number;
  username: string;
  displayName: string;
}

export interface Mood {
  id: number;
  userId: number;
  moodType: string;
  emoji: string;
  content: string;
  createdAt: string;
}

export interface Rant {
  id: number;
  userId: number;
  rantType: string;
  content: string;
  intensity: number;
  createdAt: string;
}

export interface Countdown {
  id: number;
  userId: number;
  title: string;
  targetDate: string;
  icon: string;
  createdAt: string;
}

export interface Photo {
  id: number;
  userId: number;
  filePath: string;
  thumbnailPath: string | null;
  caption: string | null;
  createdAt: string;
}

export interface TimelineEvent {
  id: number;
  userId: number;
  eventDate: string;
  title: string;
  description: string | null;
  icon: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export type MoodType = 'happy' | 'love' | 'sad' | 'angry' | 'thinking' | 'sleepy';

export const MOOD_EMOJIS: Record<MoodType, string> = {
  happy: '😊',
  love: '🥰',
  sad: '😢',
  angry: '😠',
  thinking: '🤔',
  sleepy: '😴',
};

export const RANT_TYPE_NAMES: Record<string, string> = {
  rant: '吐槽',
  scold: '骂人',
  complain: '抱怨',
};
