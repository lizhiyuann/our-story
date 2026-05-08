// 虚拟宠物猫"金条" - 图片驱动 + CSS 动画
// 替换 public/pet/ 下的图片即可更换猫咪形象
import { useState, useEffect, useRef, useCallback } from 'react';

type CatState = 'idle' | 'walking' | 'sleeping' | 'eating' | 'drinking' | 'cute' | 'petting';
type FurnitureKey = 'bed' | 'food' | 'water';
interface Pos { x: number; y: number; }

const STATE_DURATIONS: Record<CatState, number> = {
  idle: 8000, walking: 10000, sleeping: 12000,
  eating: 5000, drinking: 3500, cute: 5000, petting: 0,
};
const WALK_SPEED_SLOW = 0.1;
const WALK_SPEED_BURST = 0.5;
const MOVE_INTERVAL = 60;
const CUTE_MSGS = ['喵~ 摸摸我', '咕噜咕噜~', '蹭蹭你 ❤️', '要抱抱！', '想吃小鱼干~', '陪我玩嘛~'];
const PET_MSGS = ['咕噜咕噜~ 好舒服', '喵~ 再摸摸', '呼~ 开心！', '蹭蹭你的手 ❤️', '最喜欢你了！'];
const POS_KEY = 'our-story-cat-pos';

// 猫咪图片路径（在 public/pet/ 目录下，替换为你的真实猫咪照片即可）
const CAT_IMAGES = {
  default: '/pet/cat-sit.svg',    // 坐姿（默认/idle）
  walking: '/pet/cat-walk.svg',   // 走路
  sleeping: '/pet/cat-sleep.svg', // 睡觉
  eating: '/pet/cat-eat.svg',     // 吃东西
  cute: '/pet/cat-cute.svg',      // 撒娇
};

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function loadPos(k: string, fb: Pos): Pos { try { const s = localStorage.getItem(`${POS_KEY}-${k}`); return s ? JSON.parse(s) : fb; } catch { return fb; } }
function savePos(k: string, p: Pos) { try { localStorage.setItem(`${POS_KEY}-${k}`, JSON.stringify(p)); } catch { /* */ } }

function useDraggable(key: string, initial: Pos) {
  const [pos, setPos] = useState<Pos>(() => loadPos(key, initial));
  const ref = useRef<{ sx: number; sy: number; spx: number; spy: number; moved: boolean } | null>(null);
  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    ref.current = { sx: e.clientX, sy: e.clientY, spx: pos.x, spy: pos.y, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);
  const onMove = useCallback((e: React.PointerEvent) => {
    if (!ref.current) return;
    const dx = e.clientX - ref.current.sx, dy = e.clientY - ref.current.sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) ref.current.moved = true;
    setPos({ x: ref.current.spx + dx, y: ref.current.spy + dy });
  }, []);
  const onUp = useCallback(() => { if (ref.current?.moved) savePos(key, pos); ref.current = null; }, [key, pos]);
  return { pos, setPos, onDown, onMove, onUp };
}

// ─── 猫咪图片组件 ─────────────────────────────────
function CatImage({ state, dir }: { state: CatState; dir: number }) {
  const [imgSrc, setImgSrc] = useState(CAT_IMAGES.default);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const src = state === 'sleeping' ? CAT_IMAGES.sleeping
      : state === 'walking' ? CAT_IMAGES.walking
      : state === 'eating' || state === 'drinking' ? CAT_IMAGES.eating
      : state === 'cute' || state === 'petting' ? CAT_IMAGES.cute
      : CAT_IMAGES.default;
    setImgSrc(src);
    setImgError(false);
  }, [state]);

  // 图片加载失败时显示 emoji 后备
  if (imgError) {
    const fallback = state === 'sleeping' ? '😺' : state === 'eating' ? '😸' : state === 'cute' || state === 'petting' ? '😻' : '🐱';
    return (
      <span className="text-5xl block" style={{ transform: `scaleX(${dir})` }}>
        {fallback}
      </span>
    );
  }

  return (
    <img
      src={imgSrc}
      alt="金条"
      onError={() => setImgError(true)}
      className="w-[72px] h-[72px] object-contain pointer-events-none select-none"
      style={{
        transform: `scaleX(${dir})`,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
      draggable={false}
    />
  );
}

// ─── 家具 ─────────────────────────────────────────
function Furniture({ type, pos, onDown, onMove, onUp }: {
  type: FurnitureKey; pos: Pos;
  onDown: (e: React.PointerEvent) => void; onMove: (e: React.PointerEvent) => void; onUp: (e: React.PointerEvent) => void;
}) {
  const items: Record<FurnitureKey, { emoji: string; label: string; size: number }> = {
    bed: { emoji: '🛏️', label: '猫窝', size: 36 },
    food: { emoji: '🍖', label: '粮碗', size: 24 },
    water: { emoji: '💧', label: '水碗', size: 24 },
  };
  const item = items[type];
  return (
    <div className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{ left: pos.x, top: pos.y, touchAction: 'none' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
      title={`${item.label}（可拖动）`}>
      <span style={{ fontSize: item.size }}>{item.emoji}</span>
      <span className="block text-[10px] text-center text-[var(--color-text-muted)] -mt-1">{item.label}</span>
    </div>
  );
}

// ─── 主组件 ────────────────────────────────────────
export function CatPet() {
  const [catState, setCatState] = useState<CatState>('idle');
  const [dir, setDir] = useState(1);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPetting, setIsPetting] = useState(false);
  const [catPos, setCatPos] = useState<Pos>(() => loadPos('cat', { x: 200, y: 400 }));
  const bed = useDraggable('bed', { x: 60, y: window.innerHeight - 120 });
  const food = useDraggable('food', { x: 150, y: window.innerHeight - 100 });
  const water = useDraggable('water', { x: 220, y: window.innerHeight - 100 });
  const stateTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const moveTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const heartIvRef = useRef<ReturnType<typeof setInterval>>(null);
  const isDraggingCat = useRef(false);
  const catDragRef = useRef<{ sx: number; sy: number; spx: number; spy: number } | null>(null);
  const burstRef = useRef(false);

  const showBubble = useCallback((msg: string, dur = 2500) => { setBubble(msg); setTimeout(() => setBubble(null), dur); }, []);
  const spawnHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1200);
  }, []);

  const pickNext = useCallback(() => {
    if (isPetting || isDraggingCat.current) return;
    const r = Math.random();
    if (r < 0.15) { setCatPos(bed.pos); setCatState('sleeping'); showBubble('Zzz... 💤', 10000); stateTimerRef.current = setTimeout(pickNext, 12000); }
    else if (r < 0.25) { setCatPos(food.pos); setCatState('eating'); showBubble('好吃~ 😋', 4000); stateTimerRef.current = setTimeout(pickNext, 5000); }
    else if (r < 0.32) { setCatPos(water.pos); setCatState('drinking'); showBubble('咕嘟咕嘟~', 2500); stateTimerRef.current = setTimeout(pickNext, 3500); }
    else { const s = pick(['idle', 'idle', 'walking', 'walking', 'cute'] as CatState[]); setCatState(s); if (s === 'cute') showBubble(pick(CUTE_MSGS), 4000); stateTimerRef.current = setTimeout(pickNext, STATE_DURATIONS[s]); }
  }, [isPetting, showBubble, bed.pos, food.pos, water.pos]);

  useEffect(() => {
    if (catState !== 'walking') return;
    const isBurst = Math.random() < 0.15;
    burstRef.current = isBurst;
    if (isBurst) setTimeout(() => { burstRef.current = false; }, 2000 + Math.random() * 1000);
    moveTimerRef.current = setInterval(() => {
      setCatPos((prev) => {
        const speed = burstRef.current ? WALK_SPEED_BURST : WALK_SPEED_SLOW;
        let nx = prev.x + speed * dir;
        if (nx < 20 || nx > window.innerWidth - 80) { setDir((d) => -d); nx = prev.x; }
        if (Math.random() < 0.005) setDir((d) => -d);
        let ny = prev.y;
        if (Math.random() < 0.01) { ny = prev.y + (Math.random() - 0.5) * 15; ny = Math.max(window.innerHeight * 0.4, Math.min(window.innerHeight - 90, ny)); }
        savePos('cat', { x: nx, y: ny });
        return { x: nx, y: ny };
      });
    }, MOVE_INTERVAL);
    return () => { if (moveTimerRef.current) clearInterval(moveTimerRef.current); };
  }, [catState, dir]);

  useEffect(() => { pickNext(); return () => { if (stateTimerRef.current) clearTimeout(stateTimerRef.current); if (moveTimerRef.current) clearInterval(moveTimerRef.current); }; }, []);

  const onCatPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    catDragRef.current = { sx: e.clientX, sy: e.clientY, spx: catPos.x, spy: catPos.y };
    isDraggingCat.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [catPos]);
  const onCatPointerMove = useCallback((e: React.PointerEvent) => {
    if (!catDragRef.current) return;
    const dx = e.clientX - catDragRef.current.sx, dy = e.clientY - catDragRef.current.sy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDraggingCat.current = true;
    if (isDraggingCat.current) {
      const newPos = { x: catDragRef.current.spx + dx, y: catDragRef.current.spy + dy };
      setCatPos(newPos); savePos('cat', newPos);
    }
  }, []);
  const onCatPointerUp = useCallback(() => {
    const wasDragging = isDraggingCat.current;
    catDragRef.current = null; isDraggingCat.current = false;
    if (wasDragging) { if (stateTimerRef.current) clearTimeout(stateTimerRef.current); setCatState('idle'); stateTimerRef.current = setTimeout(pickNext, 3000); }
  }, [pickNext]);

  const onCatEnter = useCallback(() => {
    if (isDraggingCat.current) return;
    if (catState === 'sleeping') { showBubble('嗯... 被摸醒了 😿', 1500); setCatState('idle'); if (stateTimerRef.current) clearTimeout(stateTimerRef.current); stateTimerRef.current = setTimeout(pickNext, 5000); return; }
    setIsPetting(true); setCatState('petting'); if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    showBubble(pick(PET_MSGS), 2000);
    spawnHeart(catPos.x + 30, catPos.y - 10);
    heartIvRef.current = setInterval(() => spawnHeart(catPos.x + 30 + (Math.random() - 0.5) * 20, catPos.y - 10 - Math.random() * 15), 600);
  }, [catState, catPos, showBubble, spawnHeart, pickNext]);
  const onCatLeave = useCallback(() => {
    if (isDraggingCat.current) return;
    setIsPetting(false); if (heartIvRef.current) clearInterval(heartIvRef.current);
    setTimeout(pickNext, 800);
  }, [pickNext]);

  // 猫咪动画样式
  const catAnimClass = catState === 'walking' ? 'animate-[cat-walk_0.8s_ease-in-out_infinite]'
    : catState === 'sleeping' ? 'animate-[cat-breathe_3s_ease-in-out_infinite]'
    : catState === 'petting' ? 'scale-110'
    : catState === 'cute' ? 'animate-[cat-cute_1s_ease-in-out_infinite]'
    : '';

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <div className="pointer-events-auto">
        <Furniture type="bed" pos={bed.pos} onDown={bed.onDown} onMove={bed.onMove} onUp={bed.onUp} />
        <Furniture type="food" pos={food.pos} onDown={food.onDown} onMove={food.onMove} onUp={food.onUp} />
        <Furniture type="water" pos={water.pos} onDown={water.onDown} onMove={water.onMove} onUp={water.onUp} />
      </div>

      <div
        className={`absolute pointer-events-auto cursor-grab active:cursor-grabbing transition-transform ${catAnimClass}`}
        style={{ left: catPos.x, top: catPos.y, transition: catState === 'walking' ? 'none' : 'left 0.3s, top 0.3s', touchAction: 'none' }}
        onPointerDown={onCatPointerDown} onPointerMove={onCatPointerMove} onPointerUp={onCatPointerUp}
        onMouseEnter={onCatEnter} onMouseLeave={onCatLeave} title="金条（可拖动）"
      >
        {bubble && (
          <div className="absolute whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs shadow-lg animate-fade-in"
            style={{ bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)', maxWidth: 160 }}>
            {bubble}
          </div>
        )}
        <CatImage state={catState} dir={dir} />
        {catState === 'eating' && <span className="absolute -top-1 right-0 text-xs">🐟</span>}
        {catState === 'drinking' && <span className="absolute -top-1 right-0 text-xs">💧</span>}
        {catState === 'cute' && <span className="absolute -top-1 right-0 text-xs">💕</span>}
      </div>

      {hearts.map((h) => (
        <span key={h.id} className="absolute pointer-events-none text-sm"
          style={{ left: h.x, top: h.y, animation: 'cat-heart 1.2s ease-out forwards' }}>❤️</span>
      ))}

      <style>{`
        @keyframes cat-heart {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(0.4); }
        }
        @keyframes cat-walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes cat-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.03); }
        }
        @keyframes cat-cute {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
