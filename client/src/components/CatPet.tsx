// 虚拟宠物猫"金条" - 金渐层猫咪（SVG 立体形象）
// 支持自主活动 + 鼠标互动 + 可拖动的猫窝/粮碗/水碗
import { useState, useEffect, useRef, useCallback } from 'react';

type CatState = 'idle' | 'walking' | 'sleeping' | 'eating' | 'drinking' | 'cute' | 'petting';
type FurnitureKey = 'bed' | 'food' | 'water';
interface Pos { x: number; y: number; }

const STATE_DURATIONS: Record<CatState, number> = {
  idle: 8000, walking: 10000, sleeping: 10000,
  eating: 5000, drinking: 3500, cute: 5000, petting: 0,
};
const WALK_SPEED_SLOW = 0.12;   // 慢悠悠（大部分时间）
const WALK_SPEED_BURST = 0.6;   // 偶尔冲刺
const MOVE_INTERVAL = 60;
const CUTE_MSGS = ['喵~ 摸摸我', '咕噜咕噜~', '蹭蹭你 ❤️', '要抱抱！', '想吃小鱼干~', '陪我玩嘛~'];
const PET_MSGS = ['咕噜咕噜~ 好舒服', '喵~ 再摸摸', '呼~ 开心！', '蹭蹭你的手 ❤️', '最喜欢你了！'];
const POS_KEY = 'our-story-cat-pos';

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function loadPos(k: string, fb: Pos): Pos { try { const s = localStorage.getItem(`${POS_KEY}-${k}`); return s ? JSON.parse(s) : fb; } catch { return fb; } }
function savePos(k: string, p: Pos) { try { localStorage.setItem(`${POS_KEY}-${k}`, JSON.stringify(p)); } catch { /* */ } }

// ─── 可拖动 Hook ──────────────────────────────────
function useDraggable(key: string, initial: Pos) {
  const [pos, setPos] = useState<Pos>(() => loadPos(key, initial));
  const dragRef = useRef<{ sx: number; sy: number; spx: number; spy: number; moved: boolean } | null>(null);
  const onDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragRef.current = { sx: e.clientX, sy: e.clientY, spx: pos.x, spy: pos.y, moved: false };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);
  const onMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx, dy = e.clientY - dragRef.current.sy;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    setPos({ x: dragRef.current.spx + dx, y: dragRef.current.spy + dy });
  }, []);
  const onUp = useCallback(() => { if (dragRef.current?.moved) savePos(key, pos); dragRef.current = null; }, [key, pos]);
  return { pos, setPos, onDown, onMove, onUp };
}

// ─── SVG 金渐层猫咪 ────────────────────────────────
function CatSVG({ state, dir }: { state: CatState; dir: number }) {
  const sleeping = state === 'sleeping';
  const eating = state === 'eating';
  const walking = state === 'walking';
  const petting = state === 'petting';

  // 眼睛状态
  const eyeH = sleeping ? 1 : 5;
  const eyeY = sleeping ? 14 : 12;

  return (
    <svg width="56" height="52" viewBox="0 0 56 52" fill="none"
      style={{ transform: `scaleX(${dir}) ${petting ? 'scale(1.15)' : ''}`, transition: 'transform 0.2s' }}>
      {/* 尾巴 */}
      <path d={walking
        ? "M8 38 Q-2 30 2 22 Q6 16 12 20"
        : "M8 38 Q-2 34 0 28 Q2 22 8 24"}
        stroke="#D4A55A" strokeWidth="4" strokeLinecap="round" fill="none"
        style={{ transition: 'd 0.3s' }} />
      {/* 身体 */}
      <ellipse cx="28" cy="38" rx="18" ry="12" fill="url(#bodyGrad)" />
      {/* 胸毛（白色） */}
      <ellipse cx="28" cy="36" rx="10" ry="8" fill="#FFF5E6" opacity="0.7" />
      {/* 前腿 */}
      <rect x="16" y="42" width="5" height="10" rx="2.5" fill="#D4A55A" />
      <rect x="35" y="42" width="5" height="10" rx="2.5" fill="#D4A55A" />
      {/* 爪子 */}
      <ellipse cx="18.5" cy="51" rx="3" ry="2" fill="#F5E6D0" />
      <ellipse cx="37.5" cy="51" rx="3" ry="2" fill="#F5E6D0" />
      {/* 头 */}
      <ellipse cx="28" cy="18" rx="16" ry="14" fill="url(#headGrad)" />
      {/* 脸部白毛 */}
      <ellipse cx="28" cy="22" rx="10" ry="8" fill="#FFF8EE" opacity="0.6" />
      {/* 左耳 */}
      <path d="M14 10 L10 -2 L20 8 Z" fill="#D4A55A" />
      <path d="M15 9 L12 1 L19 8 Z" fill="#FFB6C1" opacity="0.6" />
      {/* 右耳 */}
      <path d="M42 10 L46 -2 L36 8 Z" fill="#D4A55A" />
      <path d="M41 9 L44 1 L37 8 Z" fill="#FFB6C1" opacity="0.6" />
      {/* 额头条纹 */}
      <path d="M22 8 L24 4 L26 8" stroke="#C49540" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M28 7 L30 3 L32 7" stroke="#C49540" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* 眼睛 */}
      <ellipse cx="22" cy={eyeY} rx="3.5" ry={eyeH} fill="#4A3520" style={{ transition: 'ry 0.3s, cy 0.3s' }} />
      <ellipse cx="34" cy={eyeY} rx="3.5" ry={eyeH} fill="#4A3520" style={{ transition: 'ry 0.3s, cy 0.3s' }} />
      {!sleeping && <>
        {/* 瞳孔 */}
        <ellipse cx="22" cy="12" rx="2" ry="4" fill="#1A1A1A" />
        <ellipse cx="34" cy="12" rx="2" ry="4" fill="#1A1A1A" />
        {/* 高光 */}
        <circle cx="23.5" cy="10.5" r="1" fill="white" opacity="0.8" />
        <circle cx="35.5" cy="10.5" r="1" fill="white" opacity="0.8" />
      </>}
      {/* 鼻子 */}
      <path d="M26 18 L28 20 L30 18 Z" fill="#FFB6C1" />
      {/* 嘴巴 */}
      {eating
        ? <ellipse cx="28" cy="22" rx="3" ry="2.5" fill="#5A3A2A" />
        : <path d="M25 21 Q28 24 31 21" stroke="#8B6B5A" strokeWidth="1" fill="none" />
      }
      {/* 胡须 */}
      <line x1="10" y1="18" x2="2" y2="16" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      <line x1="10" y1="20" x2="2" y2="20" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      <line x1="10" y1="22" x2="2" y2="24" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="18" x2="54" y2="16" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="20" x2="54" y2="20" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="22" x2="54" y2="24" stroke="#C4A060" strokeWidth="0.8" opacity="0.5" />
      {/* 渐变定义 */}
      <defs>
        <radialGradient id="bodyGrad">
          <stop offset="0%" stopColor="#F5D5A0" />
          <stop offset="70%" stopColor="#D4A55A" />
          <stop offset="100%" stopColor="#C49540" />
        </radialGradient>
        <radialGradient id="headGrad">
          <stop offset="0%" stopColor="#F5D5A0" />
          <stop offset="60%" stopColor="#D4A55A" />
          <stop offset="100%" stopColor="#C49540" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── 家具 ─────────────────────────────────────────
function Furniture({ type, pos, onDown, onMove, onUp }: {
  type: FurnitureKey; pos: Pos;
  onDown: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp: (e: React.PointerEvent) => void;
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

  const showBubble = useCallback((msg: string, dur = 2500) => { setBubble(msg); setTimeout(() => setBubble(null), dur); }, []);
  const spawnHeart = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1200);
  }, []);

  const pickNext = useCallback(() => {
    if (isPetting || isDraggingCat.current) return;
    const r = Math.random();
    if (r < 0.15) { setCatPos(bed.pos); setCatState('sleeping'); showBubble('Zzz... 💤', 8000); stateTimerRef.current = setTimeout(pickNext, 10000); }
    else if (r < 0.25) { setCatPos(food.pos); setCatState('eating'); showBubble('好吃~ 😋', 4000); stateTimerRef.current = setTimeout(pickNext, 5000); }
    else if (r < 0.32) { setCatPos(water.pos); setCatState('drinking'); showBubble('咕嘟咕嘟~', 2500); stateTimerRef.current = setTimeout(pickNext, 3500); }
    else { const s = pick(['idle', 'idle', 'walking', 'walking', 'cute'] as CatState[]); setCatState(s); if (s === 'cute') showBubble(pick(CUTE_MSGS), 4000); stateTimerRef.current = setTimeout(pickNext, STATE_DURATIONS[s]); }
  }, [isPetting, showBubble, bed.pos, food.pos, water.pos]);

  // 移动（慢悠悠为主，偶尔冲刺）
  const burstRef = useRef(false);
  useEffect(() => {
    if (catState !== 'walking') return;
    // 偶尔冲刺（20% 概率，持续 2-3 秒）
    const isBurst = Math.random() < 0.2;
    burstRef.current = isBurst;
    if (isBurst) setTimeout(() => { burstRef.current = false; }, 2000 + Math.random() * 1000);

    moveTimerRef.current = setInterval(() => {
      setCatPos((prev) => {
        const speed = burstRef.current ? WALK_SPEED_BURST : WALK_SPEED_SLOW;
        let nx = prev.x + speed * dir;
        if (nx < 20 || nx > window.innerWidth - 60) { setDir((d) => -d); nx = prev.x; }
        if (Math.random() < 0.005) setDir((d) => -d);
        let ny = prev.y;
        if (Math.random() < 0.01) { ny = prev.y + (Math.random() - 0.5) * 15; ny = Math.max(window.innerHeight * 0.4, Math.min(window.innerHeight - 80, ny)); }
        savePos('cat', { x: nx, y: ny });
        return { x: nx, y: ny };
      });
    }, MOVE_INTERVAL);
    return () => { if (moveTimerRef.current) clearInterval(moveTimerRef.current); };
  }, [catState, dir]);

  useEffect(() => { pickNext(); return () => { if (stateTimerRef.current) clearTimeout(stateTimerRef.current); if (moveTimerRef.current) clearInterval(moveTimerRef.current); }; }, []);

  // 猫拖动
  const isDraggingCat = useRef(false);
  const catDragRef = useRef<{ sx: number; sy: number; spx: number; spy: number } | null>(null);

  const onCatPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    catDragRef.current = { sx: e.clientX, sy: e.clientY, spx: catPos.x, spy: catPos.y };
    isDraggingCat.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [catPos]);

  const onCatPointerMove = useCallback((e: React.PointerEvent) => {
    if (!catDragRef.current) return;
    const dx = e.clientX - catDragRef.current.sx;
    const dy = e.clientY - catDragRef.current.sy;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDraggingCat.current = true;
    if (isDraggingCat.current) {
      const newPos = { x: catDragRef.current.spx + dx, y: catDragRef.current.spy + dy };
      setCatPos(newPos);
      savePos('cat', newPos);
    }
  }, []);

  const onCatPointerUp = useCallback(() => {
    const wasDragging = isDraggingCat.current;
    catDragRef.current = null;
    isDraggingCat.current = false;
    if (wasDragging) {
      // 拖动结束，回到 idle
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      setCatState('idle');
      stateTimerRef.current = setTimeout(pickNext, 3000);
    }
  }, [pickNext]);

  // 抚摸（hover，非拖动时）
  const onCatEnter = useCallback(() => {
    if (isDraggingCat.current) return;
    if (catState === 'sleeping') { showBubble('嗯... 被摸醒了 😿', 1500); setCatState('idle'); if (stateTimerRef.current) clearTimeout(stateTimerRef.current); stateTimerRef.current = setTimeout(pickNext, 5000); return; }
    setIsPetting(true); setCatState('petting'); if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    showBubble(pick(PET_MSGS), 2000);
    spawnHeart(catPos.x + 24, catPos.y - 10);
    heartIvRef.current = setInterval(() => spawnHeart(catPos.x + 24 + (Math.random() - 0.5) * 20, catPos.y - 10 - Math.random() * 15), 600);
  }, [catState, catPos, showBubble, spawnHeart, pickNext]);

  const onCatLeave = useCallback(() => {
    if (isDraggingCat.current) return;
    setIsPetting(false);
    if (heartIvRef.current) clearInterval(heartIvRef.current);
    setTimeout(pickNext, 800);
  }, [pickNext]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      <div className="pointer-events-auto">
        <Furniture type="bed" pos={bed.pos} onDown={bed.onDown} onMove={bed.onMove} onUp={bed.onUp} />
        <Furniture type="food" pos={food.pos} onDown={food.onDown} onMove={food.onMove} onUp={food.onUp} />
        <Furniture type="water" pos={water.pos} onDown={water.onDown} onMove={water.onMove} onUp={water.onUp} />
      </div>

      <div className="absolute pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{ left: catPos.x, top: catPos.y, transition: catState === 'walking' ? 'none' : 'left 0.3s, top 0.3s', touchAction: 'none' }}
        onPointerDown={onCatPointerDown} onPointerMove={onCatPointerMove} onPointerUp={onCatPointerUp}
        onMouseEnter={onCatEnter} onMouseLeave={onCatLeave} title="金条（可拖动）">
        {bubble && (
          <div className="absolute whitespace-nowrap px-2.5 py-1 rounded-lg text-xs shadow animate-fade-in"
            style={{ bottom: 58, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            {bubble}
          </div>
        )}
        <CatSVG state={catState} dir={dir} />
        {catState === 'sleeping' && <span className="absolute -top-1 right-0 text-xs animate-bounce">💤</span>}
        {catState === 'eating' && <span className="absolute -top-1 right-0 text-xs">🐟</span>}
        {catState === 'drinking' && <span className="absolute -top-1 right-0 text-xs">💧</span>}
      </div>

      {hearts.map((h) => (
        <span key={h.id} className="absolute pointer-events-none text-sm"
          style={{ left: h.x, top: h.y, animation: 'cat-heart 1.2s ease-out forwards' }}>❤️</span>
      ))}
      <style>{`@keyframes cat-heart { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(.4)} }`}</style>
    </div>
  );
}
