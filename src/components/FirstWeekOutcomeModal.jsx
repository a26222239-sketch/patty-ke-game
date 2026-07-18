const FirstWeekOutcomeModal = ({ outcome, onClose }) => {
  if (!outcome) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/85 p-3" role="dialog" aria-modal="true" aria-label="第一週結果">
      <section className="w-full max-w-md rounded-2xl border border-violet-400/40 bg-slate-900 p-6 shadow-2xl">
        <span className="text-xs font-bold tracking-wider text-violet-300">第一週結算</span>
        <h2 className="mt-2 text-2xl font-bold text-amber-100">{outcome.title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-200">{outcome.detail}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-violet-700 px-4 py-3 font-bold text-white transition hover:bg-violet-600"
        >
          繼續生活
        </button>
      </section>
    </div>
  );
};

export default FirstWeekOutcomeModal;
