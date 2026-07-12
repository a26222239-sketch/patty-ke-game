// 第一週半沙盒進度邏輯。
// 此檔案不直接操作 React state；所有函數皆為純函數，方便測試與存檔遷移。

export const FIRST_WEEK = {
  chapter: 'first_week',
  startDay: 1,
  deadlineDay: 7,
  targetGold: 1200,
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

export const createFirstWeekProgress = () => ({
  chapter: FIRST_WEEK.chapter,
  deadlineDay: FIRST_WEEK.deadlineDay,
  targetGold: FIRST_WEEK.targetGold,
  tutorialStep: 0,
  completedMilestones: [],
  customerVisits: 0,
  resolved: false,
});

export const createInitialRelationships = () => ({
  boss: {
    affection: 0,
    trust: 0,
    dominance: 0,
  },
});

export const getTutorialStep = progress => {
  const index = progress?.tutorialStep ?? 0;
  return TUTORIAL_STEPS[index] ?? null;
};

export const completeTutorialStep = (progress, stepId) => {
  const base = progress ?? createFirstWeekProgress();
  const current = getTutorialStep(base);
  if (!current || current.id !== stepId) return base;

  return {
    ...base,
    tutorialStep: (base.tutorialStep ?? 0) + 1,
  };
};

export const getFirstWeekObjective = player => {
  const progress = player?.progress ?? createFirstWeekProgress();
  const gold = player?.gold ?? 0;
  const remainingGold = Math.max(0, progress.targetGold - gold);
  const remainingDays = Math.max(0, progress.deadlineDay - (player?.days ?? FIRST_WEEK.startDay));

  if (progress.resolved) {
    return {
      kind: 'resolved',
      title: '第一週已結算',
      detail: '查看章節結果，準備進入下一段生活。',
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
      title: '資金已達標',
      detail: '撐到第七天晚上，或繼續累積資源。',
      remainingDays,
      remainingGold: 0,
    };
  }

  return {
    kind: 'weekly_goal',
    title: '第一週：建立立足點',
    detail: `還需要 ${remainingGold}G；距離結算還有 ${remainingDays} 天。`,
    remainingDays,
    remainingGold,
  };
};

export const resolveFirstWeek = (player, relationships) => {
  const progress = player?.progress ?? createFirstWeekProgress();
  const gold = player?.gold ?? 0;
  const boss = relationships?.boss ?? createInitialRelationships().boss;

  if (gold >= progress.targetGold) {
    return {
      id: 'independent_start',
      title: '自立起步',
      detail: '柯妤潔成功度過了第一週，能以較主動的姿態面對這座城市。',
    };
  }

  if (boss.trust >= 2) {
    return {
      id: 'conditional_extension',
      title: '有條件延期',
      detail: '阿坤願意延後期限，但這份人情會在往後留下痕跡。',
    };
  }

  return {
    id: 'debt_deepens',
    title: '債務加重',
    detail: '第一週沒有達標，但故事沒有結束；新的限制與機會同時出現。',
  };
};
