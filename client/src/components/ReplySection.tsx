// 回复组件：嵌入到各模块条目下方，支持多人多条回复
import { useState } from 'react';
import { useReplies, useCreateReply, useDeleteReply } from '../hooks/useReply';
import { useToast } from './Toast';

interface ReplySectionProps {
  targetType: 'mood' | 'rant' | 'countdown' | 'timeline' | 'photo';
  targetId: number;
}

export function ReplySection({ targetType, targetId }: ReplySectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const { data: replies, isLoading } = useReplies(targetType, targetId);
  const createReply = useCreateReply();
  const deleteReply = useDeleteReply(targetType, targetId);
  const { showToast } = useToast();

  const items = replies?.data ?? [];
  const count = items.length;

  const handleSubmit = () => {
    if (!content.trim()) return;
    createReply.mutate(
      { targetType, targetId, content: content.trim() },
      {
        onSuccess: () => { setContent(''); showToast('回复成功 💬'); },
        onError: () => showToast('回复失败', 'error'),
      },
    );
  };

  return (
    <div className="mt-3 border-t border-[var(--color-border)] pt-2">
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[var(--color-text-muted)] hover:text-primary transition-colors flex items-center gap-1"
      >
        💬 {count > 0 ? `回复 (${count})` : '回复'}
        {expanded ? ' ▲' : ' ▼'}
      </button>

      {/* 回复列表 */}
      {expanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {isLoading ? (
            <p className="text-xs text-[var(--color-text-muted)]">加载中...</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">还没有回复~</p>
          ) : (
            items.map((reply) => (
              <div key={reply.id} className="flex items-start gap-2 text-sm">
                <span className="text-xs font-medium text-primary shrink-0">
                  {reply.displayName ?? '匿名'}
                </span>
                <p className="text-[var(--color-text-light)] flex-1">{reply.content}</p>
                <button
                  onClick={() => { if (window.confirm('删除这条回复？')) deleteReply.mutate(reply.id); }}
                  className="text-[var(--color-text-muted)] hover:text-red-400 text-xs shrink-0"
                >
                  ✕
                </button>
              </div>
            ))
          )}

          {/* 回复输入框 */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="说点什么..."
              className="flex-1 px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-full focus:border-primary focus:outline-none transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={createReply.isPending || !content.trim()}
              className="px-3 py-1.5 text-xs bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
