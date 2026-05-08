// 主题切换组件：4 套主题风格下拉选择
import { useState, useRef, useEffect } from 'react';
import { useThemeStore, THEMES } from '../stores/theme.store';

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="切换主题"
      >
        <span>{current.icon}</span>
        <span className="hidden sm:inline text-gray-600">{current.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-card shadow-lg border border-gray-100 py-2 min-w-[160px] z-50 animate-fade-in">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                theme === t.id
                  ? 'bg-pink-50 text-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <div className="text-left">
                <div>{t.name}</div>
                <div className="text-xs text-gray-400">{t.description}</div>
              </div>
              {theme === t.id && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
