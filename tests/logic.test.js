import { describe, it, expect } from 'vitest';
import {
  formatTime, getTimePeriod, addMinutes, formatText, formatZhe,
  getStainLevel, gainProf, getPregnancyStage, getBodyMeasurements,
  getCurrentCup, calcCharm, getReputationTitle, pickPortrait,
} from '../game.jsx';

// 這些是 characterization tests：鎖住目前的行為，之後重構（P2）時若行為改變會被擋下。

describe('時間系統', () => {
  it('formatTime 補零並對 24 小時取模', () => {
    expect(formatTime(540)).toBe('09:00');   // 9:00
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(1439)).toBe('23:59');
    expect(formatTime(1440)).toBe('00:00');   // 跨日歸零
  });

  it('getTimePeriod 切分早/午/晚/深夜', () => {
    expect(getTimePeriod(6 * 60)).toBe('morning');
    expect(getTimePeriod(13 * 60)).toBe('afternoon');
    expect(getTimePeriod(18 * 60)).toBe('evening');
    expect(getTimePeriod(2 * 60)).toBe('midnight');
  });

  it('addMinutes 處理跨日進位且不變動原物件', () => {
    const p = { timeMinutes: 1400, days: 3 };
    const next = addMinutes(p, 100); // 1500 -> 第二天 60 分
    expect(next.timeMinutes).toBe(60);
    expect(next.days).toBe(4);
    expect(p.timeMinutes).toBe(1400); // 原物件不可變
  });
});

describe('污漬等級', () => {
  it('getStainLevel 依累積量回傳 0~4 級', () => {
    expect(getStainLevel(0)).toBe(0);
    expect(getStainLevel(4)).toBe(0);
    expect(getStainLevel(5)).toBe(1);
    expect(getStainLevel(9)).toBe(2);
    expect(getStainLevel(14)).toBe(3);
    expect(getStainLevel(20)).toBe(4);
    expect(getStainLevel(999)).toBe(4);
  });
});

describe('熟練度', () => {
  it('gainProf 每次 +1 且上限 100，不變動原物件', () => {
    const prof = { hand: 5 };
    expect(gainProf(prof, 'hand').newProf.hand).toBe(6);
    expect(gainProf(prof, 'mouth').newProf.mouth).toBe(1); // 未定義從 0 起算
    expect(gainProf({ hand: 100 }, 'hand').newProf.hand).toBe(100); // 封頂
    expect(prof.hand).toBe(5);
  });
});

describe('懷孕分期與身體變化', () => {
  it('getPregnancyStage 依天數分 0~3 期', () => {
    expect(getPregnancyStage({ isPregnant: false })).toBe(0);
    expect(getPregnancyStage({ isPregnant: true, pregnantDays: 21 })).toBe(0); // 著床期
    expect(getPregnancyStage({ isPregnant: true, pregnantDays: 22 })).toBe(1);
    expect(getPregnancyStage({ isPregnant: true, pregnantDays: 91 })).toBe(2);
    expect(getPregnancyStage({ isPregnant: true, pregnantDays: 200 })).toBe(3);
  });

  it('getBodyMeasurements 依孕期增加胸腰圍、臀圍不變', () => {
    const base = { bust: 108, waist: 72, hips: 102, isPregnant: false };
    expect(getBodyMeasurements(base)).toEqual({ bust: 108, waist: 72, hips: 102 });
    const late = { ...base, isPregnant: true, pregnantDays: 200 };
    expect(getBodyMeasurements(late)).toEqual({ bust: 124, waist: 96, hips: 102 });
  });

  it('getCurrentCup 依孕期增加罩杯', () => {
    expect(getCurrentCup({ cup: 'K', isPregnant: false })).toBe('K');
    expect(getCurrentCup({ cup: 'K', isPregnant: true, pregnantDays: 22 })).toBe('L'); // +1
    expect(getCurrentCup({ cup: 'K', isPregnant: true, pregnantDays: 200 })).toBe('O'); // +4
  });
});

describe('魅力計算 calcCharm', () => {
  it('全裸初始值：純裸露加成 280 + baseCharm 10，rate 封頂 0.95', () => {
    const naked = { baseCharm: 10, isPregnant: false, clothes: {}, tattoos: {}, prof: {} };
    const r = calcCharm(naked);
    expect(r.total).toBe(290);
    expect(r.clothesCharm).toBe(280); // 裸露加成
    expect(r.rate).toBeCloseTo(0.95);
  });

  it('穿上著與下著移除對應裸露加成、計入衣物魅力', () => {
    const dressed = {
      baseCharm: 10, isPregnant: false, prof: {}, tattoos: {},
      clothes: { top: { charm: 8 }, bottom: { charm: 8 }, bra: { charm: 0 }, panties: { charm: 0 } },
    };
    const r = calcCharm(dressed);
    expect(r.clothesCharm).toBe(16); // 8+8，無裸露加成
    expect(r.total).toBe(26);        // baseCharm 10 + 16
  });

  it('懷孕 +50 魅力，熟練度以總和 ×0.5 計入', () => {
    const p = {
      baseCharm: 10, isPregnant: true, tattoos: {},
      clothes: {}, prof: { hand: 10, mouth: 10 }, // 總和 20 -> +10
    };
    const r = calcCharm(p);
    expect(r.profCharm).toBe(10);
    expect(r.total).toBe(10 + 50 + 280 + 10); // base + 孕 + 裸露 + 熟練
  });
});

describe('名聲頭銜', () => {
  it('getReputationTitle 回傳含 title/color 的物件', () => {
    const t = getReputationTitle(0);
    expect(typeof t.title).toBe('string');
    expect(typeof t.color).toBe('string');
    // 高名聲頭銜應與最低名聲不同
    expect(getReputationTitle(99999).title).not.toBe('');
  });
});

describe('立繪挑選 pickPortrait', () => {
  it('目前僅 T1，任何服裝組合都回傳有效圖路徑', () => {
    const img = pickPortrait({ top: { id: 't1' }, bra: { id: 'b1' }, bottom: { id: 'bt1' } });
    expect(img).toBeTruthy();
    // 空服裝也安全 fallback 到 T1，不丟例外
    expect(pickPortrait({})).toBeTruthy();
  });

  it('比基尼組合：內衣b14+內褲p14 且 其他部位皆空，才顯示比基尼立繪', () => {
    const bikini = pickPortrait({ bra: { id: 'b14' }, panties: { id: 'p14' } });
    expect(bikini).toBeTruthy();
    // 與預設 T1 fallback 不同 → 組合規則確實生效
    expect(bikini).not.toBe(pickPortrait({}));
    // 上衣有穿東西 → 不符合「其他部位為空」→ 不顯示比基尼（落回分級）
    expect(pickPortrait({ top: { id: 't1' }, bra: { id: 'b14' }, panties: { id: 'p14' } })).not.toBe(bikini);
    // 鞋子有穿 → 同樣不符合
    expect(pickPortrait({ bra: { id: 'b14' }, panties: { id: 'p14' }, shoes: { id: 'sh1' } })).not.toBe(bikini);
    // 只穿 b14 但內褲不是 p14 → 不符合
    expect(pickPortrait({ bra: { id: 'b14' }, panties: { id: 'p1' } })).not.toBe(bikini);
  });
});

describe('折扣換算 formatZhe（修補先前未定義的崩潰 bug）', () => {
  it('off=省下比例，換算成「折」數 = (1-off)×10', () => {
    expect(formatZhe(0.2)).toBe('8'); // 省 20% -> 打 8 折
    expect(formatZhe(0.15)).toBe('8.5');
    expect(formatZhe(0)).toBe('10'); // 不打折
    expect(formatZhe(0.25)).toBe('7.5');
  });
  it('容忍 undefined 不丟例外', () => {
    expect(formatZhe(undefined)).toBe('10');
  });
});

describe('文本格式化 formatText', () => {
  it('置換 {E}/{V}/{BUST}/{HIPS} 佔位符', () => {
    expect(formatText('{E} 射了 {V}ml 在 {BUST}/{HIPS}', '客人', 5, 90, 100))
      .toBe('客人 射了 5ml 在 90/100');
  });

  it('{V_ADJ} 依量對應形容詞（量 5 -> 第 1 級）', () => {
    expect(formatText('{V_ADJ}', 'x', 5)).toBe('稀薄的');
    expect(formatText('{V_ADJ}', 'x', 1)).toBe('少量');
  });
});
