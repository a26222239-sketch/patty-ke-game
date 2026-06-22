// 系統函數 — 客人生成/脫衣/體毛（從 game.jsx SECTION 13-16 抽出）
import { HAIR_PARTS, HAIR_PART_NAMES, HAIR_LEVELS, SHOPKEEPER_NAME } from './constants.js';
import { ENEMY_TIERS, LABOR_JOBS, CAT, CLOTHING_DB } from './data.js';
import { pick, vary, getFameTier, getCurrentCup, getBodyMeasurements, getPregnancyStage } from './logic.js';
import { SCENE_TEXTS, BODYHAIR_GROW_TEXTS } from '../texts.js';

// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 13: 客人系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 13.1 客人生成 — pickTierByReputation / genEnemy
// ─────────────────────────────────────────────────────────────────────
export const pickTierByReputation = fame => {
  // 名聲越高，高 tier 客人出現比例越高
  // 名聲0: T1=50% T5=1%
  // 名聲1000: T1=5% T5=40%
  const boost = Math.floor(fame / 100);
  const weights = [
    Math.max(5,  50 - boost * 5),   // Tier1 快速下降
    Math.max(5,  30 - boost * 2),   // Tier2 緩慢下降
    Math.min(35, 15 + boost * 1),   // Tier3 小幅上升
    Math.min(40,  4 + boost * 3),   // Tier4 明顯上升
    Math.min(50,  1 + boost * 4),   // Tier5 大幅上升
  ];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i=0; i<weights.length; i++) { r -= weights[i]; if (r<=0) return i; }
  return 4;
};

export const genEnemy = (player) => {
  const tierIdx = pickTierByReputation(player.fame||0);
  const tier = ENEMY_TIERS[tierIdx];
  const name = pick(tier.names);
  const rep = player.fame||0;
  const fameT = getFameTier(rep);

  // === 精液量：基礎 20~40mL，±20%誤差；勞工職業 ×1.1~1.3 加成 ===
  const isLabor = LABOR_JOBS.includes(name);
  const semenRaw = 20 + Math.random()*20;
  const semenBase = Math.round(vary(semenRaw * (isLabor ? 1.1+Math.random()*0.2 : 1.0), 0.2));

  // === 服務時間：依Tier基礎，名聲timeMult加成，同Tier±20%，最低60分 ===
  const baseServiceTime = tier.serviceTime[0] + Math.floor(Math.random()*(tier.serviceTime[1]-tier.serviceTime[0]));
  const serviceTime = Math.max(60, Math.round(vary(baseServiceTime * fameT.timeMult, 0.2) / 10) * 10);

  // === 固定消費 + 台數（只受名聲影響）===
  const baseFee   = fameT.baseFee;
  const ratePerMin = fameT.ratePerMin;
  // minFee = 固定消費 + 台數×服務時間（無條件進位）
  const minFee = Math.ceil(baseFee + ratePerMin * serviceTime);

  // === 客人攜帶金額：一定超過 minFee，用 1.3~1.5 倍保證 ===
  const heldGold = Math.ceil(minFee * (1.3 + Math.random()*0.2));

  // === 其他屬性 ===
  const baseArousal = tier.arousalBase[0]+Math.floor(Math.random()*(tier.arousalBase[1]-tier.arousalBase[0]));
  const enemyHpBase = 150*[1.0,1.5,2.2,3.0,4.0][tierIdx];
  const enemyHp = Math.round(vary(enemyHpBase,0.2));

  // 偏好：前戲偏好（5種）+ 做愛偏好（隨機）
  const prefKeys = ['hand','mouth','boob','butt','leg'];
  const preference = prefKeys[Math.floor(Math.random()*prefKeys.length)];
  const sexPref = Math.random()<0.5 ? 'vagina' : 'anal';

  // 體毛喜好：每客人偏好「某部位 + 某等級」
  // Tier 分布：低 Tier 偏好濃密/雜草、中 Tier 偏好稀疏/濃密、高 Tier 偏好光滑/稀疏
  const hairPart = pick(HAIR_PARTS);
  let hairLevelPool;
  if (tierIdx <= 1)      hairLevelPool = ['thick', 'wild'];     // 低 Tier
  else if (tierIdx === 2) hairLevelPool = ['sparse', 'thick'];   // 中 Tier
  else                    hairLevelPool = ['smooth', 'sparse'];  // 高 Tier
  const hairLevel = pick(hairLevelPool);

  return {
    name, tierIdx, baseSemen:semenBase, semenVolume:semenBase,
    arousal:baseArousal,
    hp:enemyHp, maxHp:enemyHp,
    serviceTime, heldGold, minFee, ratePerMin, baseFee,
    preference, mainActPref:sexPref, maxArousal:baseArousal,
    phase:'combat', foreplayCount:0, foreplayRejected:false,
    bathInviteCount:0, bathLocked:false,
    chargedServices:[], accumulatedFee:0, counted:{},
    undressedDuringForeplay:{},
    bathServiceCount:0, bathedThisVisit:false,
    revealedPreference:false,
    condomEquipped:false, pendingHole:null, condomMode:null,
    // 體毛喜好系統
    hairPref: { part: hairPart, level: hairLevel },
    hairPrefSatisfied: false,       // 是否已觸發過喜好命中
  };

};

// 肉償：老闆「阿坤」作為特殊客人。體力/精液比一般客人高一些；不包時間（無 serviceEndTime→不會時間到退場）；
// 不付錢（heldGold=0、minFee=0→離場結算 0G，但名氣與熟練度照常累積）；做愛一律無套。
export const genBoss = (player) => {
  const semenBase = Math.round(vary(60, 0.15));        // 一般客人 20~40，老闆高一些
  const enemyHp   = Math.round(vary(650, 0.15));       // 體力偏高、耐操
  const baseArousal = 60;
  const prefKeys = ['hand','mouth','boob','butt','leg'];
  const preference = prefKeys[Math.floor(Math.random()*prefKeys.length)];
  const sexPref = Math.random()<0.5 ? 'vagina' : 'anal';
  const hairPart = pick(HAIR_PARTS);
  const hairLevel = pick(['smooth','sparse','thick','wild']);
  return {
    name: SHOPKEEPER_NAME, isBoss:true, tierIdx:4,
    baseSemen:semenBase, semenVolume:semenBase,
    arousal:baseArousal, maxArousal:baseArousal,
    hp:enemyHp, maxHp:enemyHp,
    serviceTime:0, heldGold:0, minFee:0, ratePerMin:0, baseFee:0,   // 不包時間、不付錢
    preference, mainActPref:sexPref,
    phase:'combat', foreplayCount:0, foreplayRejected:false,
    bathInviteCount:0, bathLocked:true,                              // 休息區無浴室
    chargedServices:[], accumulatedFee:0, counted:{},
    undressedDuringForeplay:{},
    bathServiceCount:0, bathedThisVisit:false,
    revealedPreference:false,
    condomEquipped:false, pendingHole:null, condomMode:null,
    hairPref:{ part:hairPart, level:hairLevel }, hairPrefSatisfied:false,
  };
};

// 關店後跟老闆「做愛」：阿坤當成特殊娼館客人。借 genEnemy 算費用/偏好（會付錢），
// 體力/精液=肉償等級、不限時(不設 serviceEndTime)、休息區無浴室；允許戴套/送客（與肉償不同）。
export const genBossDate = (player) => {
  const e = genEnemy(player);
  const hp = Math.round(vary(650, 0.15));
  const semen = Math.round(vary(60, 0.15));
  return {
    ...e,
    name: SHOPKEEPER_NAME, isBossDate: true,
    hp, maxHp: hp, baseSemen: semen, semenVolume: semen,
    bathLocked: true,
    // 保留 e.minFee/heldGold（會付錢）；不設 serviceEndTime（不限時）
  };
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 14: 商店系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 14.1 商店生成 — restockShop / makeShop
// ─────────────────────────────────────────────────────────────────────
export const restockShop = (p) => {
  if ((p.shopCondomsDay||0) >= p.days) return p; // 今天已補過
  return {
    ...p,
    shopCondomsLeft: 2,    // 保險套補滿
    shopCondomsDay: p.days, // 標記今天已補
  };
};

export const makeShop = (wardrobe=[], shopProgress={}) => {
  const slots = ['top','bra','bottom','panties','ear','navel','areola','labia','socks','shoes'];
  return slots.map(slot=>{
    const db = CLOTHING_DB[slot]||[];
    let idx = shopProgress[slot]||0;
    // 跳過已擁有的（含初始就擁有的起始衣物），顯示該格第一件還沒有的
    while (idx < db.length && wardrobe.includes(db[idx].id)) idx++;
    if (idx >= db.length) return {slot, sold:true};
    return {...db[idx], slot};
  });
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 15: 脫衣系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 15.1 脫衣輔助 — buildUndressLogs（用於 doForeplay 和 doBath）
// ─────────────────────────────────────────────────────────────────────
export const buildUndressLogs = (slotsToRemove, clothes, player) => {
  const newClothes = {...clothes};
  const logs = [];
  for (const slot of slotsToRemove) {
    if (!newClothes[slot]) continue;
    const item = newClothes[slot];
    newClothes[slot] = null;
    const revealDesc = getRevealDesc({...player, clothes:newClothes}, slot);
    const revealPart = revealDesc ? `，露出了${revealDesc}` : '';
    logs.push([`👗 柯妤潔脫下了【${item.name}】${revealPart}。`, 'undress']);
  }
  return {logs, newClothes};
};

// ─────────────────────────────────────────────────────────────────────
// 15.2 露出描述 — getRevealDesc（StatusPanel 顯示露出狀態）
// ─────────────────────────────────────────────────────────────────────
export const getRevealDesc = (player, slot) => {
  const c = player.clothes||{};
  const t = player.tattoos||{};
  const parts = [];
  // 體毛描述 helper（等級 0 不顯示）
  const hairDesc = (part) => {
    const lv = player.bodyHair?.[part] ?? 0;
    if (lv === 0) return null;
    return `${HAIR_LEVELS[lv]}的${HAIR_PART_NAMES[part]}`;
  };
  if (slot==='top') {
    if (c.bra)    parts.push(`【${c.bra.name}】`);
    // 肚臍：首飾優先，無首飾但有穿孔顯示環
    if (c.navel)              parts.push(`【${c.navel.name}】`);
    else if (player.piercings?.navel) parts.push(`肚臍環`);
    if (t.abdomen) parts.push(`腹部的${t.abdomen.content}刺青`);
    if (t.back)   parts.push(`背部的${t.back.content}刺青`);
    if (t.arm)    parts.push(`手臂的${t.arm.content}刺青`);
    // 沒穿 bra 時，胸口露出：刺青、乳環、或預設身體描述
    if (!c.bra) {
      if (t.breast)                  parts.push(`乳房的${t.breast.content}刺青`);
      if (player.piercings?.areola)  parts.push(`乳暈環`);
      if (!t.breast && !player.piercings?.areola) {
        const cup = getCurrentCup(player);
        const bust = getBodyMeasurements(player).bust;
        const stage = getPregnancyStage(player);
        const bustAdj = stage===3?'高度隆起、沉甸甸的':stage===2?'明顯豐滿的':'';
        parts.push(`${bustAdj}${bust}公分、${cup}罩杯的巨大乳房`);
      }
    }
    // 脫 top 時腋下直接露出（bra 沒袖子擋不住腋下）
    const armpit = hairDesc('armpit');
    if (armpit) parts.push(armpit);
  } else if (slot==='bra') {
    // 脫 bra 時，top 還在就什麼都看不到
    if (c.top) return null;
    if (player.piercings?.areola) parts.push(`乳暈環`);
    if (t.breast)              parts.push(`乳房的${t.breast.content}刺青`);
    if (!t.breast && !player.piercings?.areola) {
      const cup = getCurrentCup(player);
      const bust = getBodyMeasurements(player).bust;
      const stage = getPregnancyStage(player);
      const bustAdj = stage===3?'沉甸甸的':stage===2?'豐滿飽脹的':'';
      parts.push(`${bustAdj}${bust}公分、${cup}罩杯的裸胸與挺立的乳頭`);
    }
  } else if (slot==='bottom') {
    if (c.panties) parts.push(`【${c.panties.name}】`);
    // 沒穿 panties 時，下體露出：刺青、陰唇環、或預設身體描述 + 體毛
    if (!c.panties) {
      if (t.buttocks)                parts.push(`臀部的${t.buttocks.content}刺青`);
      if (player.piercings?.labia)   parts.push(`陰唇環`);
      if (!t.buttocks && !player.piercings?.labia) {
        parts.push(`白皙的小穴與渾圓的屁股`);
      }
      // 脫 bottom 時若 panties 也已脫掉，下體露出（pubic/anal 跟 panties 同層）
      const pubic = hairDesc('pubic');
      if (pubic) parts.push(pubic);
      const anal = hairDesc('anal');
      if (anal) parts.push(anal);
    }
  } else if (slot==='panties') {
    // 脫 panties 時，bottom 還在就什麼都看不到
    if (c.bottom) return null;
    if (player.piercings?.labia) parts.push(`陰唇環`);
    if (t.buttocks)             parts.push(`臀部的${t.buttocks.content}刺青`);
    if (!t.buttocks && !player.piercings?.labia) parts.push(`白皙的小穴與渾圓的屁股`);
    // 脫 panties 時下體露出
    const pubic = hairDesc('pubic');
    if (pubic) parts.push(pubic);
    const anal = hairDesc('anal');
    if (anal) parts.push(anal);
  } else if (slot==='socks') {
    if (t.thigh) parts.push(`大腿的${t.thigh.content}刺青`);
    else parts.push(`白皙修長的大腿`);
  } else if (slot==='shoes') {
    parts.push(`白皙的玉足`);
  }
  return parts.length ? parts.join('、') : null;
};

// ─────────────────────────────────────────────────────────────────────
// 15.3 衣物恢復 — restoreUndressed（客人離場後恢復前戲時脫的衣物）
// ─────────────────────────────────────────────────────────────────────
export const restoreUndressed = (enemy, player) => {
  const saved = enemy.undressedDuringForeplay||{};
  let clothes = {...player.clothes};
  for (const [slot, item] of Object.entries(saved)) {
    if (item && player.wardrobe.includes(item.id) && !clothes[slot]) {
      clothes[slot] = item;
    }
  }
  return clothes;
};


// ╔════════════════════════════════════════════════════════════════════╗
// ║ SECTION 16: 體毛系統                                                ║
// ╚════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────
// 16.1 體毛工具函數 — getHairLevel / enemyCanSeeHair / getHairPartName / getHairLevelName
// ─────────────────────────────────────────────────────────────────────
// 取得某部位當前等級（0~3）
export const getHairLevel = (p, part) => {
  return p.bodyHair?.[part] ?? 1;
};

// 判斷客人是否可以看到某部位的體毛
//   armpit（腋毛）：bra 脫掉才看到
//   pubic（陰毛）/ anal（肛毛）：panties 脫掉才看到
export const enemyCanSeeHair = (player, part) => {
  const c = player.clothes || {};
  if (part === 'armpit')  return !c.bra;
  if (part === 'pubic')   return !c.panties;
  if (part === 'anal')    return !c.panties;
  return false;
};

// 取得部位 + 等級的中文顯示（用於文本 placeholder）
export const getHairPartName  = part  => HAIR_PART_NAMES[part]   || part;
export const getHairLevelName = level => HAIR_LEVELS[level]      || '';


