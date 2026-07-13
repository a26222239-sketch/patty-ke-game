// 第一週半沙盒進度邏輯。
// 此檔案不直接操作 React state；所有函數皆為純函數，方便測試與存檔遷移。

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

export const FIRST_WEEK_EVENTS = {
  [FIRST_WEEK_EVENT_IDS.opening]: {
    id: FIRST_WEEK_EVENT_IDS.opening,
    title: '房東的通知',
    detail: '第七天晚上前，你需要準備 1200G 的房租。你可以先接客賺錢，也可以去商店找阿坤了解工作。',
    choices: [
      { id: 'opening_customer', label: '先接一位客人', hint: '直接開始累積收入。' },
      { id: 'opening_shop', label: '先去商店看看', hint: '了解較穩定的工作與人情路線。' },
    ],
  },
  [FIRST_WEEK_EVENT_IDS.shopIntro]: {
    id: FIRST_WEEK_EVENT_IDS.shopIntro,
    title: '阿坤的工作說明',
    detail: '阿坤說商店的收入不高，但願意讓你熟悉環境；之後若需要幫手，可以再來找他。',
    choices: [
      { id: 'shop_ask_work', label: '詢問工作', hint: '解鎖阿坤的工作路線。' },
      { id: 'shop_browse', label: '先購物離開', hint: '不會失去之後的機會。' },
    ],
  },
  [FIRST_WEEK_EVENT_IDS.dayThree]: {
    id: FIRST_WEEK_EVENT_IDS.dayThree,
    title: '第 3 天：阿坤的請託',
    detail: '阿坤需要一個可靠的人幫忙處理店裡的雜務。這會花掉時間，但也可能讓他更願意幫你。',
    choices: [
      { id: 'day3_help', label: '幫忙處理', hint: '耗時 90 分鐘；阿坤信任 +1，獲得 60G。' },
      { id: 'day3_negotiate', label: '先談條件', hint: '耗時 45 分鐘；名聲達 5 時，阿坤信任 +1、獲得 30G。' },
      { id: 'day3_decline', label: '婉拒', hint: '不耗時；第 5 天仍有一次建立信任的機會。' },
    ],
  },
  [FIRST_WEEK_EVENT_IDS.dayFive]: {
    id: FIRST_WEEK_EVENT_IDS.dayFive,
    title: '第 5 天：期限逼近',
    detail: '房租期限愈來愈近。阿坤提醒你，現在可以選擇繼續衝收入，或花時間累積一份可用的人情。',
    choices: [
      { id: 'day5_commit', label: '答應完成工作', hint: '耗時 120 分鐘；阿坤信任 +1。' },
      { id: 'day5_focus_gold', label: '專心賺房租', hint: '不耗時；保留時間衝刺收入。' },
      { id: 'day5_request_buffer', label: '詢問預支機會', hint: '需要阿坤信任至少 1；獲得 100G，會消耗這次人情。', requiresShopManagerTrust: 1 },
    ],
  },
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

export const getPendingFirstWeekEvent = player => {
  const current = normalizeFirstWeekPlayer(player);
  const { progress } = current;
  if (progress.resolved) return null;

  const afterDeadline = current.days > progress.deadlineDay
    || (current.days === progress.deadlineDay && current.timeMinutes >= FIRST_WEEK.settlementMinute);
  if (afterDeadline) {
    return { id: FIRST_WEEK_EVENT_IDS.settlement, title: '房東的結算', detail: '第七天晚上到了，現在必須面對房租結果。', choices: [{ id: 'settlement_continue', label: '查看結果', hint: '本週的行動已經決定結果。' }] };
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
      message: choiceId === 'opening_customer' ? '你決定先從收入開始。' : '你決定先去了解商店的選項。',
    });
  }

  if (choiceId === 'shop_ask_work' || choiceId === 'shop_browse') {
    return eventResult({
      ...current,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.shopIntro),
      flags: { ...current.flags, firstWeekShopJobSeen: choiceId === 'shop_ask_work' },
    }, {
      message: choiceId === 'shop_ask_work' ? '阿坤記住了你願意工作的態度。' : '阿坤表示你隨時可以再來問。',
    });
  }

  if (choiceId === 'day3_help') {
    const next = updateShopManagerTrust({
      ...current,
      gold: (current.gold || 0) + 60,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree),
      flags: { ...current.flags, firstWeekBossPromiseMade: true },
    }, 1);
    return eventResult(next, { timeCost: 90, message: '你花時間幫忙，獲得 60G；阿坤信任 +1。', effects: ['gold:+60', 'shopManager.trust:+1'] });
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
      message: eligible ? '你的名聲讓阿坤接受條件：獲得 30G；阿坤信任 +1。' : '阿坤聽完條件，表示等你累積更多名聲再談。',
      effects: eligible ? ['gold:+30', 'shopManager.trust:+1'] : [],
    });
  }

  if (choiceId === 'day3_decline') {
    return eventResult({ ...current, progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayThree) }, { message: '你保留了時間；第 5 天仍可重新考慮。' });
  }

  if (choiceId === 'day5_commit') {
    const next = updateShopManagerTrust({
      ...current,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive),
      flags: { ...current.flags, firstWeekBossPromiseMade: true },
    }, 1);
    return eventResult(next, { timeCost: 120, message: '你答應完成工作；阿坤信任 +1。', effects: ['shopManager.trust:+1'] });
  }

  if (choiceId === 'day5_focus_gold') {
    return eventResult({ ...current, progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive) }, { message: '你決定把剩下的時間留給收入。' });
  }

  if (choiceId === 'day5_request_buffer') {
    if (managerTrust < 1) return { player: current, timeCost: 0, message: '阿坤還不夠信任你，現在無法談預支。', effects: [], blocked: true };
    const next = {
      ...current,
      gold: (current.gold || 0) + 100,
      progress: markEventResolved(progress, FIRST_WEEK_EVENT_IDS.dayFive),
    };
    return eventResult(next, { message: '阿坤同意預支 100G，這次人情已被用掉。', effects: ['gold:+100'] });
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

  if (gold >= progress.targetGold) {
    return {
      id: 'independent_start',
      title: '如期繳租',
      detail: `你帶著 ${gold}G 面對房東，房租如期繳清。第一週的壓力沒有消失，但你靠自己的安排保住了主動權。`,
    };
  }

  if (manager.trust >= 2) {
    return {
      id: 'conditional_extension',
      title: '有條件延期',
      detail: '阿坤以工作證明與預支協助你向房東說明。房東同意暫緩追討，但下一週必須面對這份人情與更短的期限。',
    };
  }

  return {
    id: 'debt_deepens',
    title: '債務加重',
    detail: '房東沒有接受你的拖延。你仍能繼續生活，但下一週的壓力更高，也必須更仔細安排每一次行動。',
  };
};
