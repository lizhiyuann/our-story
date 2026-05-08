// 页面头部组件：图标 + 标题 + 描述，统一各页面的头部样式
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  icon: string;          // 页面图标（emoji）
  title: string;         // 页面标题
  description?: string;  // 页面描述（可选）
  backTo?: string;       // 返回链接（可选，不填则不显示返回按钮）
  backLabel?: string;    // 返回按钮文字（默认"返回"）
  action?: React.ReactNode; // 右侧操作按钮（可选）
}

export function PageHeader({ icon, title, description, backTo, backLabel = '返回', action }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {/* 返回按钮 */}
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors mb-4"
        >
          ← {backLabel}
        </Link>
      )}

      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {description && (
              <p className="text-sm text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
