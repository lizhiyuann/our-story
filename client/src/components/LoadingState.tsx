// 加载状态组件：数据加载中的占位提示

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <div className="animate-spin text-2xl mr-3">⏳</div>
      <span className="text-sm">加载中...</span>
    </div>
  );
}
