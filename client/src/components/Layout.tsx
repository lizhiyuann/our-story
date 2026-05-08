// 全局布局组件：导航栏 + 内容区 + 页脚 + 虚拟宠物猫
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { CatPet } from './CatPet';

export function Layout() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main className="pt-16 pb-8">
        <Outlet />
      </main>
      <footer className="bg-[var(--color-card)] py-6 text-center text-sm text-[var(--color-text-muted)] shadow-inner">
        ❤️ 用爱制作，献给最爱的你 ❤️
      </footer>
      <CatPet />
    </div>
  );
}
