import { describe, expect, it } from 'vitest';
import {
  FIRST_WEEK,
  TUTORIAL_STEPS,
  completeTutorialStep,
  createFirstWeekProgress,
  getFirstWeekObjective,
  getTutorialStep,
  resolveFirstWeek,
} from '../src/progression.js';

describe('第一週半沙盒進度', () => {
  it('建立可存檔的第一週預設進度', () => {
    expect(createFirstWeekProgress()).toEqual({
      chapter: 'first_week',
      deadlineDay: 7,
      targetGold: 1200,
      tutorialStep: 0,
      completedMilestones: [],
      customerVisits: 0,
      resolved: false,
    });
  });

  it('教學必須依既定順序推進，不能跳步', () => {
    const initial = createFirstWeekProgress();
    expect(getTutorialStep(initial)).toEqual(TUTORIAL_STEPS[0]);

    const ignored = completeTutorialStep(initial, 'visit_shop');
    expect(ignored).toBe(initial);

    const advanced = completeTutorialStep(initial, 'meet_first_customer');
    expect(getTutorialStep(advanced)).toEqual(TUTORIAL_STEPS[1]);
  });

  it('supports saves without an existing progress object', () => {
    const advanced = completeTutorialStep(undefined, 'meet_first_customer');

    expect(advanced.tutorialStep).toBe(1);
    expect(advanced.customerVisits).toBe(0);
  });

  it('教學結束前優先顯示目前教學目標', () => {
    const objective = getFirstWeekObjective({
      days: 1,
      gold: 9999,
      progress: createFirstWeekProgress(),
    });

    expect(objective.kind).toBe('tutorial');
    expect(objective.title).toBe('接待第一位客人');
  });

  it('教學結束後顯示資金與期限目標', () => {
    const progress = { ...createFirstWeekProgress(), tutorialStep: TUTORIAL_STEPS.length };
    const objective = getFirstWeekObjective({
      days: 3,
      gold: 700,
      progress,
    });

    expect(objective.kind).toBe('weekly_goal');
    expect(objective.remainingGold).toBe(500);
    expect(objective.remainingDays).toBe(4);
  });

  it('達標後預告第一週結算', () => {
    const progress = { ...createFirstWeekProgress(), tutorialStep: TUTORIAL_STEPS.length };
    const objective = getFirstWeekObjective({
      days: FIRST_WEEK.deadlineDay,
      gold: FIRST_WEEK.targetGold,
      progress,
    });

    expect(objective.kind).toBe('ready_to_resolve');
  });

  it('依資金與阿坤信任決定三種第一週結果', () => {
    const player = { gold: 300, progress: createFirstWeekProgress() };

    expect(resolveFirstWeek(
      { ...player, gold: FIRST_WEEK.targetGold },
      { boss: { trust: 0 } },
    ).id).toBe('independent_start');

    expect(resolveFirstWeek(
      player,
      { boss: { trust: 2 } },
    ).id).toBe('conditional_extension');

    expect(resolveFirstWeek(
      player,
      { boss: { trust: 0 } },
    ).id).toBe('debt_deepens');
  });
});
