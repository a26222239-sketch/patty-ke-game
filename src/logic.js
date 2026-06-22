// 純邏輯函數 — 工具/污漬/角色屬性/戰鬥（從 game.jsx SECTION 8-12 抽出）
import { TATTOO_SIZES } from './constants.js';
import { CUPS, REPUTATION_TITLES } from './data.js';
import { SCENE_TEXTS, HAIR_PREF_HIT_TEXTS, STAIN_TEXTS } from '../texts.js';

// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 8: 通用工具 — 無業務邏輯的純函數                            ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 8.1 隨機 / 變異
// ─────────────────────────────────────────────────────────────────────
export const pick = arr => arr[Math.floor(Math.random()*arr.length)];
export const vary = (base, spread=0.3) => Math.round(base*(1+spread*(Math.random()*2-1)));

// ─────────────────────────────────────────────────────────────────────
// 8.2 時間系統 — formatTime / getTimePeriod / addMinutes
// ─────────────────────────────────────────────────────────────────────
export const formatTime = minutes => {
  const h = Math.floor(minutes/60)%24;
  const m = minutes%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};
export const getTimePeriod = minutes => {
  const h = Math.floor(minutes/60)%24;
  if (h>=5  && h<12) return 'morning';
  if (h>=12 && h<17) return 'afternoon';
  if (h>=17 && h<21) return 'evening';
  return 'midnight';
};
export const addMinutes = (player, mins) => {
  const total = player.timeMinutes + mins;
  const days  = player.days + Math.floor(total/1440);
  return {...player, timeMinutes: total%1440, days};
};

// ─────────────────────────────────────────────────────────────────────
// 8.3 文本格式化 — formatText（含 placeholder 替換）
//      注意：本函數呼叫 getStainLevel（污漬系統，位於 SECTION 10）
//      由於 formatText 是 arrow function，呼叫時才解析 getStainLevel，
//      故宣告順序不重要（兩者都是頂層 const）。
// ─────────────────────────────────────────────────────────────────────
export const formatText = (tpl, eName, vol, bust, hips) => {
  const lv = getStainLevel(vol);
  const adjs = ['少量','稀薄的','濃稠的','大量','滿溢的'];
  const actT = ['噴出','射出','溢出','湧出','傾瀉而出'];
  const actI = ['射到','噴到','灑到','濺到','覆蓋了'];
  const vIn  = ['射入','注入','灌入','衝進','充盈'];
  return tpl
    .replace(/{E}/g, eName)
    .replace(/{V}/g, String(vol))
    .replace(/{V_ADJ}/g, adjs[lv]||adjs[0])
    .replace(/{V_ACT_T}/g, actT[lv]||actT[0])
    .replace(/{V_ACT_I}/g, actI[lv]||actI[0])
    .replace(/{V_IN}/g, vIn[lv]||vIn[0])
    .replace(/{BUST}/g, bust||'')
    .replace(/{HIPS}/g, hips||'');
};

// 折扣顯示：off 為「省下的比例」(0.2 = 省 20%)，換算成台式「折」數 = (1-off)×10
// 例：off 0.2 → 8 折；off 0.15 → 8.5 折；整數不帶小數點。
export const formatZhe = off => {
  const z = (1 - (off || 0)) * 10;
  return Number.isInteger(z) ? String(z) : z.toFixed(1);
};

// ─────────────────────────────────────────────────────────────────────
// 8.4 存檔工具 — SAVE_SLOTS / readSaveMeta
// ─────────────────────────────────────────────────────────────────────
export const SAVE_SLOTS = ['slot1','slot2','slot3'];
export const SAVE_KEY = slot => `brothelSave_${slot}`;
// 一次性遷移：把舊版 towerSave_ 鍵搬到新鍵 brothelSave_ 並刪除舊鍵（清除 tower 殘留、不丟失既有存檔）
try {
  SAVE_SLOTS.forEach(slot => {
    const legacy = localStorage.getItem(`towerSave_${slot}`);
    if (legacy === null) return;
    if (localStorage.getItem(SAVE_KEY(slot)) === null) localStorage.setItem(SAVE_KEY(slot), legacy);
    localStorage.removeItem(`towerSave_${slot}`);
  });
} catch {}
export const readSaveMeta = slot => {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY(slot))||'null');
    if (!d) return null;
    const p = d.player || {};
    return {
      name: p.name,
      day: p.days,
      time: p.timeMinutes,
      hp: p.hp,
      baseHp: p.baseHp,
      gold: p.gold,
      fame: p.fame,
      isPregnant: p.isPregnant,
      pregnantDays: p.pregnantDays,
    };
  } catch { return null; }
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 9: 文本選擇器（預留空殼）                                   ║
// ╚════════════════════════════════════════════════════════════════════╝
// 預留空殼 — 後續階段才會放入文本選擇器：
//   - pickSceneText(scene, conditions) — 根據條件選擇場景文本
//   - evaluateConditions(player, enemy) — 計算當前文本的條件變體
//   - getCombinations(scene, key) — 取得文本組合
// 註：所有文本常數（SCENE_TEXTS / HAIR_PREF_HIT_TEXTS 等）已抽出至 texts.js（2026-06-07 拆檔）


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 10: 污漬系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 10.1 污漬等級資料 — STAIN_LEVELS
// ─────────────────────────────────────────────────────────────────────
export const STAIN_LEVELS = [
  { min:1,  max:4   },
  { min:5,  max:8   },
  { min:9,  max:13  },
  { min:14, max:19  },
  { min:20, max:Infinity },
];

// ─────────────────────────────────────────────────────────────────────
// 10.2 污漬文本 — STAIN_TEXTS / BATH_WASH_TEXTS
// ─────────────────────────────────────────────────────────────────────
// STAIN_TEXTS 已移至 texts.js（import 於檔案頂端）

// BATH_WASH_TEXTS 已移至 texts.js（import 於檔案頂端）

// ─────────────────────────────────────────────────────────────────────
// 10.3 污漬工具函數 — getStainLevel / addStainLog
// ─────────────────────────────────────────────────────────────────────
export const getStainLevel = ml => {
  for (let i = STAIN_LEVELS.length-1; i >= 0; i--) {
    if (ml >= STAIN_LEVELS[i].min) return i;
  }
  return 0;
};

export const addStainLog = (part, vol, addLog, stains) => {
  // 用累積量計算等級，而非當次射出量
  const accumulated = ((stains||{})[part]||0) + vol;
  const lv = getStainLevel(accumulated);
  const texts = STAIN_TEXTS[part];
  if (texts) addLog(`💦 ${texts[lv]}`,'story');
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 11: 角色屬性系統                                            ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 11.1 熟練度 — gainProf
// ─────────────────────────────────────────────────────────────────────
export const gainProf = (prof, key) => {
  const newProf = {...prof, [key]:Math.min(100,(prof[key]||0)+1)};
  return {newProf};
};

// ─────────────────────────────────────────────────────────────────────
// 11.2 懷孕分期 — getPregnancyStage
// ─────────────────────────────────────────────────────────────────────
export const getPregnancyStage = (p) => {
  if (!p.isPregnant) return 0;
  const d = p.pregnantDays||0;
  if (d <= 21)  return 0;   // 著床期：雖懷孕但無徵兆（無外觀變化、無作嘔）
  if (d <= 90)  return 1;   // 早期：開始作嘔、輕微胸部變化
  if (d <= 180) return 2;   // 中期
  return 3;                 // 晚期
};

// ─────────────────────────────────────────────────────────────────────
// 11.3 三圍與罩杯 — getBodyMeasurements / getCurrentCup
// ─────────────────────────────────────────────────────────────────────
export const getBodyMeasurements = (p) => {
  const stage = getPregnancyStage(p);
  const bustAdd  = [0, 4, 8, 16][stage];   // 胸圍增加：初+4, 中+8, 晚+16cm
  const waistAdd = [0, 4, 12, 24][stage];  // 腰圍增加：初+4, 中+12, 晚+24cm（晚期72+24=96，接近臀圍102）
  return {
    bust:  p.bust  + bustAdd,
    waist: p.waist + waistAdd,
    hips:  p.hips,
  };
};

export const getCurrentCup = (p) => {
  // 用實際 cup 欄位加上懷孕罩杯增量，不用 bust 公式換算
  const baseIdx = CUPS.indexOf(p.cup||'K');
  const stage = getPregnancyStage(p);
  const cupAdd = [0, 1, 2, 4][stage]; // 早期+1罩杯, 中期+2, 晚期+4（著床期 0 無變化）
  return CUPS[Math.min(baseIdx + cupAdd, CUPS.length-1)];
};

// ─────────────────────────────────────────────────────────────────────
// 11.4 魅力 — calcCharm
// ─────────────────────────────────────────────────────────────────────
export const calcCharm = p => {
  const c = p.clothes||{};
  const hasTop=!!c.top, hasBra=!!c.bra, hasBottom=!!c.bottom, hasPanties=!!c.panties, hasSocks=!!c.socks;
  // 分層魅惑：只計算「可見層」的裝飾
  // 最外層（永遠可見）：top, bottom, socks, shoes, ear
  // bra/navel 被 top 覆蓋 → 脫 top 才可見
  // panties 被 bottom 覆蓋 → 脫 bottom 才可見
  // areola/乳房刺青 被 top+bra 覆蓋 → 兩者都脫才可見
  // labia/buttocks刺青 被 bottom+panties 覆蓋 → 兩者都脫才可見
  let cc=0;
  cc+=c.top?.charm||0; cc+=c.bottom?.charm||0; cc+=c.socks?.charm||0;
  cc+=c.shoes?.charm||0; cc+=c.ear?.charm||0;
  if (!hasTop)                 cc+=c.bra?.charm||0;
  if (!hasTop)                 cc+=c.navel?.charm||0;
  if (!hasBottom)              cc+=c.panties?.charm||0;
  if (!hasTop&&!hasBra)        cc+=c.areola?.charm||0;
  if (!hasBottom&&!hasPanties) cc+=c.labia?.charm||0;
  let nudity=0;
  if (!hasTop) nudity+=80; if (!hasBottom) nudity+=80;
  if (!hasTop&&!hasBra) nudity+=60; if (!hasBottom&&!hasPanties) nudity+=60;
  const t=p.tattoos||{};
  const tc_val=(loc,visible)=>visible&&t[loc]?TATTOO_SIZES[t[loc].size].charm:0;
  let tc=0;
  tc+=tc_val('face',true); tc+=tc_val('neck',true); tc+=tc_val('arm',!hasTop);
  tc+=tc_val('back',!hasTop); tc+=tc_val('abdomen',!hasTop);
  tc+=tc_val('breast',!hasTop&&!hasBra);
  tc+=tc_val('buttocks',!hasBottom&&!hasPanties);
  tc+=tc_val('thigh',!hasSocks);
  const pc=Math.floor(Object.values(p.prof||{}).reduce((s,v)=>s+v,0)*0.5);
  const total=p.baseCharm+(p.isPregnant?50:0)+cc+nudity+tc+pc;
  return {total, rate:Math.min(0.95,0.30+(total*0.01)), clothesCharm:cc+nudity, tattooCharm:tc, profCharm:pc};
};

// ─────────────────────────────────────────────────────────────────────
// 11.5 名聲 — getReputation / getReputationTitle
// ─────────────────────────────────────────────────────────────────────
export const getReputation = p => p.fame||0;

export const getReputationTitle = rep => {
  let result = REPUTATION_TITLES[0];
  for (const t of REPUTATION_TITLES) { if (rep >= t[0]) result = t; }
  return { title: result[1], color: result[2] };
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 12: 戰鬥系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 12.1 戰鬥常數 — 傷害值、費用、名聲層級
// ─────────────────────────────────────────────────────────────────────
export const FOREPLAY_DMG  = {hand:{player:5,enemy:10},mouth:{player:7,enemy:14},boob:{player:6,enemy:12},butt:{player:6,enemy:12},leg:{player:4,enemy:8}};
export const SEX_DMG   = {player:18, enemy:36};
export const SEX_FEE   = {vaginaCondom:40, vaginaNoCondom:60, analCondom:30, analNoCondom:50};
export const FOREPLAY_FEE  = {hand:15, mouth:25, boob:25, butt:20, leg:15};

export const FAME_TIERS = [
  {minFame:0,   baseFee:30,  ratePerMin:1, timeMult:1.00},
  {minFame:100, baseFee:50,  ratePerMin:2, timeMult:1.05},
  {minFame:300, baseFee:80,  ratePerMin:3, timeMult:1.10},
  {minFame:600, baseFee:120, ratePerMin:5, timeMult:1.15},
  {minFame:1000,baseFee:180, ratePerMin:8, timeMult:1.20},
];
export const FAME_BY_LEAVE  = {timeout:1,enemyHp:2,semen:4};

// ─────────────────────────────────────────────────────────────────────
// 12.2 戰鬥計算 — 服務費、興奮度、高潮、傷害計算
// ─────────────────────────────────────────────────────────────────────
export const calcServiceCharge = (base, profLvl) => {
  return Math.ceil(base + profLvl * 1); // 基礎費 + 熟練度×1
};
export const calcEffectiveArousal = (enemy, charmTotal) => {
  const charBonus = Math.floor(charmTotal*0.3);
  return Math.min(200, (enemy.arousal||0)+charBonus);
};
export const calcOrgasmChance = (effArousal, mult) => {
  if (effArousal >= 200) return 1.0;
  return Math.min(1.0, (effArousal * mult) / 100);
};
export const calcArousalGain = (type, profLvl) => {
  const base = {hand:12,mouth:18,boob:15,butt:15,leg:10}[type]||12;
  return Math.ceil((base + profLvl * 0.2) * (0.85+Math.random()*0.3));
};
export const calcOrgasmOutput = (currentVolume, effArousal, profLvl) => {
  const pct      = currentVolume * 0.05;
  const arousalPart = effArousal * 0.02;
  const randPart = (1 + Math.random() * 4) + profLvl * 0.05;
  const vol = Math.ceil(pct + arousalPart + randPart);
  const newVol = Math.max(0, currentVolume - vol);
  return {vol, newVol};
};
export const calcProfDmgMult = profLvl => Math.min(2.0, 1+profLvl*0.01);   // 柯妤潔用
export const calcEnemyDmgMult = profLvl => Math.min(3.0, 1+profLvl*0.02);  // 敵人用（熟練度100→×3.0）
export const dmgVariance = () => 0.8+Math.random()*0.4;

// ─────────────────────────────────────────────────────────────────────
// 12.3 名聲層級 — getFameTier
// ─────────────────────────────────────────────────────────────────────
export const getFameTier = (rep) => [...FAME_TIERS].reverse().find(t=>rep>=t.minFame) || FAME_TIERS[0];


