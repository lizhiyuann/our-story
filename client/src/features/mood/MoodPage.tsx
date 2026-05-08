// 心情页面：心情选择 + 文字输入 + 历史列表
import { useState } from 'react';
import { useMoods, useCreateMood, useDeleteMood } from '../../hooks/useMood';
import { useToast } from '../../components/Toast';
import { MOOD_EMOJIS, type MoodType } from '../../types';
import { formatRelativeTime } from '../../utils/date';

export function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [content, setContent] = useState('');
  const { data, isLoading } = useMoods();
  const createMood = useCreateMood();
  const deleteMood = useDeleteMood();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!selectedMood) return showToast('请选择一个心情！', 'error');
    if (!content.trim()) return showToast('写下你的心情！', 'error');

    createMood.mutate(
      { moodType: selectedMood, emoji: MOOD_EMOJIS[selectedMood], content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          setSelectedMood(null);
          showToast('心情已记录 ❤️');
        },
        onError: () => showToast('记录失败', 'error'),
      },
    );
  };

  const moods = data?.data ?? [];

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center text-primary mb-10">😊 心情记录</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input */}
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">今天心情如何？</h3>
          <div className="flex gap-2 flex-wrap mb-4">
            {(Object.entries(MOOD_EMOJIS) as [MoodType, string][]).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => setSelectedMood(type)}
                className={`text-3xl w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  selectedMood === type
                    ? 'bg-pink-100 ring-2 ring-primary scale-110'
                    : 'bg-love-bg hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的心情..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-love-border rounded-card focus:border-primary focus:outline-none resize-none transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={createMood.isPending}
            className="mt-3 bg-primary text-white px-6 py-2.5 rounded-card hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {createMood.isPending ? '记录中...' : '记录心情 ❤️'}
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">心情历史</h3>
          <div className="max-h-[500px] overflow-y-auto space-y-3">
            {isLoading ? (
              <p className="text-gray-400 text-center py-8">加载中...</p>
            ) : moods.length === 0 ? (
              <p className="text-gray-400 text-center py-8">还没有心情记录哦~</p>
            ) : (
              moods.map((mood) => (
                <div key={mood.id} className="bg-love-bg rounded-card p-4 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl">{mood.emoji}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{formatRelativeTime(mood.createdAt)}</span>
                      <button
                        onClick={() => deleteMood.mutate(mood.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">{mood.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
