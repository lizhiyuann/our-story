// 空状态组件：当列表无数据时显示的占位提示

interface EmptyStateProps {
  icon: string;       // 图标（emoji）
  message: string;    // 提示文字
  action?: React.ReactNode; // 可选的操作按钮
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
