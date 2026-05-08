// 吐槽页面：类型选择 + 强度滑块 + 发泄记录
import { useState } from 'react';
import { useRants, useCreateRant, useDeleteRant } from '../../hooks/useRant';
import { useToast } from '../../components/Toast';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { RANT_TYPE_NAMES } from '../../types';
import { formatRelativeTime } from '../../utils/date';

const RANT_TYPES = [
  { key: 'rant', label: '😤 吐槽' },
  { key: 'scold', label: '🤬 骂人' },
  { key: 'complain', label: '😒 抱怨' },
] as const;

export function RantPage() {
  const [rantType, setRantType] = useState('rant');
  const [content, setContent] = useState('');
  const [intensity, setIntensity] = useState(5);
  const { data, isLoading, isError } = useRants();
  const createRant = useCreateRant();
  const deleteRant = useDeleteRant();
  const { showToast } = useToast();

  const handleSubmit = () => {
    if (!content.trim()) return showToast('写点什么再发泄吧！', 'error');
    createRant.mutate({ rantType, content: content.trim(), intensity }, {
      onSuccess: () => { setContent(''); setIntensity(5); showToast('发泄完毕，心情好多了吧？😤'); },
      onError: () => showToast('发泄失败', 'error'),
    });
  };

  const rants = data?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <PageHeader icon="😤" title="吐槽专区" description="不开心就来这里发泄" backTo="/" backLabel="回到首页" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-red-500 mb-4">有什么不开心的？说出来！</h3>
          <div className="flex gap-2 mb-4">
            {RANT_TYPES.map((t) => (
              <button key={t.key} onClick={() => setRantType(t.key)}
                className={`flex-1 py-2 rounded-card border-2 text-sm transition-colors ${
                  rantType === t.key ? 'border-red-400 bg-red-50 text-red-500' : 'border-love-border hover:border-red-200'
                }`}>{t.label}</button>
            ))}
          </div>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="尽情发泄吧..." rows={4}
            className="w-full px-4 py-3 border-2 border-love-border rounded-card focus:border-red-400 focus:outline-none resize-none transition-colors" />
          <div className="flex items-center gap-3 my-3">
            <label className="text-sm text-gray-600 whitespace-nowrap">生气程度：</label>
            <input type="range" min={1} max={10} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="flex-1 accent-red-500" />
            <span className="text-red-500 font-bold w-6 text-center">{intensity}</span>
          </div>
          <button onClick={handleSubmit} disabled={createRant.isPending}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2.5 rounded-card hover:shadow-md transition-all disabled:opacity-50">
            {createRant.isPending ? '发泄中...' : '发泄！🔥'}
          </button>
        </div>
        <div className="bg-white rounded-card shadow p-6">
          <h3 className="text-lg font-semibold text-red-500 mb-4">发泄记录</h3>
          <div className="max-h-[500px] overflow-y-auto space-y-3">
            {isLoading ? <LoadingState /> : isError ? <EmptyState icon="⚠️" message="加载失败，请刷新重试" /> : rants.length === 0 ? <EmptyState icon="😤" message="还没有吐槽记录哦~" /> : rants.map((rant) => (
              <div key={rant.id} className="bg-red-50 rounded-card p-4 border-l-4 border-red-500 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{RANT_TYPE_NAMES[rant.rantType] ?? rant.rantType}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatRelativeTime(rant.createdAt)}</span>
                    <button onClick={() => { if (window.confirm('确定删除这条吐槽吗？')) deleteRant.mutate(rant.id); }}
                      className="text-gray-300 hover:text-red-500 transition-colors text-sm">删除</button>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{rant.content}</p>
                <div className="h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded" style={{ width: `${rant.intensity * 10}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
