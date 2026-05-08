// 首页：英雄区 + 功能卡片导航
import { Link } from 'react-router-dom';
import { Particles } from './Particles';
import { LoveCounter } from './LoveCounter';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-love-bg to-pink-100 relative overflow-hidden">
        <Particles />
        <div className="text-center z-10 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4 animate-pulse">
            给最爱的你
          </h1>
          <p className="text-lg text-gray-500 mb-8">每一个瞬间，都想和你分享</p>
          <LoveCounter />
          <Link
            to="/mood"
            className="inline-block mt-6 bg-primary text-white px-8 py-3 rounded-full text-lg shadow-lg hover:bg-primary-dark hover:-translate-y-0.5 transition-all"
          >
            开始记录 ❤️
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">我们的专属空间</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { to: '/mood', icon: '😊', title: '心情记录', desc: '记录每天的心情变化' },
            { to: '/rant', icon: '😤', title: '吐槽专区', desc: '不开心就来这里发泄' },
            { to: '/countdown', icon: '⏰', title: '重要日子', desc: '倒计时每一个特别时刻' },
            { to: '/gallery', icon: '📸', title: '甜蜜相册', desc: '珍藏我们的每张照片' },
            { to: '/timeline', icon: '📅', title: '时间轴', desc: '回顾我们的故事' },
          ].map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-card p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <span className="text-4xl">{card.icon}</span>
              <h3 className="text-lg font-bold mt-3 text-gray-800">{card.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
