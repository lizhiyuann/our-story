// 虚拟宠物猫"金条" - 金渐层猫咪
// CSS 绘制外观，自主活动 + 鼠标互动 + 可拖动的猫窝/粮碗/水碗
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── 类型 ─────────────────────────────────────────
type CatState = 'idle' | 'walking' | 'sleeping' | 'eating' | 'drinking' | 'cute' | 'petting';
type FurnitureKey = 'bed' | 'food' | 'water';

interface Pos { x: number; y: number; }

// ─── 常量 ─────────────────────────────────────────
const STATE_DURATIONS: Record<CatState, number> = {
  idle: 5000, walking: 6000, sleeping: 8000,
  eating: 4000, drinking: 3000, cute: 4000, petting: 0,
};

const WALK_SPEED = 0.4; // px/frame，大幅减速
const MOVE_INTERVAL = 50; // ms

const CUTE_MSGS = ['喵~ 摸摸我', '咕噜咕噜~', '蹭蹭你 ❤️', '要抱抱！', '想吃小鱼干~', '陪我玩嘛~'];
const PET_MSGS = ['咕噜咕噜~ 好舒服', '喵~ 再摸摸', '呼~ 开心！', '蹭蹭你的手 ❤️', '最喜欢你了！'];

const STORAGE_KEY = 'our-story-cat-pos';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function loadPos(key: string, fallback: Pos): Pos {
  try {
    const s = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return fallback;
}

function savePos(key: string, pos: Pos) {
  try { localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(pos)); } catch { /* ignore */ }
}

// ─── 可拖动 Hook ──────────────────────────────────
function useDraggable(key: string, initial: Pos) {
  const [pos, setPos] = useState<Pos>(() => loadPos(key, initial));
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; dragging: boolean } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startPosX: pos.x, startPosY: pos.y,
      dragging: false,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.dragging = true;
    const newPos = { x: dragRef.current.startPosX + dx, y: dragRef.current.startPosY + dy };
    setPos(newPos);
  }, []);

  const onPointerUp = useCallback(() => {
    if (dragRef.current?.dragging) savePos(key, pos);
    dragRef.current = null;
  }, [key, pos]);

  const isDragging = dragRef.current?.dragging ?? false;

  return { pos, setPos, onPointerDown, onPointerMove, onPointerUp, isDragging };
}

// ─── CSS 猫咪组件 ─────────────────────────────────
function CatSprite({ state, direction }: { state: CatState; direction: number }) {
  const isSleeping = state === 'sleeping';
  const isWalking = state === 'walking';
  const isPetting = state === 'petting';
  const isEating = state === 'eating';

  return (
    <div
      className="relative select-none"
      style={{
        width: 48, height: 48,
        transform: `scaleX(${direction}) ${isPetting ? 'scale(1.2)' : ''}`,
        transition: 'transform 0.2s',
      }}
    >
      {/* 身体 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 36, height: 28,
          bottom: 4, left: 6,
          background: 'linear-gradient(135deg, #f5d5a0, #e8b86d)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
      {/* 头 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 28, height: 24,
          top: 0, left: 10,
          background: 'linear-gradient(135deg, #f5d5a0, #e8b86d)',
        }}
      />
      {/* 左耳 */}
      <div
        style={{
          position: 'absolute', top: -4, left: 12,
          width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '10px solid #f5d5a0',
        }}
      />
      {/* 右耳 */}
      <div
        style={{
          position: 'absolute', top: -4, left: 26,
          width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '10px solid #f5d5a0',
        }}
      />
      {/* 眼睛 */}
      <div
        className="absolute"
        style={{
          width: 5, height: isSleeping ? 1 : 5,
          top: 10, left: 16,
          background: '#333', borderRadius: '50%',
          ...(isSleeping ? { borderRadius: '2px' } : {}),
        }}
      />
      <div
        className="absolute"
        style={{
          width: 5, height: isSleeping ? 1 : 5,
          top: 10, left: 28,
          background: '#333', borderRadius: '50%',
          ...(isSleeping ? { borderRadius: '2px' } : {}),
        }}
      />
      {/* 鼻子 */}
      <div
        className="absolute"
        style={{
          width: 4, height: 3, top: 16, left: 22,
          background: '#ffb6c1', borderRadius: '50%',
        }}
      />
      {/* 嘴巴 */}
      {isEating ? (
        <div className="absolute" style={{ width: 6, height: 4, top: 19, left: 20, background: '#333', borderRadius: '50%' }} />
      ) : (
        <div className="absolute" style={{ width: 8, height: 1, top: 19, left: 20, background: '#333', borderRadius: '0 0 4px 4px' }} />
      )}
      {/* 尾巴 */}
      <div
        className="absolute"
        style={{
          width: 20, height: 3,
          bottom: 8, left: direction > 0 ? -14 : 42,
          background: '#e8b86d',
          borderRadius: 2,
          transform: `rotate(${isWalking ? '20deg' : '-10deg'})`,
          transformOrigin: direction > 0 ? 'right center' : 'left center',
          transition: 'transform 0.3s',
        }}
      />
      {/* 腿 */}
      <div className="absolute" style={{ width: 4, height: 8, bottom: 0, left: 12, background: '#e8b86d', borderRadius: '0 0 2px 2px' }} />
      <div className="absolute" style={{ width: 4, height: 8, bottom: 0, left: 32, background: '#e8b86d', borderRadius: '0 0 2px 2px' }} />
      {/* 金渐层条纹 */}
      <div className="absolute" style={{ width: 16, height: 2, top: 4, left: 16, background: '#d4a259', borderRadius: 1, opacity: 0.6 }} />
      <div className="absolute" style={{ width: 12, height: 2, top: 8, left: 18, background: '#d4a259', borderRadius: 1, opacity: 0.4 }} />
    </div>
  );
}

// ─── 家具组件 ─────────────────────────────────────
function Furniture({ type, pos, onPointerDown, onPointerMove, onPointerUp }: {
  type: FurnitureKey; pos: Pos;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  const items: Record<FurnitureKey, { emoji: string; label: string; size: number }> = {
    bed:   { emoji: '🛏️', label: '猫窝', size: 40 },
    food:  { emoji: '🍖', label: '粮碗', size: 28 },
    water: { emoji: '💧', label: '水碗', size: 28 },
  };
  const item = items[type];

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title={`${item.label}（可拖动）`}
    >
      <span style={{ fontSize: item.size }}>{item.emoji}</span>
      <span className="block text-[10px] text-center text-[var(--color-text-muted)] -mt-1">{item.label}</span>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────
export function CatPet() {
  const [catState, setCatState] = useState<CatState>('idle');
  const [direction, setDirection] = useState(1);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPetting, setIsPetting] = useState(false);

  // 猫的位置（单独管理，不走 useDraggable 因为它会自主移动）
  const [catPos, setCatPos] = useState<Pos>(() => loadPos('cat', { x: 200, y: 400 }));

  // 家具位置
  const bed = useDraggable('bed', { x: 60, y: window.innerHeight - 120 });
  const food = useDraggable('food', { x: 140, y: window.innerHeight - 100 });
  const water = useDraggable('water', { x: 200, y: window.innerHeight - 100 });

  const stateTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval>>(null);

  // 气泡
  const showBubble = useCallback((msg: string, dur = 2500) => {
    setBubble(msg);
    setTimeout(() => setBubble(null), dur);
  }, []);

  // 爱心
  const spawnHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1200);
  }, []);

  // 切换状态
  const switchState = useCallback((s: CatState) => {
    setCatState(s);
    const dur = STATE_DURATIONS[s];
    if (s === 'cute') showBubble(pick(CUTE_MSGS), dur - 500);
    if (s === 'sleeping') showBubble('Zzz... 💤', dur);
    if (s === 'eating') showBubble('好吃~ 😋', dur - 500);
    if (s === 'drinking') showBubble('咕嘟咕嘟~', dur - 500);
    if (dur > 0) stateTimerRef.current = setTimeout(pickNext, dur);
  }, []);

  const pickNext = useCallback(() => {
    if (isPetting) return;
    // 有概率走向粮碗/水碗/猫窝
    const r = Math.random();
    if (r < 0.15) {
      // 走向猫窝睡觉
      setCatPos(bed.pos);
      switchState('sleeping');
    } else if (r < 0.25) {
      setCatPos(food.pos);
      switchState('eating');
    } else if (r < 0.32) {
      setCatPos(water.pos);
      switchState('drinking');
    } else {
      switchState(pick(['idle', 'walking', 'walking', 'cute', 'idle'] as CatState[]));
    }
  }, [isPetting, switchState, bed.pos, food.pos, water.pos]);

  // 自主移动
  useEffect(() => {
    if (catState !== 'walking') return;
    moveTimerRef.current = setInterval(() => {
      setCatPos((prev) => {
        const vw = window.innerWidth;
        let newX = prev.x + WALK_SPEED * direction;
        if (newX < 20 || newX > vw - 60) {
          setDirection((d) => -d);
          newX = prev.x;
        }
        if (Math.random() < 0.01) setDirection((d) => -d);
        let newY = prev.y;
        if (Math.random() < 0.02) {
          newY = prev.y + (Math.random() - 0.5) * 20;
          newY = Math.max(window.innerHeight * 0.4, Math.min(window.innerHeight - 80, newY));
        }
        savePos('cat', { x: newX, y: newY });
        return { x: newX, y: newY };
      });
    }, MOVE_INTERVAL);
    return () => { if (moveTimerRef.current) clearInterval(moveTimerRef.current); };
  }, [catState, direction]);

  // 初始化
  useEffect(() => {
    switchState('idle');
    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, []);

  // 抚摸
  const handleMouseEnter = useCallback(() => {
    if (catState === 'sleeping') {
      showBubble('嗯... 被摸醒了 😿', 1500);
      switchState('idle');
      return;
    }
    setIsPetting(true);
    setCatState('petting');
    showBubble(pick(PET_MSGS), 2000);
    spawnHeart(catPos.x + 20, catPos.y - 10);
    const iv = setInterval(() => spawnHeart(catPos.x + 20 + (Math.random() - 0.5) * 20, catPos.y - 10 - Math.random() * 15), 600);
    const leave = () => { clearInterval(iv); setIsPetting(false); setTimeout(pickNext, 800); window.removeEventListener('pointerup', leave); };
    window.addEventListener('pointerup', leave);
  }, [catState, catPos, showBubble, spawnHeart, switchState, pickNext]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 家具 */}
      <div className="pointer-events-auto">
        <Furniture type="bed" pos={bed.pos} onPointerDown={bed.onPointerDown} onPointerMove={bed.onPointerMove} onPointerUp={bed.onPointerUp} />
        <Furniture type="food" pos={food.pos} onPointerDown={food.onPointerDown} onPointerMove={food.onPointerMove} onPointerUp={food.onPointerUp} />
        <Furniture type="water" pos={water.pos} onPointerDown={water.onPointerDown} onPointerMove={water.onPointerMove} onPointerUp={water.onPointerUp} />
      </div>

      {/* 猫咪 */}
      <div
        className="absolute pointer-events-auto cursor-pointer"
        style={{ left: catPos.x, top: catPos.y, transition: catState === 'walking' ? 'none' : 'left 0.3s, top 0.3s' }}
        onMouseEnter={handleMouseEnter}
        title="金条"
      >
        {/* 气泡 */}
        {bubble && (
          <div
            className="absolute whitespace-nowrap px-2.5 py-1 rounded-lg text-xs shadow animate-fade-in"
            style={{
              bottom: 56, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--color-card)', color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            {bubble}
          </div>
        )}

        <CatSprite state={catState} direction={direction} />

        {/* 状态指示 */}
        {catState === 'sleeping' && <span className="absolute -top-2 right-0 text-xs animate-bounce">💤</span>}
        {catState === 'eating' && <span className="absolute -top-2 right-0 text-xs">🐟</span>}
        {catState === 'drinking' && <span className="absolute -top-2 right-0 text-xs">💧</span>}
      </div>

      {/* 爱心粒子 */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute pointer-events-none text-sm"
          style={{ left: h.x, top: h.y, animation: 'cat-heart-float 1.2s ease-out forwards' }}
        >
          ❤️
        </span>
      ))}

      <style>{`
        @keyframes cat-heart-float {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.4); }
        }
      `}</style>
    </div>
  );
}
