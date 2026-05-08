// 倒计时卡片：实时更新的天/时/分/秒显示
import { useState, useEffect } from 'react';
import type { Countdown } from '../../types';
import { ReplySection } from '../../components/ReplySection';
import { calcCountdown } from '../../utils/date';

interface Props { item: Countdown; onDelete: () => void; }

export function CountdownCard({ item, onDelete }: Props) {
  const [time, setTime] = useState(() => calcCountdown(item.targetDate));
  useEffect(() => { const t = setInterval(() => setTime(calcCountdown(item.targetDate)), 1000); return () => clearInterval(t); }, [item.targetDate]);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-[var(--color-card)] rounded-card shadow p-6 text-center relative group hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light rounded-t-card" />
      <button onClick={onDelete} className="absolute top-3 right-3 text-[var(--color-text-muted)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">&times;</button>
      <span className="text-4xl">{item.icon}</span>
      <h3 className="text-lg font-semibold mt-2 mb-3">{item.title}</h3>
      {time.expired ? <p className="text-[var(--color-text-muted)]">已过期</p> : (
        <div className="flex justify-center gap-3 flex-wrap">
          {[{ v: time.days, l: '天' }, { v: time.hours, l: '时' }, { v: time.minutes, l: '分' }, { v: time.seconds, l: '秒' }].map((u) => (
            <div key={u.l} className="text-center">
              <span className="block text-2xl font-bold text-primary bg-love-bg px-3 py-1 rounded-card min-w-[50px]">{u.l === '天' ? u.v : pad(u.v)}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{u.l}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--color-text-muted)] mt-3">{new Date(item.targetDate).toLocaleDateString('zh-CN')}</p>
      <ReplySection targetType="countdown" targetId={item.id} />
    </div>
  );
}
