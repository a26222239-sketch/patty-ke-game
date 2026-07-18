import { useState } from 'react';
import TypewriterText from './TypewriterText.jsx';

const FirstWeekEventModal = ({ event, shopManagerTrust = 0, portrait, onChoose }) => {
  const [detailComplete, setDetailComplete] = useState(false);
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={event.title}>
      <section className="w-full max-w-xl rounded-2xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="order-2 flex-1">
            <span className="text-xs font-bold tracking-wider text-amber-300">第一週事件</span>
            {event.id === 'week_settlement' && <span className="ml-2 rounded bg-rose-950 px-2 py-1 text-xs font-bold text-rose-200">房東結算</span>}
          </div>
          {portrait && (
            <figure className="relative order-1 isolate w-28 shrink-0 overflow-hidden rounded-xl border border-rose-300/25 bg-[radial-gradient(circle_at_50%_15%,#5a3048_0%,#211321_60%,#100d18_100%)] sm:w-36">
              <img src={portrait} alt="柯妤潔目前服裝立繪" className="h-36 w-full scale-110 object-contain object-bottom brightness-110 contrast-110 sm:h-44" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#100d18] to-transparent px-2 pb-2 pt-5 text-center text-[10px] font-bold text-rose-100">柯妤潔</figcaption>
            </figure>
          )}
        </div>
        <h2 className="text-xl font-bold text-amber-100">{event.title}</h2>
        <TypewriterText
          key={event.id}
          text={event.detail}
          speed={16}
          onComplete={() => setDetailComplete(true)}
          className="mt-3 text-sm leading-7 text-slate-200"
        />
        {!detailComplete && <p className="mt-2 text-xs text-slate-500">點擊文字可立即顯示全文</p>}
        <div className={`mt-5 space-y-2 transition-opacity ${detailComplete ? 'opacity-100' : 'pointer-events-none opacity-35'}`}>
          {event.choices.map(choice => {
            const unavailable = choice.requiresShopManagerTrust && shopManagerTrust < choice.requiresShopManagerTrust;
            return (
              <button
                key={choice.id}
                type="button"
                disabled={unavailable}
                onClick={() => onChoose(choice.id)}
                className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-left transition hover:border-amber-400 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className="block font-bold text-amber-100">{choice.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                  {unavailable ? `需要阿坤信任 ${choice.requiresShopManagerTrust}（目前 ${shopManagerTrust}）` : choice.hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FirstWeekEventModal;
