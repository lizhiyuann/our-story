import { useEffect, useState } from 'react';

// 修改为你们在一起的日期
const START_DATE = new Date('2024-01-01T00:00:00');

function calcDiff() {
  const diff = Date.now() - START_DATE.getTime();
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function LoveCounter() {
  const [time, setTime] = useState(calcDiff);

  useEffect(() => {
    const timer = setInterval(() => setTime(calcDiff()), 1000);
    return () => clearInterval(timer);
  }, []);

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
