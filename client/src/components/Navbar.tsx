import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

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
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="text-xl font-bold text-primary">
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
                    isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-pink-50'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline text-sm text-gray-500">
              {user.displayName}
            </span>
          )}
          {user && (
            <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">
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
        <ul className="md:hidden bg-white border-t list-none animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-pink-50'
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
