// 虚拟宠物猫"金条" - 逼真金渐层数字猫咪
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

// ─── 逼真金渐层 SVG ────────────────────────────────
function CatSVG({ state, dir }: { state: CatState; dir: number }) {
  const sleeping = state === 'sleeping';
  const eating = state === 'eating';
  const walking = state === 'walking';
  const petting = state === 'petting';
  const cute = state === 'cute';

  // 眨眼动画
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (sleeping) return;
    const iv = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3000 + Math.random() * 2000);
    return () => clearInterval(iv);
  }, [sleeping]);

  const eyeOpen = !sleeping && !blink;

  return (
    <svg width="70" height="68" viewBox="0 0 70 68" fill="none"
      style={{ transform: `scaleX(${dir}) ${petting ? 'scale(1.12)' : ''}`, transition: 'transform 0.2s', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))' }}>
      <defs>
        {/* 毛发渐变 */}
        <radialGradient id="fur" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F5DCA0" />
          <stop offset="40%" stopColor="#E8C878" />
          <stop offset="75%" stopColor="#D4A55A" />
          <stop offset="100%" stopColor="#B8863C" />
        </radialGradient>
        {/* 头部渐变 */}
        <radialGradient id="headFur" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#F5DCA0" />
          <stop offset="35%" stopColor="#E8C878" />
          <stop offset="70%" stopColor="#D4A55A" />
          <stop offset="100%" stopColor="#B8863C" />
        </radialGradient>
        {/* 胸毛渐变 */}
        <radialGradient id="chestFur" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFF8EE" />
          <stop offset="100%" stopColor="#F5E6D0" />
        </radialGradient>
        {/* 鼻子渐变 */}
        <radialGradient id="noseGrad" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#E8909C" />
        </radialGradient>
        {/* 眼睛渐变 */}
        <radialGradient id="eyeGrad" cx="40%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#8B6B3A" />
          <stop offset="60%" stopColor="#6B4E2A" />
          <stop offset="100%" stopColor="#4A3520" />
        </radialGradient>
      </defs>

      {/* ── 尾巴 ── */}
      <path d={walking
        ? "M10 50 Q-4 38 4 26 Q10 18 16 24 Q20 28 18 34"
        : "M10 50 Q-2 42 2 34 Q6 26 10 30 Q14 34 12 38"}
        stroke="url(#fur)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* 尾巴毛发纹理 */}
      <path d={walking
        ? "M8 46 Q0 36 6 28"
        : "M8 46 Q2 38 6 32"}
        stroke="#C49540" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />

      {/* ── 后腿（远处那只）── */}
      <ellipse cx="22" cy="58" rx="6" ry="10" fill="#C49540" />
      <ellipse cx="22" cy="64" rx="5" ry="3.5" fill="#E8D5B8" />

      {/* ── 身体 ── */}
      <ellipse cx="34" cy="46" rx="22" ry="16" fill="url(#fur)" />
      {/* 身体毛发纹理 */}
      <path d="M18 40 Q26 36 34 38 Q42 36 50 40" stroke="#C49540" strokeWidth="0.8" fill="none" opacity="0.25" />
      <path d="M16 46 Q26 42 34 44 Q42 42 52 46" stroke="#C49540" strokeWidth="0.8" fill="none" opacity="0.2" />
      <path d="M18 52 Q26 48 34 50 Q42 48 50 52" stroke="#C49540" strokeWidth="0.8" fill="none" opacity="0.15" />
      {/* 胸毛 */}
      <ellipse cx="34" cy="42" rx="13" ry="10" fill="url(#chestFur)" opacity="0.75" />
      {/* 肚子高光 */}
      <ellipse cx="34" cy="44" rx="8" ry="6" fill="white" opacity="0.08" />

      {/* ── 前腿 ── */}
      <rect x="20" y="52" width="7" height="14" rx="3.5" fill="#D4A55A" />
      <rect x="41" y="52" width="7" height="14" rx="3.5" fill="#D4A55A" />
      {/* 前腿毛发 */}
      <path d="M22 54 L21 58" stroke="#C49540" strokeWidth="0.6" opacity="0.3" />
      <path d="M43 54 L42 58" stroke="#C49540" strokeWidth="0.6" opacity="0.3" />
      {/* 爪子 */}
      <ellipse cx="23.5" cy="65" rx="4.5" ry="3" fill="#F0E0C8" />
      <ellipse cx="44.5" cy="65" rx="4.5" ry="3" fill="#F0E0C8" />
      {/* 爪垫 */}
      <ellipse cx="22" cy="65.5" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="25" cy="65.5" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="43" cy="65.5" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="46" cy="65.5" rx="1.5" ry="1" fill="#FFB6C1" opacity="0.6" />

      {/* ── 头部 ── */}
      <ellipse cx="34" cy="24" rx="18" ry="16" fill="url(#headFur)" />
      {/* 脸部白毛 */}
      <ellipse cx="34" cy="28" rx="12" ry="10" fill="url(#chestFur)" opacity="0.55" />
      {/* 头顶毛发纹理 */}
      <path d="M22 16 Q28 12 34 14 Q40 12 46 16" stroke="#C49540" strokeWidth="0.7" fill="none" opacity="0.3" />
      <path d="M24 20 Q30 16 34 18 Q38 16 44 20" stroke="#C49540" strokeWidth="0.7" fill="none" opacity="0.2" />
      {/* 脸颊毛 */}
      <ellipse cx="22" cy="26" rx="5" ry="4" fill="#E8C878" opacity="0.4" />
      <ellipse cx="46" cy="26" rx="5" ry="4" fill="#E8C878" opacity="0.4" />

      {/* ── 耳朵 ── */}
      {/* 左耳 */}
      <path d="M18 14 L12 -2 L26 10 Z" fill="#D4A55A" />
      <path d="M18 10 L14 2 L24 10 Z" fill="#C49540" />
      <path d="M19 12 L16 5 L23 11 Z" fill="#FFB6C1" opacity="0.5" />
      {/* 右耳 */}
      <path d="M50 14 L56 -2 L42 10 Z" fill="#D4A55A" />
      <path d="M50 10 L54 2 L44 10 Z" fill="#C49540" />
      <path d="M49 12 L52 5 L45 11 Z" fill="#FFB6C1" opacity="0.5" />
      {/* 耳朵毛 */}
      <path d="M16 6 L14 0 L18 4" stroke="#E8C878" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M52 6 L54 0 L50 4" stroke="#E8C878" strokeWidth="1" fill="none" opacity="0.5" />

      {/* ── 额头条纹（金渐层特征）── */}
      <path d="M26 12 L28 6 L30 12" stroke="#B8863C" strokeWidth="1.5" fill="none" opacity="0.45" />
      <path d="M32 11 L34 5 L36 11" stroke="#B8863C" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M38 12 L40 6 L42 12" stroke="#B8863C" strokeWidth="1.5" fill="none" opacity="0.35" />

      {/* ── 眼睛 ── */}
      {eyeOpen ? (
        <>
          {/* 眼白 */}
          <ellipse cx="27" cy="22" rx="5.5" ry="5" fill="#F8F4E8" />
          <ellipse cx="41" cy="22" rx="5.5" ry="5" fill="#F8F4E8" />
          {/* 虹膜 */}
          <ellipse cx="27" cy="22" rx="4" ry="4.5" fill="url(#eyeGrad)" />
          <ellipse cx="41" cy="22" rx="4" ry="4.5" fill="url(#eyeGrad)" />
          {/* 瞳孔 */}
          <ellipse cx="27" cy="22" rx="2" ry="3.8" fill="#1A1208" />
          <ellipse cx="41" cy="22" rx="2" ry="3.8" fill="#1A1208" />
          {/* 高光 */}
          <circle cx="28.5" cy="20.5" r="1.3" fill="white" opacity="0.9" />
          <circle cx="42.5" cy="20.5" r="1.3" fill="white" opacity="0.9" />
          <circle cx="26" cy="23.5" r="0.6" fill="white" opacity="0.5" />
          <circle cx="40" cy="23.5" r="0.6" fill="white" opacity="0.5" />
          {/* 眼睛边框 */}
          <ellipse cx="27" cy="22" rx="5.5" ry="5" fill="none" stroke="#8B6B3A" strokeWidth="0.5" opacity="0.4" />
          <ellipse cx="41" cy="22" rx="5.5" ry="5" fill="none" stroke="#8B6B3A" strokeWidth="0.5" opacity="0.4" />
        </>
      ) : (
        <>
          {/* 闭眼 */}
          <path d="M22 22 Q27 25 32 22" stroke="#4A3520" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M36 22 Q41 25 46 22" stroke="#4A3520" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ── 鼻子 ── */}
      <path d="M31 27 L34 30 L37 27 Z" fill="url(#noseGrad)" />
      {/* 鼻子高光 */}
      <ellipse cx="33" cy="27.5" rx="1.2" ry="0.6" fill="white" opacity="0.4" />

      {/* ── 嘴巴 ── */}
      {eating ? (
        <ellipse cx="34" cy="32" rx="3.5" ry="2.8" fill="#5A3A2A" />
      ) : cute ? (
        <path d="M30 31 Q34 35 38 31" stroke="#8B6B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <path d="M34 30 L34 31.5" stroke="#8B6B5A" strokeWidth="0.8" />
          <path d="M31 32 Q34 34.5 37 32" stroke="#8B6B5A" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* ── 胡须 ── */}
      <line x1="18" y1="27" x2="4" y2="24" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      <line x1="18" y1="29" x2="4" y2="29" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      <line x1="18" y1="31" x2="4" y2="34" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      <line x1="50" y1="27" x2="64" y2="24" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      <line x1="50" y1="29" x2="64" y2="29" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      <line x1="50" y1="31" x2="64" y2="34" stroke="#C4A060" strokeWidth="0.7" opacity="0.45" />
      {/* 胡须根部圆点 */}
      <circle cx="18" cy="27" r="0.8" fill="#C4A060" opacity="0.3" />
      <circle cx="18" cy="29" r="0.8" fill="#C4A060" opacity="0.3" />
      <circle cx="18" cy="31" r="0.8" fill="#C4A060" opacity="0.3" />
      <circle cx="50" cy="27" r="0.8" fill="#C4A060" opacity="0.3" />
      <circle cx="50" cy="29" r="0.8" fill="#C4A060" opacity="0.3" />
      <circle cx="50" cy="31" r="0.8" fill="#C4A060" opacity="0.3" />

      {/* ── 状态装饰 ── */}
      {sleeping && (
        <g opacity="0.6">
          <text x="52" y="8" fontSize="8" fill="var(--color-text-muted)">Z</text>
          <text x="56" y="4" fontSize="6" fill="var(--color-text-muted)">z</text>
          <text x="59" y="1" fontSize="5" fill="var(--color-text-muted)">z</text>
        </g>
      )}
    </svg>
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

  // 移动
  useEffect(() => {
    if (catState !== 'walking') return;
    const isBurst = Math.random() < 0.15;
    burstRef.current = isBurst;
    if (isBurst) setTimeout(() => { burstRef.current = false; }, 2000 + Math.random() * 1000);
    moveTimerRef.current = setInterval(() => {
      setCatPos((prev) => {
        const speed = burstRef.current ? WALK_SPEED_BURST : WALK_SPEED_SLOW;
        let nx = prev.x + speed * dir;
        if (nx < 20 || nx > window.innerWidth - 70) { setDir((d) => -d); nx = prev.x; }
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

  // 猫拖动
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

  // 抚摸
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
          <div className="absolute whitespace-nowrap px-2.5 py-1.5 rounded-xl text-xs shadow-lg animate-fade-in"
            style={{ bottom: 74, left: '50%', transform: 'translateX(-50%)', background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)', maxWidth: 160 }}>
            {bubble}
          </div>
        )}
        <CatSVG state={catState} dir={dir} />
        {catState === 'eating' && <span className="absolute -top-1 right-0 text-xs">🐟</span>}
        {catState === 'drinking' && <span className="absolute -top-1 right-0 text-xs">💧</span>}
        {catState === 'cute' && <span className="absolute -top-1 right-0 text-xs">💕</span>}
      </div>
      {hearts.map((h) => (
        <span key={h.id} className="absolute pointer-events-none text-sm"
          style={{ left: h.x, top: h.y, animation: 'cat-heart 1.2s ease-out forwards' }}>❤️</span>
      ))}
      <style>{`@keyframes cat-heart { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-50px) scale(.4)} }`}</style>
    </div>
  );
}
