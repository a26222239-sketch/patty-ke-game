// 第一週半沙盒進度邏輯。
// 此檔案不直接操作 React state；所有函數皆為純函數，方便測試與存檔遷移。
import { FIRST_WEEK_TEXTS } from '../texts.js';

export const FIRST_WEEK = {
  chapter: 'first_week',
  startDay: 1,
  deadlineDay: 7,
  settlementMinute: 21 * 60,
  targetGold: 1200,
  bodyRepaymentDiscount: 200,
  bodyRepaymentHpCost: 35,
  bodyRepaymentExtensionDays: 3,
  refusalGoldPenalty: 150,
  refusalHpCost: 25,
};

export const FIRST_WEEK_EVENT_IDS = {
  opening: 'opening_notice',
  shopIntro: 'shop_job_intro',
  dayThree: 'shop_manager_day_three',
  dayFive: 'shop_manager_day_five',
  settlement: 'week_settlement',
};

export const TUTORIAL_STEPS = [
  {
    id: 'meet_first_customer',
    title: '接待第一位客人',
    hint: '先觀察客人的偏好，再提高他的性奮度。',
  },
  {
    id: 'rest_once',
    title: '安排一次休息',
    hint: '體力不足會限制可用行動；休息也是一種投資。',
  },
  {
    id: 'visit_shop',
    title: '前往商店',
    hint: '商店可購買裝備，也能開始建立阿坤關係。',
  },
  {
    id: 'save_once',
    title: '存檔',
    hint: '先保存進度，之後才能安心嘗試不同選擇。',
  },
];

const toEvent = (id, text) => ({
  id,
  title: text.title,
  detail: text.detail,
  choices: Object.entries(text.choices).map(([choiceId, choice]) => ({
    id: choiceId,
    label: choice.label,
    hint: choice.hint,
    ...(choiceId === 'day5_request_buffer' ? { requiresShopManagerTrust: 1 } : {}),
  })),
});

export const FIRST_WEEK_EVENTS = {
  [FIRST_WEEK_EVENT_IDS.opening]: toEvent(FIRST_WEEK_EVENT_IDS.opening, FIRST_WEEK_TEXTS.events.opening_notice),
  [FIRST_WEEK_EVENT_IDS.shopIntro]: toEvent(FIRST_WEEK_EVENT_IDS.shopIntro, FIRST_WEEK_TEXTS.events.shop_job_intro),
  [FIRST_WEEK_EVENT_IDS.dayThree]: toEvent(FIRST_WEEK_EVENT_IDS.dayThree, FIRST_WEEK_TEXTS.events.shop_manager_day_three),
  [FIRST_WEEK_EVENT_IDS.dayFive]: toEvent(FIRST_WEEK_EVENT_IDS.dayFive, FIRST_WEEK_TEXTS.events.shop_manager_day_five),
};

export const createFirstWeekProgress = () => ({
  chapter: FIRST_WEEK.chapter,
  phase: 'tutorial',
  deadlineDay: FIRST_WEEK.deadlineDay,
  targetGold: FIRST_WEEK.targetGold,
  tutorialStep: 0,
  completedMilestones: [],
  customerVisits: 0,
  shopVisits: 0,
  resolvedEventIds: [],
  pendingEventId: null,
  outcomeId: null,
  landlordExtensionUsed: false,
  landlordPressure: 0,
  resolved: false,
});

export const createInitialRelationships = () => ({
  shopManager: {
    affection: 0,
    trust: 0,
    dominance: 0,
  },
});

export const createFirstWeekFlags = () => ({
  firstWeekShopJobSeen: false,
  firstWeekBossPromiseMade: false,
  firstWeekOutcomeSeen: false,
});

export const normalizeFirstWeekProgress = progress => ({
  ...createFirstWeekProgress(),
  ...(progress || {}),
  completedMilestones: Array.isArray(progress?.completedMilestones) ? progress.completedMilestones : [],
  resolvedEventIds: Array.isArray(progress?.resolvedEventIds) ? progress.resolvedEventIds : [],
});

export const normalizeFirstWeekRelationships = relationships => {
  const legacyBoss = relationships?.boss || {};
  return {
    ...createInitialRelationships(),
    ...(relationships || {}),
    shopManager: {
      ...createInitialRelationships().shopManager,
      ...legacyBoss,
      ...(relationships?.shopManager || {}),
    },
  };
};

export const normalizeFirstWeekPlayer = player => ({
  ...(player || {}),
  progress: normalizeFirstWeekProgress(player?.progress),
  relationships: normalizeFirstWeekRelationships(player?.relationships),
  flags: {
    ...createFirstWeekFlags(),
    ...(player?.flags || {}),
  },
});

export const getTutorialStep = progress => {
  const index = progress?.tutorialStep ?? 0;
  return TUTORIAL_STEPS[index] ?? null;
};

export const completeTutorialStep = (progress, stepId) => {
  const base = normalizeFirstWeekProgress(progress);
  const current = getTutorialStep(base);
  if (!current || current.id !== stepId) return base;

  return {
    ...base,
    tutorialStep: (base.tutorialStep ?? 0) + 1,
    phase: (base.tutorialStep ?? 0) + 1 >= TUTORIAL_STEPS.length ? 'active' : base.phase,
  };
};

const isEventResolved = (progress, eventId) => progress.resolvedEventIds.includes(eventId);

const markEventResolved = (progress, eventId) => ({
  ...progress,
  resolvedEventIds: isEventResolved(progress, eventId)
    ? progress.resolvedEventIds
    : [...progress.resolvedEventIds, eventId],
  pendingEventId: null,
});

export const getFirstWeekEvent = eventId => FIRST_WEEK_EVENTS[eventId] || null;

const getChoiceText = (eventId, choiceId, key = 'result') => (
  FIRST_WEEK_TEXTS.events[eventId]?.choices[choiceId]?.[key] || ''
);

const formatFirstWeekText = (template, values) => template.replace(
  /\{(GOLD|TARGET|TRUST|SHORTFALL|DISCOUNT|NEW_TARGET|DEADLINE|HP_COST|PENALTY)\}/g,
  (_, key) => String(values[key] ?? ''),
);

const getSettlementTextValues = current => {
  const progress = current.progress;
  const gold = current.gold ?? 0;
  return {
    GOLD: gold,
    TARGET: progress.targetGold,
    TRUST: current.relationships.shopManager.trust,
    SHORTFALL: Math.max(0, progress.targetGold - gold),
    DISCOUNT: FIRST_WEEK.bodyRepaymentDiscount,
    NEW_TARGET: Math.max(0, progress.targetGold - FIRST_WEEK.bodyRepaymentDiscount),
    DEADLINE: progress.deadlineDay + FIRST_WEEK.bodyRepaymentExtensionDays,
    HP_COST: FIRST_WEEK.bodyRepaymentHpCost,
    PENALTY: FIRST_WEEK.refusalGoldPenalty,
  };
};

const getSettlementEvent = current => {
  const text = FIRST_WEEK_TEXTS.events.week_settlement;
  const values = getSettlementTextValues(current);
  const paidInFull = (current.gold ?? 0) >= current.progress.targetGold;
  const choiceIds = paidInFull
    ? ['settlement_pay']
    : current.progress.landlordExtensionUsed
      ? ['settlement_final']
      : ['settlement_body_extension', 'settlement_refuse'];

  return {
    id: FIRST_WEEK_EVENT_IDS.settlement,
    title: text.title,
    detail: formatFirstWeekText(text.detail, values),
    choices: choiceIds.map(choiceId => ({
      id: choiceId,
      label: text.choices[choiceId].label,
      hint: formatFirstWeekText(text.choices[choiceId].hint, values),
    })),
  };
};

export const getPendingFirstWeekEvent = player => {
  const current = normalizeFirstWeekPlayer(player);
  const { progress } = current;
  if (progress.resolved) return null;

  const afterDeadline = current.days > progress.deadlineDay
    || (current.days === progress.deadlineDay && current.timeMinutes >= FIRST_WEEK.settlementMinute);
  if (afterDeadline) {
    return getSettlementEvent(current);
  }

  if (!isEventResolved(progress, FIRST_WEEK_EVENT_IDS.opening)) return getFirstWeekEvent(FIRST_WEEK_EVENT_IDS.opening);
  if (current.days >= 5 && !isEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive)) return getFirstWeekEvent(FIRST_WEEK_EVENT_IDS.dayFive);
  if (current.days >= 3 && !isEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree)) return getFirstWeekEvent(FIRST_WEEK_EVENT_IDS.dayThree);
  if (progress.shopVisits > 0 && !isEventResolved(progress, FIRST_WEEK_EVENT_IDS.shopIntro)) return getFirstWeekEvent(FIRST_WEEK_EVENT_IDS.shopIntro);
  return null;
};

export const refreshFirstWeekEvent = player => {
  const current = normalizeFirstWeekPlayer(player);
  const event = getPendingFirstWeekEvent(current);
  return {
    ...current,
    progress: {
      ...current.progress,
      pendingEventId: event?.id || null,
      phase: event?.id === FIRST_WEEK_EVENT_IDS.settlement ? 'closing' : current.progress.phase,
    },
  };
};

export const advanceFirstWeekTime = (player, minutes) => {
  const current = normalizeFirstWeekPlayer(player);
  const total = (current.timeMinutes || 0) + minutes;
  return refreshFirstWeekEvent({
    ...current,
    timeMinutes: total % 1440,
    days: (current.days || FIRST_WEEK.startDay) + Math.floor(total / 1440),
  });
};

const updateShopManagerTrust = (player, amount) => ({
  ...player,
  relationships: {
    ...player.relationships,
    shopManager: {
      ...player.relationships.shopManager,
      trust: Math.max(0, player.relationships.shopManager.trust + amount),
    },
  },
});

const eventResult = (player, { timeCost = 0, message, effects = [] } = {}) => ({
  player: refreshFirstWeekEvent(player),
  timeCost,
  message,
  effects,
});

export const applyFirstWeekChoice = (player, choiceId) => {
  const current = normalizeFirstWeekPlayer(player);
  const { progress } = current;
  const managerTrust = current.relationships.shopManager.trust;
  const settlementChoice = choiceId === 'settlement_continue'
    ? ((current.gold ?? 0) >= progress.targetGold ? 'settlement_pay' : 'settlement_refuse')
    : choiceId;

  if (settlementChoice === 'settlement_pay') {
    if ((current.gold ?? 0) < progress.targetGold) {
      return { player: current, timeCost: 0, message: '欠款尚未繳清，不能選擇結清。', effects: [], blocked: true };
    }
    const outcome = resolveFirstWeek(current, current.relationships);
    return {
      player: {
        ...current,
        gold: (current.gold ?? 0) - progress.targetGold,
        progress: {
          ...markEventResolved(progress, FIRST_WEEK_EVENT_IDS.settlement),
          phase: 'resolved',
          resolved: true,
          outcomeId: outcome.id,
        },
        flags: { ...current.flags, firstWeekOutcomeSeen: true },
      },
      timeCost: 0,
      message: outcome.detail,
      effects: [`gold:-${progress.targetGold}`],
      outcome,
    };
  }

  if (settlementChoice === 'settlement_body_extension') {
    if ((current.gold ?? 0) >= progress.targetGold || progress.landlordExtensionUsed) {
      return { player: current, timeCost: 0, message: '這個條件已不適用。', effects: [], blocked: true };
    }
    const values = getSettlementTextValues(current);
    const next = {
      ...current,
      hp: Math.max(1, (current.hp ?? current.baseHp ?? 100) - FIRST_WEEK.bodyRepaymentHpCost),
      progress: {
        ...markEventResolved(progress, FIRST_WEEK_EVENT_IDS.settlement),
        phase: 'extension',
        deadlineDay: progress.deadlineDay + FIRST_WEEK.bodyRepaymentExtensionDays,
        targetGold: Math.max(0, progress.targetGold - FIRST_WEEK.bodyRepaymentDiscount),
        landlordExtensionUsed: true,
        landlordPressure: Math.max(1, progress.landlordPressure || 0),
      },
    };
    return eventResult(next, {
      message: formatFirstWeekText(FIRST_WEEK_TEXTS.events.week_settlement.choices.settlement_body_extension.result, values),
      effects: [
        `hp:-${FIRST_WEEK.bodyRepaymentHpCost}`,
        `debt:-${FIRST_WEEK.bodyRepaymentDiscount}`,
        `deadline:+${FIRST_WEEK.bodyRepaymentExtensionDays} days`,
      ],
    });
  }

  if (settlementChoice === 'settlement_refuse' || settlementChoice === 'settlement_final') {
    const isFinal = settlementChoice === 'settlement_final';
    const penaltyGold = isFinal ? Math.min(current.gold ?? 0, progress.targetGold) : Math.min(current.gold ?? 0, FIRST_WEEK.refusalGoldPenalty);
    const hpCost = isFinal ? FIRST_WEEK.bodyRepaymentHpCost : FIRST_WEEK.refusalHpCost;
    const outcomeText = FIRST_WEEK_TEXTS.outcomes[isFinal ? 'forced_clearance' : 'debt_deepens'];
    const values = { ...getSettlementTextValues(current), PENALTY: penaltyGold, HP_COST: hpCost };
    const outcome = {
      id: isFinal ? 'forced_clearance' : 'debt_deepens',
      title: outcomeText.title,
      detail: formatFirstWeekText(outcomeText.detail, values),
    };
    return {
      player: {
        ...current,
        gold: Math.max(0, (current.gold ?? 0) - penaltyGold),
        hp: Math.max(1, (current.hp ?? current.baseHp ?? 100) - hpCost),
        fame: Math.max(0, (current.fame ?? 0) - (isFinal ? 4 : 2)),
        progress: {
          ...markEventResolved(progress, FIRST_WEEK_EVENT_IDS.settlement),
          phase: 'resolved',
          resolved: true,
          outcomeId: outcome.id,
          landlordPressure: isFinal ? 3 : 2,
        },
        flags: { ...current.flags, firstWeekOutcomeSeen: true },
      },
      timeCost: 0,
      message: outcome.detail,
      effects: [`gold:-${penaltyGold}`, `hp:-${hpCost}`, `fame:-${isFinal ? 4 : 2}`],
      outcome,
    };
  }

  if (choiceId === 'opening_customer' || choiceId === 'opening_shop') {
    return eventResult({
      ...current,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.opening),
    }, {
      message: getChoiceText(FIRST_WEEK_EVENT_IDS.opening, choiceId),
    });
  }

  if (choiceId === 'shop_ask_work' || choiceId === 'shop_browse') {
    return eventResult({
      ...current,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.shopIntro),
      flags: { ...current.flags, firstWeekShopJobSeen: choiceId === 'shop_ask_work' },
    }, {
      message: getChoiceText(FIRST_WEEK_EVENT_IDS.shopIntro, choiceId),
    });
  }

  if (choiceId === 'day3_help') {
    const next = updateShopManagerTrust({
      ...current,
      gold: (current.gold || 0) + 60,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree),
      flags: { ...current.flags, firstWeekBossPromiseMade: true },
    }, 1);
    return eventResult(next, { timeCost: 90, message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayThree, choiceId), effects: ['gold:+60', 'shopManager.trust:+1'] });
  }

  if (choiceId === 'day3_negotiate') {
    const eligible = (current.fame || 0) >= 5;
    const next = eligible
      ? updateShopManagerTrust({
        ...current,
        gold: (current.gold || 0) + 30,
        progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree),
        flags: { ...current.flags, firstWeekBossPromiseMade: true },
      }, 1)
      : {
        ...current,
        progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree),
      };
    return eventResult(next, {
      timeCost: 45,
      message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayThree, choiceId, eligible ? 'resultEligible' : 'resultIneligible'),
      effects: eligible ? ['gold:+30', 'shopManager.trust:+1'] : [],
    });
  }

  if (choiceId === 'day3_decline') {
    return eventResult({ ...current, progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree) }, { message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayThree, choiceId) });
  }

  if (choiceId === 'day5_commit') {
    const next = updateShopManagerTrust({
      ...current,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive),
      flags: { ...current.flags, firstWeekBossPromiseMade: true },
    }, 1);
    return eventResult(next, { timeCost: 120, message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayFive, choiceId), effects: ['shopManager.trust:+1'] });
  }

  if (choiceId === 'day5_focus_gold') {
    return eventResult({ ...current, progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive) }, { message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayFive, choiceId) });
  }

  if (choiceId === 'day5_request_buffer') {
    if (managerTrust < 1) return { player: current, timeCost: 0, message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayFive, choiceId, 'blocked'), effects: [], blocked: true };
    const next = {
      ...current,
      gold: (current.gold || 0) + 100,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive),
    };
    return eventResult(next, { message: getChoiceText(FIRST_WEEK_EVENT_IDS.dayFive, choiceId), effects: ['gold:+100'] });
  }

  return { player: current, timeCost: 0, message: '這個選項目前不可用。', effects: [], blocked: true };
};

export const getFirstWeekObjective = player => {
  const current = normalizeFirstWeekPlayer(player);
  const { progress } = current;
  const gold = current.gold ?? 0;
  const remainingGold = Math.max(0, progress.targetGold - gold);
  const remainingDays = Math.max(0, progress.deadlineDay - (current.days ?? FIRST_WEEK.startDay));

  if (progress.resolved) {
    return {
      kind: 'resolved',
      title: '第一週已結算',
      detail: '查看本週結果，準備進入下一段生活。',
    };
  }

  const pendingEvent = getPendingFirstWeekEvent(current);
  if (pendingEvent) {
    return {
      kind: 'event',
      title: pendingEvent.title,
      detail: pendingEvent.detail,
      remainingDays,
      remainingGold,
    };
  }

  const tutorial = getTutorialStep(progress);
  if (tutorial) {
    return {
      kind: 'tutorial',
      title: tutorial.title,
      detail: tutorial.hint,
      remainingDays,
      remainingGold,
    };
  }

  if (progress.landlordExtensionUsed) {
    return {
      kind: 'extension_goal',
      title: '延期還債：最後期限',
      detail: `房東已接受一次身體抵債。現在還需要 ${remainingGold}G，必須在第 ${progress.deadlineDay} 天晚上前繳清；不會再有第二次延期。`,
      remainingDays,
      remainingGold,
    };
  }

  if (gold >= progress.targetGold) {
    return {
      kind: 'ready_to_resolve',
      title: '房租已備妥',
      detail: '在第七天晚上前，你可以繼續累積資源或安排休息。',
      remainingDays,
      remainingGold: 0,
    };
  }

  return {
    kind: 'weekly_goal',
    title: '第一週：準備房租',
    detail: `還需要 ${remainingGold}G；距離房東結算還有 ${remainingDays} 天。`,
    remainingDays,
    remainingGold,
  };
};

export const resolveFirstWeek = (player, relationships) => {
  const current = normalizeFirstWeekPlayer({ ...player, relationships: relationships || player?.relationships });
  const progress = current.progress;
  const gold = current.gold ?? 0;
  const manager = current.relationships.shopManager;
  const textValues = {
    GOLD: gold,
    TARGET: progress.targetGold,
    TRUST: manager.trust,
  };

  if (gold >= progress.targetGold) {
    const text = FIRST_WEEK_TEXTS.outcomes.independent_start;
    return {
      id: 'independent_start',
      title: text.title,
      detail: formatFirstWeekText(text.detail, textValues),
    };
  }

  if (manager.trust >= 2) {
    const text = FIRST_WEEK_TEXTS.outcomes.conditional_extension;
    return {
      id: 'conditional_extension',
      title: text.title,
      detail: formatFirstWeekText(text.detail, textValues),
    };
  }

  const text = FIRST_WEEK_TEXTS.outcomes.debt_deepens;
  return {
    id: 'debt_deepens',
    title: text.title,
    detail: formatFirstWeekText(text.detail, textValues),
  };
};
