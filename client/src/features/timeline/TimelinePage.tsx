import { useState } from 'react';
import { useTimeline, useCreateTimelineEvent, useDeleteTimelineEvent } from '../../hooks/useTimeline';
import { useToast } from '../../components/Toast';

const ICONS = [
  { value: '💕', label: '相爱' },
  { value: '🎉', label: '庆祝' },
  { value: '✈️', label: '旅行' },
  { value: '🍽️', label: '约会' },
  { value: '🎬', label: '电影' },
  { value: '🎵', label: '音乐' },
  { value: '📸', label: '拍照' },
  { value: '❤️', label: '其他' },
];

export function TimelinePage() {
  const [eventDate, setEventDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💕');
  const { data: events, isLoading } = useTimeline();
  const createEvent = useCreateTimelineEvent();
  const deleteEvent = useDeleteTimelineEvent();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!eventDate || !title.trim()) return showToast('请填写日期和标题！', 'error');
    createEvent.mutate(
      { eventDate, title: title.trim(), description: description.trim() || undefined, icon },
      {
        onSuccess: () => {
          setEventDate('');
          setTitle('');
          setDescription('');
          showToast('事件已添加 📅');
        },
        onError: () => showToast('添加失败', 'error'),
      },
    );
  };

  const items = events?.data ?? [];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-10">📅 我们的时间轴</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white rounded-card shadow p-6 md:sticky md:top-20 self-start">
          <h3 className="text-lg font-semibold text-primary mb-4">添加新事件</h3>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-3 transition-colors"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="事件标题"
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-3 transition-colors"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="详细描述..."
            rows={3}
            className="w-full px-4 py-2.5 border-2 border-love-border rounded-card focus:border-primary focus:outline-none mb-3 resize-none transition-colors"
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
            disabled={createEvent.isPending}
            className="w-full bg-primary text-white py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            添加事件 📅
          </button>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2">
          {isLoading ? (
            <p className="text-gray-400 text-center py-12">加载中...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-400 text-center py-12">还没有事件记录哦~</p>
          ) : (
            <div className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary">
              {items.map((event) => (
                <div key={event.id} className="relative mb-8 animate-fade-in">
                  <div className="absolute -left-8 top-6 w-4 h-4 bg-primary rounded-full border-2 border-white shadow" />
                  <div className="bg-white rounded-card shadow p-5 group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{event.icon}</span>
                        <span className="text-sm font-semibold text-primary">
                          {new Date(event.eventDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteEvent.mutate(event.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-sm opacity-0 group-hover:opacity-100"
                      >
                        删除
                      </button>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-500">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
