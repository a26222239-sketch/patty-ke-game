// 第一週半沙盒進度邏輯。
// 此檔案不直接操作 React state；所有函數皆為純函數，方便測試與存檔遷移。
import { FIRST_WEEK_TEXTS } from '../texts.js';

export const FIRST_WEEK = {
  chapter: 'first_week',
  startDay: 1,
  deadlineDay: 7,
  settlementMinute: 21 * 60,
  targetGold: 1200,
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
  /\{(GOLD|TARGET|TRUST)\}/g,
  (_, key) => String(values[key] ?? ''),
);

export const getPendingFirstWeekEvent = player => {
  const current = normalizeFirstWeekPlayer(player);
  const { progress } = current;
  if (progress.resolved) return null;

  const afterDeadline = current.days > progress.deadlineDay
    || (current.days === progress.deadlineDay && current.timeMinutes >= FIRST_WEEK.settlementMinute);
  if (afterDeadline) {
    return toEvent(FIRST_WEEK_EVENT_IDS.settlement, FIRST_WEEK_TEXTS.events.week_settlement);
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

  if (choiceId === 'settlement_continue') {
    const outcome = resolveFirstWeek(current, current.relationships);
    return {
      player: {
        ...current,
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
      effects: [],
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
