const FirstWeekEventModal = ({ event, shopManagerTrust = 0, portrait, onChoose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label={event.title}>
      <section className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-wider text-amber-300">第一週事件</span>
            {event.id === 'week_settlement' && <span className="ml-2 rounded bg-rose-950 px-2 py-1 text-xs font-bold text-rose-200">房東結算</span>}
          </div>
          {portrait && (
            <figure className="w-16 shrink-0 overflow-hidden rounded-lg border border-rose-300/25 bg-[#160d1b]">
              <img src={portrait} alt="柯妤潔目前服裝立繪" className="h-20 w-full object-contain object-top" />
              <figcaption className="border-t border-rose-300/15 py-1 text-center text-[9px] font-bold text-rose-200">柯妤潔</figcaption>
            </figure>
          )}
        </div>
        <h2 className="text-xl font-bold text-amber-100">{event.title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-200">{event.detail}</p>
        <div className="mt-5 space-y-2">
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
