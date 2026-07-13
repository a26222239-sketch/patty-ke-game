import { describe, expect, it } from 'vitest';
import {
  FIRST_WEEK,
  FIRST_WEEK_EVENT_IDS,
  TUTORIAL_STEPS,
  advanceFirstWeekTime,
  applyFirstWeekChoice,
  completeTutorialStep,
  createFirstWeekProgress,
  getFirstWeekObjective,
  getPendingFirstWeekEvent,
  getTutorialStep,
  normalizeFirstWeekPlayer,
  resolveFirstWeek,
} from '../src/progression.js';
import { FIRST_WEEK_TEXTS } from '../texts.js';

describe('第一週半沙盒進度', () => {
  it('建立可存檔的第一週預設進度', () => {
    expect(createFirstWeekProgress()).toEqual({
      chapter: 'first_week',
      phase: 'tutorial',
      deadlineDay: 7,
      targetGold: 1200,
      tutorialStep: 0,
      completedMilestones: [],
      customerVisits: 0,
      shopVisits: 0,
      resolvedEventIds: [],
      pendingEventId: null,
      outcomeId: null,
      resolved: false,
    });
  });

  it('教學必須依既定順序推進，不能跳步', () => {
    const initial = createFirstWeekProgress();
    expect(getTutorialStep(initial)).toEqual(TUTORIAL_STEPS[0]);

    const ignored = completeTutorialStep(initial, 'visit_shop');
    expect(ignored.tutorialStep).toBe(0);

    const advanced = completeTutorialStep(initial, 'meet_first_customer');
    expect(getTutorialStep(advanced)).toEqual(TUTORIAL_STEPS[1]);
  });

  it('舊存檔沒有進度與新關係欄位時能安全補齊', () => {
    const migrated = normalizeFirstWeekPlayer({
      gold: 50,
      relationships: { boss: { trust: 2 } },
    });

    expect(migrated.progress.customerVisits).toBe(0);
    expect(migrated.relationships.shopManager.trust).toBe(2);
    expect(migrated.flags.firstWeekOutcomeSeen).toBe(false);
  });

  it('教學結束前優先顯示目前教學目標', () => {
    const objective = getFirstWeekObjective({
      days: 1,
      gold: 9999,
      progress: {
        ...createFirstWeekProgress(),
        resolvedEventIds: [FIRST_WEEK_EVENT_IDS.opening],
      },
    });

    expect(objective.kind).toBe('tutorial');
    expect(objective.title).toBe('接待第一位客人');
  });

  it('教學結束後顯示房租與期限目標', () => {
    const progress = {
      ...createFirstWeekProgress(),
      tutorialStep: TUTORIAL_STEPS.length,
      phase: 'active',
      resolvedEventIds: [FIRST_WEEK_EVENT_IDS.opening],
    };
    const objective = getFirstWeekObjective({
      days: 3,
      gold: 700,
      progress,
    });

    expect(objective.kind).toBe('weekly_goal');
    expect(objective.remainingGold).toBe(500);
    expect(objective.remainingDays).toBe(4);
  });

  it('依房租與阿坤信任決定三種第一週結果，並接受舊 boss 存檔', () => {
    const player = { gold: 300, progress: createFirstWeekProgress() };

    expect(resolveFirstWeek(
      { ...player, gold: FIRST_WEEK.targetGold },
      { shopManager: { trust: 0 } },
    ).id).toBe('independent_start');

    expect(resolveFirstWeek(
      player,
      { shopManager: { trust: 2 } },
    ).id).toBe('conditional_extension');

    expect(resolveFirstWeek(
      player,
      { boss: { trust: 2 } },
    ).id).toBe('conditional_extension');

    expect(resolveFirstWeek(
      player,
      { shopManager: { trust: 0 } },
    ).id).toBe('debt_deepens');
  });

  it('以固定優先序排入開場、第 3 天與第 7 天結算事件', () => {
    const base = {
      days: 1,
      timeMinutes: 0,
      gold: 0,
      progress: createFirstWeekProgress(),
    };

    expect(getPendingFirstWeekEvent(base).id).toBe(FIRST_WEEK_EVENT_IDS.opening);

    const afterOpening = applyFirstWeekChoice(base, 'opening_customer').player;
    const dayThree = { ...afterOpening, days: 3, timeMinutes: 600 };
    expect(getPendingFirstWeekEvent(dayThree).id).toBe(FIRST_WEEK_EVENT_IDS.dayThree);

    const deadline = advanceFirstWeekTime({
      ...afterOpening,
      days: 7,
      timeMinutes: FIRST_WEEK.settlementMinute - 10,
    }, 10);
    expect(deadline.progress.pendingEventId).toBe(FIRST_WEEK_EVENT_IDS.settlement);
  });

  it('阿坤的工作選擇會回傳可顯示的時間與數值後果', () => {
    const player = {
      days: 3,
      timeMinutes: 600,
      gold: 10,
      progress: {
        ...createFirstWeekProgress(),
        resolvedEventIds: [FIRST_WEEK_EVENT_IDS.opening],
      },
    };

    const result = applyFirstWeekChoice(player, 'day3_help');

    expect(result.timeCost).toBe(90);
    expect(result.player.gold).toBe(70);
    expect(result.player.relationships.shopManager.trust).toBe(1);
    expect(result.effects).toContain('shopManager.trust:+1');
    expect(result.message).toBe(FIRST_WEEK_TEXTS.events.shop_manager_day_three.choices.day3_help.result);
  });

  it('事件與結算文本來自共用文本庫，並代入本局數值', () => {
    const event = getPendingFirstWeekEvent({
      days: 1,
      timeMinutes: 0,
      progress: createFirstWeekProgress(),
    });
    const outcome = resolveFirstWeek(
      { gold: FIRST_WEEK.targetGold, progress: createFirstWeekProgress() },
      { shopManager: { trust: 0 } },
    );

    expect(event.detail).toBe(FIRST_WEEK_TEXTS.events.opening_notice.detail);
    expect(outcome.detail).toContain(`${FIRST_WEEK.targetGold}G`);
  });

  it('結算選項會固定結果並結束第一週', () => {
    const player = {
      days: 7,
      timeMinutes: FIRST_WEEK.settlementMinute,
      gold: FIRST_WEEK.targetGold,
      progress: {
        ...createFirstWeekProgress(),
        pendingEventId: FIRST_WEEK_EVENT_IDS.settlement,
      },
    };

    const result = applyFirstWeekChoice(player, 'settlement_continue');

    expect(result.outcome.id).toBe('independent_start');
    expect(result.player.progress.resolved).toBe(true);
    expect(result.player.progress.outcomeId).toBe('independent_start');
  });
});
