import { useEffect, useMemo, useState } from 'react';

const MAP_WIDTH = 11;
const MAP_HEIGHT = 8;
const START_POSITION = { x: 5, y: 6 };

const FURNITURE = new Set([
  '1,1', '2,1', '1,2', '2,2',
  '8,1', '9,1', '8,2', '9,2',
  '4,3', '5,3', '6,3',
  '1,5', '1,6',
]);

const INTERACTIONS = [
  { id: 'shop', x: 8, y: 2, icon: '🛎', label: '櫃台', hint: '和阿坤交談／進商店' },
  { id: 'guest', x: 5, y: 3, icon: '🚪', label: '客房', hint: '接待客人' },
  { id: 'bath', x: 1, y: 5, icon: '🛁', label: '浴室', hint: '清洗與休息' },
  { id: 'wardrobe', x: 9, y: 5, icon: '👗', label: '更衣室', hint: '整理服裝' },
  { id: 'street', x: 5, y: 0, icon: '⬆', label: '大門', hint: '前往東區街道' },
  { id: 'rest', x: 3, y: 6, icon: '🛏', label: '房間', hint: '休息一小時' },
  { id: 'save', x: 9, y: 6, icon: '💾', label: '存檔桌', hint: '存檔／讀檔' },
];

const DIRECTION_KEYS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
};

const cellKey = ({ x, y }) => `${x},${y}`;

const BrothelMap = ({ onInteract }) => {
  const [position, setPosition] = useState(START_POSITION);

  const nearbyInteraction = useMemo(() => INTERACTIONS.find(point => (
    Math.abs(point.x - position.x) + Math.abs(point.y - position.y) <= 1
  )), [position]);

  const move = direction => {
    if (!direction) return;
    setPosition(current => {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const outsideMap = next.x < 0 || next.x >= MAP_WIDTH || next.y < 0 || next.y >= MAP_HEIGHT;
      if (outsideMap || FURNITURE.has(cellKey(next))) return current;
      return next;
    });
  };

  const interact = () => {
    if (nearbyInteraction) onInteract(nearbyInteraction.id);
  };

  useEffect(() => {
    const handleKeyDown = event => {
      const direction = DIRECTION_KEYS[event.key];
      if (direction) {
        event.preventDefault();
        move(direction);
      }
      if ((event.key === 'e' || event.key === 'E' || event.key === 'Enter' || event.key === ' ') && nearbyInteraction) {
        event.preventDefault();
        interact();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearbyInteraction]);

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-300/20 bg-[#17131a] shadow-inner shadow-black/40" aria-label="娼館大廳地圖">
      <div className="flex items-center justify-between border-b border-amber-300/15 bg-[#211721] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-amber-300/75">自由移動・原型</p>
          <h3 className="text-sm font-bold text-amber-100">娼館大廳</h3>
        </div>
        <p className="text-right text-[11px] leading-relaxed text-slate-400">方向鍵／WASD 移動<br />E／Enter 互動</p>
      </div>

      <div className="p-3 sm:p-4">
        <div
          className="grid aspect-[11/8] w-full overflow-hidden rounded-xl border border-[#6a4c3c] bg-[#3b2928] p-1 shadow-inner shadow-black/50"
          style={{ gridTemplateColumns: `repeat(${MAP_WIDTH}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${MAP_HEIGHT}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, index) => {
            const x = index % MAP_WIDTH;
            const y = Math.floor(index / MAP_WIDTH);
            const key = `${x},${y}`;
            const point = INTERACTIONS.find(item => item.x === x && item.y === y);
            const isPlayer = position.x === x && position.y === y;
            const isFurniture = FURNITURE.has(key);
            const isDoor = point?.id === 'street' || point?.id === 'guest' || point?.id === 'wardrobe';
            return (
              <div
                key={key}
                className={`relative flex items-center justify-center border border-black/10 ${isFurniture ? 'bg-[#5a3b31]' : 'bg-[#725044]'} ${isDoor ? 'bg-[#2f2532]' : ''}`}
              >
                {isFurniture && <span className="text-[clamp(10px,2.2vw,20px)] opacity-80">{x < 3 ? '🛋' : '🪑'}</span>}
                {point && (
                  <span className={`relative z-10 text-[clamp(10px,2.2vw,21px)] ${nearbyInteraction?.id === point.id ? 'animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]' : ''}`} aria-label={point.label}>
                    {point.icon}
                  </span>
                )}
                {isPlayer && (
                  <span className="absolute z-20 flex h-[68%] w-[68%] items-center justify-center rounded-full border-2 border-rose-100 bg-rose-500 text-[clamp(11px,2.2vw,20px)] shadow-lg shadow-rose-950/80" aria-label="柯妤潔">
                    ♀
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 min-h-12 rounded-xl border border-amber-300/15 bg-black/20 px-3 py-2.5">
          {nearbyInteraction ? (
            <button type="button" onClick={interact} className="w-full text-left">
              <span className="font-bold text-amber-200">{nearbyInteraction.icon} {nearbyInteraction.label}</span>
              <span className="ml-2 text-xs text-slate-300">{nearbyInteraction.hint}・按 E 互動</span>
            </button>
          ) : <p className="text-xs text-slate-400">靠近門、櫃台或設施後即可互動。</p>}
        </div>

        <div className="mx-auto mt-3 grid w-44 grid-cols-3 gap-1.5 sm:hidden">
          <span />
          <button type="button" onClick={() => move(DIRECTION_KEYS.ArrowUp)} className="rounded bg-slate-800 py-2 text-sm text-slate-200">▲</button>
          <span />
          <button type="button" onClick={() => move(DIRECTION_KEYS.ArrowLeft)} className="rounded bg-slate-800 py-2 text-sm text-slate-200">◀</button>
          <button type="button" onClick={interact} disabled={!nearbyInteraction} className="rounded bg-amber-800 py-2 text-xs font-bold text-amber-100 disabled:opacity-40">E</button>
          <button type="button" onClick={() => move(DIRECTION_KEYS.ArrowRight)} className="rounded bg-slate-800 py-2 text-sm text-slate-200">▶</button>
          <span />
          <button type="button" onClick={() => move(DIRECTION_KEYS.ArrowDown)} className="rounded bg-slate-800 py-2 text-sm text-slate-200">▼</button>
        </div>
      </div>
    </section>
  );
};

export default BrothelMap;
