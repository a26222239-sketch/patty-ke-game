import { useState } from 'react';
import TypewriterText from './TypewriterText.jsx';

const PROLOGUE_LINES = [
  '柯妤潔的丈夫在病中離世。為了醫藥費，她賣掉了能賣的東西；葬禮結束後，口袋裡只剩下 300G。',
  '現在，她暫住在房東名下的一間老公寓。那不是可以久待的家——房租與先前代墊的欠款，都在等她償還。',
  '門外的城市不會因誰的悲傷而停下。活下去、賺到錢、在第七天晚上前還清 1200G：這是柯妤潔眼前唯一的路。',
];

const OpeningPrologueModal = ({ portrait, onContinue }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [lineComplete, setLineComplete] = useState(false);
  const line = PROLOGUE_LINES[lineIndex];
  const isLastLine = lineIndex === PROLOGUE_LINES.length - 1;

  const next = () => {
    if (!lineComplete) return;
    if (isLastLine) {
      onContinue();
      return;
    }
    setLineIndex(current => current + 1);
    setLineComplete(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/90 p-3 sm:items-center" role="dialog" aria-modal="true" aria-label="遊戲開場">
      <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-300/35 bg-slate-900 shadow-2xl shadow-black/60">
        <div className="grid min-h-[360px] sm:grid-cols-[0.72fr_1.28fr]">
          <figure className="relative isolate min-h-[180px] overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#61354a_0%,#281728_58%,#100d18_100%)] sm:min-h-0">
            {portrait && <img src={portrait} alt="柯妤潔" className="absolute inset-x-0 bottom-0 z-10 h-full w-full scale-110 object-contain object-bottom brightness-110 contrast-110" />}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#100d18] to-transparent px-4 pb-4 pt-14">
              <p className="text-xs font-bold tracking-[0.2em] text-rose-100">柯妤潔</p>
              <p className="mt-1 text-[11px] text-rose-200/75">第一天・夜晚</p>
            </div>
          </figure>
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-[10px] font-bold tracking-[0.24em] text-amber-300/75">PROLOGUE・序章</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-rose-100">留下來的人</h2>
              <TypewriterText
                key={lineIndex}
                text={line}
                speed={22}
                onComplete={() => setLineComplete(true)}
                className="mt-6 min-h-[8.5rem] font-serif text-base leading-8 text-slate-100"
              />
              {!lineComplete && <p className="mt-3 text-xs text-slate-500">點擊文字可立即顯示全文</p>}
            </div>
            <button
              type="button"
              onClick={next}
              disabled={!lineComplete}
              className="mt-6 w-full rounded-xl border border-amber-400/35 bg-amber-950/40 px-4 py-3 text-left font-bold text-amber-100 transition hover:bg-amber-900/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastLine ? '面對房東的通知 →' : '繼續 →'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OpeningPrologueModal;
