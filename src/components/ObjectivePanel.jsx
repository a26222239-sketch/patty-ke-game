const ObjectivePanel = ({ objective }) => {
  if (!objective) return null;

  const color = {
    tutorial: '#74d3ff',
    weekly_goal: '#f0c850',
    ready_to_resolve: '#74e0a0',
    resolved: '#b8a0e8',
  }[objective.kind] || '#c8b080';

  return (
    <section
      className="rounded-xl p-3 border"
      style={{ background: 'rgba(42, 31, 18, 0.78)', borderColor: `${color}66` }}
      aria-label="目前目標"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold" style={{ color }}>🧭 目前目標</span>
        {typeof objective.remainingDays === 'number' && (
          <span className="text-[11px] text-slate-400">剩 {objective.remainingDays} 天</span>
        )}
      </div>
      <div className="mt-1 text-sm font-bold text-amber-100">{objective.title}</div>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">{objective.detail}</p>
      {typeof objective.remainingGold === 'number' && objective.remainingGold > 0 && (
        <div className="mt-2 text-xs font-bold text-yellow-300">💰 還差 {objective.remainingGold}G</div>
      )}
    </section>
  );
};

export default ObjectivePanel;
