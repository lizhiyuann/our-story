// 全局布局组件：导航栏 + 内容区 + 页脚
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <footer className="bg-white py-6 text-center text-sm text-gray-400 shadow-inner">
        ❤️ 用爱制作，献给最爱的你 ❤️
      </footer>
    </div>
  );
}
