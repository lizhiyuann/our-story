// 主题状态管理：4 套主题风格，localStorage 持久化
import { create } from 'zustand';

export type ThemeId = 'pink' | 'blue' | 'dark' | 'green';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'pink', name: '浪漫粉', icon: '💕', description: '温馨甜蜜' },
  { id: 'blue', name: '清新蓝', icon: '🌊', description: '清爽舒适' },
  { id: 'dark', name: '暗夜紫', icon: '🌙', description: '暗色护眼' },
  { id: 'green', name: '自然绿', icon: '🌿', description: '清新自然' },
];

const STORAGE_KEY = 'our-story-theme';

function getInitialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) return saved as ThemeId;
  } catch { /* ignore */ }
  return 'pink';
}

interface ThemeState {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (id) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem(STORAGE_KEY, id);
    set({ theme: id });
  },
}));

// 初始化时立即应用主题
document.documentElement.setAttribute('data-theme', getInitialTheme());
