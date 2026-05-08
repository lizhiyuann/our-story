// 导航栏组件：桌面端横向菜单 + 移动端汉堡菜单 + 主题切换
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ThemeSwitcher } from './ThemeSwitcher';

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/mood', label: '心情', icon: '😊' },
  { to: '/rant', label: '吐槽', icon: '😤' },
  { to: '/countdown', label: '倒计时', icon: '⏰' },
  { to: '/gallery', label: '相册', icon: '📸' },
  { to: '/timeline', label: '时间轴', icon: '📅' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <nav className="fixed top-0 w-full bg-[var(--color-card)]/95 backdrop-blur-sm shadow-sm z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-xl font-bold text-[var(--color-primary)]">
          ❤️ My Love
        </NavLink>

        <ul className="hidden md:flex gap-1 list-none">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-card text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg)]'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user && (
            <span className="hidden sm:inline text-sm text-[var(--color-text-muted)]">
              {user.displayName}
            </span>
          )}
          {user && (
            <button onClick={logout} className="text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
              退出
            </button>
          )}
          <button
            className="md:hidden text-xl"
            onClick={() => setOpen(!open)}
            aria-label="菜单"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <ul className="md:hidden bg-[var(--color-card)] border-t border-[var(--color-border)] list-none animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-light)] hover:bg-[var(--color-bg)]'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
