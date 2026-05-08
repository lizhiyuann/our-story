// 恋爱计时器：从 config/app.json 读取纪念日，实时显示在一起的天/时/分/秒
import { useEffect, useState } from 'react';
import { useConfig } from '../../hooks/useConfig';

// 默认纪念日（配置加载前使用）
const DEFAULT_START = '2024-01-01T00:00:00';

export function LoveCounter() {
  const { data: config } = useConfig();
  const startDate = config?.data?.love?.startDate ?? DEFAULT_START;

  const [time, setTime] = useState(() => calcDiff(startDate));

  useEffect(() => {
    const timer = setInterval(() => setTime(calcDiff(startDate)), 1000);
    return () => clearInterval(timer);
  }, [startDate]);

  const units = [
    { value: time.days, label: '天' },
    { value: time.hours, label: '小时' },
    { value: time.minutes, label: '分钟' },
    { value: time.seconds, label: '秒' },
  ];

  return (
    <div className="bg-white rounded-card shadow-lg p-6 inline-block">
      <p className="text-gray-500 mb-4">我们已经在一起</p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {units.map((u) => (
          <div key={u.label} className="text-center">
            <span className="block text-3xl font-bold text-primary bg-love-bg px-4 py-2 rounded-card min-w-[70px]">
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400 mt-1">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function calcDiff(startDate: string) {
  const diff = Date.now() - new Date(startDate).getTime();
  if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
