// 虚拟宠物猫"金条" - 金渐层猫咪
// 支持自主活动（走动/跑动/睡觉/吃饭/撒娇）和鼠标互动（抚摸）
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── 状态定义 ─────────────────────────────────────
type CatState = 'idle' | 'walking' | 'running' | 'sleeping' | 'eating' | 'drinking' | 'cute' | 'petting';

interface CatConfig {
  emoji: string;        // 当前表情
  label: string;        // 状态描述
  duration: number;     // 持续时间 ms
  speed: number;        // 移动速度 px/frame
}

const CAT_STATES: Record<CatState, CatConfig> = {
  idle:     { emoji: '🐱', label: '发呆', duration: 3000, speed: 0 },
  walking:  { emoji: '🐈', label: '散步', duration: 4000, speed: 1.5 },
  running:  { emoji: '💨', label: '跑酷', duration: 2000, speed: 4 },
  sleeping: { emoji: '😺', label: '睡觉', duration: 6000, speed: 0 },
  eating:   { emoji: '😸', label: '吃饭', duration: 3000, speed: 0 },
  drinking: { emoji: '😹', label: '喝水', duration: 2000, speed: 0 },
  cute:     { emoji: '🥰', label: '撒娇', duration: 3000, speed: 0 },
  petting:  { emoji: '😻', label: '舒服~', duration: 0, speed: 0 },
};

// 撒娇时的气泡消息
const CUTE_MESSAGES = [
  '喵~ 摸摸我',
  '咕噜咕噜~',
  '蹭蹭你 ❤️',
  '要抱抱！',
  '想吃小鱼干~',
  '陪我玩嘛~',
];

const PET_MESSAGES = [
  '咕噜咕噜~ 好舒服',
  '喵~ 再摸摸',
  '呼~ 开心！',
  '蹭蹭你的手 ❤️',
  '继续继续~',
  '最喜欢你了！',
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── 组件 ─────────────────────────────────────────
export function CatPet() {
  const [catState, setCatState] = useState<CatState>('idle');
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const [direction, setDirection] = useState(1); // 1=右, -1=左
  const [bubble, setBubble] = useState<string | null>(null);
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const pettingTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // 显示气泡
  const showBubble = useCallback((msg: string, duration = 2000) => {
    setBubble(msg);
    setTimeout(() => setBubble(null), duration);
  }, []);

  // 生成爱心粒子
  const spawnHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1000);
  }, []);

  // 切换到新状态
  const switchState = useCallback((newState: CatState) => {
    setCatState(newState);
    const config = CAT_STATES[newState];

    // 撒娇时显示气泡
    if (newState === 'cute') {
      showBubble(randomChoice(CUTE_MESSAGES), config.duration - 500);
    }

    // 睡觉时显示 zzz
    if (newState === 'sleeping') {
      showBubble('Zzz... 💤', config.duration);
    }

    // 吃饭喝水显示气泡
    if (newState === 'eating') {
      showBubble('好吃~ 😋', config.duration - 500);
    }
    if (newState === 'drinking') {
      showBubble('咕嘟咕嘟~', config.duration - 500);
    }

    // 状态结束后切换到下一个
    if (config.duration > 0) {
      stateTimerRef.current = setTimeout(() => {
        pickNextState();
      }, config.duration);
    }
  }, [showBubble]);

  // 随机选择下一个状态
  const pickNextState = useCallback(() => {
    if (isPetting) return; // 被摸时不切换

    const states: CatState[] = ['idle', 'walking', 'walking', 'running', 'sleeping', 'eating', 'drinking', 'cute', 'idle'];
    const next = randomChoice(states);
    switchState(next);
  }, [isPetting, switchState]);

  // 自主移动
  useEffect(() => {
    if (catState !== 'walking' && catState !== 'running') {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      return;
    }

    const config = CAT_STATES[catState];
    moveTimerRef.current = setInterval(() => {
      setPosition((prev) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        let newX = prev.x + config.speed * direction;

        // 边界反弹
        if (newX < 20 || newX > vw - 80) {
          setDirection((d) => -d);
          newX = prev.x + config.speed * (-direction);
        }

        // 随机改变方向
        if (Math.random() < 0.02) {
          setDirection((d) => -d);
        }

        // 走路时偶尔改变 Y
        let newY = prev.y;
        if (Math.random() < 0.05) {
          newY = prev.y + (Math.random() - 0.5) * 40;
          newY = Math.max(vh * 0.3, Math.min(vh - 100, newY));
        }

        return { x: newX, y: newY };
      });
    }, 30);

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, [catState, direction]);

  // 初始状态
  useEffect(() => {
    // 随机初始位置
    setPosition({
      x: 100 + Math.random() * (window.innerWidth - 200),
      y: window.innerHeight * 0.6 + Math.random() * 100,
    });
    switchState('idle');
    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, []);

  // 鼠标抚摸交互
  const handleMouseEnter = useCallback(() => {
    if (catState === 'sleeping') {
      // 摸醒它
      showBubble('嗯... 被摸醒了 😿', 1500);
      switchState('idle');
      return;
    }

    setIsPetting(true);
    setCatState('petting');
    showBubble(randomChoice(PET_MESSAGES), 1500);

    // 生成爱心
    spawnHeart(position.x + 20, position.y - 20);

    // 持续摸，持续生成爱心
    const heartInterval = setInterval(() => {
      spawnHeart(position.x + 20 + (Math.random() - 0.5) * 30, position.y - 20 - Math.random() * 20);
    }, 500);

    // 停止摸后恢复
    pettingTimerRef.current = setTimeout(() => {
      clearInterval(heartInterval);
    }, 100);

    // 存储 interval 以便清理
    (handleMouseEnter as any)._heartInterval = heartInterval;
  }, [catState, position, showBubble, spawnHeart, switchState]);

  const handleMouseLeave = useCallback(() => {
    setIsPetting(false);
    if ((handleMouseEnter as any)._heartInterval) {
      clearInterval((handleMouseEnter as any)._heartInterval);
    }
    // 摸完后切换到下一个状态
    setTimeout(() => pickNextState(), 500);
  }, [pickNextState]);

  const config = CAT_STATES[catState];

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-30">
      {/* 猫咪本体 */}
      <div
        className="absolute pointer-events-auto cursor-pointer select-none transition-transform"
        style={{
          left: position.x,
          top: position.y,
          transform: `scaleX(${direction})`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={`金条 - ${config.label}`}
      >
        {/* 气泡 */}
        {bubble && (
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs shadow animate-fade-in"
            style={{
              background: 'var(--color-card)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            {bubble}
          </div>
        )}

        {/* 猫咪表情 */}
        <span
          className={`text-4xl block transition-transform ${
            catState === 'walking' ? 'animate-bounce' :
            catState === 'running' ? 'animate-pulse' :
            catState === 'sleeping' ? 'opacity-70' :
            catState === 'petting' ? 'scale-125' :
            ''
          }`}
          style={{
            animationDuration: catState === 'walking' ? '0.6s' : catState === 'running' ? '0.3s' : undefined,
          }}
        >
          {config.emoji}
        </span>

        {/* 状态指示 */}
        {catState === 'sleeping' && (
          <span className="absolute -top-3 -right-2 text-xs animate-bounce">💤</span>
        )}
        {catState === 'eating' && (
          <span className="absolute -top-3 -right-2 text-xs">🐟</span>
        )}
        {catState === 'drinking' && (
          <span className="absolute -top-3 -right-2 text-xs">💧</span>
        )}
      </div>

      {/* 爱心粒子 */}
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute text-lg pointer-events-none animate-fade-in"
          style={{
            left: heart.x,
            top: heart.y,
            animation: 'float-up 1s ease-out forwards',
          }}
        >
          ❤️
        </span>
      ))}

      {/* 自定义动画 */}
      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
