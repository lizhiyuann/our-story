// 配置服务：从后端获取应用配置（纪念日、心情类型等）
import { get } from './api.client';

export interface AppConfig {
  love: { startDate: string; emoji: string };
  moods: { types: string[]; emojis: Record<string, string> };
  rants: { types: string[]; typeNames: Record<string, string>; maxIntensity: number };
  countdown: { icons: { value: string; label: string }[] };
  timeline: { icons: { value: string; label: string }[] };
  photos: { maxSizeMB: number; allowedTypes: string[] };
  chat: { maxHistoryLength: number; maxMessageLength: number };
}

export const configService = {
  get: () => get<AppConfig>('/config'),
};
