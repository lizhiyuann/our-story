import { useState } from 'react';
import { useCountdowns, useCreateCountdown, useDeleteCountdown } from '../../hooks/useCountdown';
import { useToast } from '../../components/Toast';
import { CountdownCard } from './CountdownCard';

const ICONS = [
  { value: '🎂', label: '生日' },
  { value: '💕', label: '纪念日' },
  { value: '🎄', label: '节日' },
  { value: '✈️', label: '旅行' },
  { value: '🎓', label: '毕业' },
  { value: '💍', label: '求婚' },
  { value: '❤️', label: '其他' },
];

export function CountdownPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [icon, setIcon] = useState('❤️');
  const { data: countdowns, isLoading } = useCountdowns();
  const createCountdown = useCreateCountdown();
  const deleteCountdown = useDeleteCountdown();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!title.trim() || !date) return showToast('请填写完整信息！', 'error');
    createCountdown.mutate(
      { title: title.trim(), targetDate: date, icon },
      {
        onSuccess: () => {
          setTitle('');
          setDate('');
          showToast('倒计时已添加 ⏰');
        },
        onError: () => showToast('添加失败', 'error'),
      },
    );
  };

  const items = countdowns?.data ?? [];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-10">⏰ 重要日子倒计时</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">添加新的倒计时</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="事件名称"
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-3 transition-colors"
          />
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-3 transition-colors"
          />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-4 transition-colors"
          >
            {ICONS.map((i) => (
              <option key={i.value} value={i.value}>{i.value} {i.label}</option>
            ))}
          </select>
          <button
            onClick={handleSubmit}
            disabled={createCountdown.isPending}
            className="w-full bg-primary text-white py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            添加 ⏰
          </button>
        </div>

        {/* Countdown cards */}
        <div className="md:col-span-2">
          {isLoading ? (
            <p className="text-gray-400 text-center py-12">加载中...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-center py-12">还没有倒计时哦~</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <CountdownCard
                  key={item.id}
                  item={item}
                  onDelete={() => deleteCountdown.mutate(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
