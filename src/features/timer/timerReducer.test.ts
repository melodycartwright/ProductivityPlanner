import { describe, expect, it } from "vitest";

import {
  createInitialTimerState,
  DEFAULT_TIMER_DURATIONS,
  timerReducer,
} from "./timerReducer";

describe("timerReducer", () => {
  it("starts a focus session from idle", () => {
    const state = createInitialTimerState();

    const nextState = timerReducer(state, { type: "START", now: 1_000 });

    expect(nextState.phase).toBe("focus");
    expect(nextState.isPaused).toBe(false);
    expect(nextState.remainingMs).toBe(DEFAULT_TIMER_DURATIONS.focusMs);
    expect(nextState.endTimestamp).toBe(
      1_000 + DEFAULT_TIMER_DURATIONS.focusMs,
    );
  });

  it("preserves remaining time when paused and resumed later", () => {
    const startedState = timerReducer(createInitialTimerState(), {
      type: "START",
      now: 100_000,
    });

    const pausedState = timerReducer(startedState, {
      type: "PAUSE",
      now: 160_000,
    });

    const resumedState = timerReducer(pausedState, {
      type: "RESUME",
      now: 220_000,
    });

    expect(pausedState.remainingMs).toBe(
      DEFAULT_TIMER_DURATIONS.focusMs - 60_000,
    );
    expect(resumedState.endTimestamp).toBe(
      220_000 + DEFAULT_TIMER_DURATIONS.focusMs - 60_000,
    );
  });
});
it("updates remaining time from the absolute end timestamp", () => {
  const startedState = timerReducer(createInitialTimerState(), {
    type: "START",
    now: 10_000,
  });

  const tickedState = timerReducer(startedState, {
    type: "TICK",
    now: 70_000,
  });

  expect(tickedState.remainingMs).toBe(
    DEFAULT_TIMER_DURATIONS.focusMs - 60_000,
  );
  expect(tickedState.endTimestamp).toBe(startedState.endTimestamp);
});
it("transitions from focus to short break when the timer reaches zero", () => {
  const startedState = timerReducer(createInitialTimerState(), {
    type: "START",
    now: 5_000,
  });

  const nextState = timerReducer(startedState, {
    type: "TICK",
    now: startedState.endTimestamp!,
  });

  expect(nextState.phase).toBe("shortBreak");
  expect(nextState.completedFocusCount).toBe(1);
  expect(nextState.remainingMs).toBe(DEFAULT_TIMER_DURATIONS.shortBreakMs);
  expect(nextState.endTimestamp).toBe(
    startedState.endTimestamp! + DEFAULT_TIMER_DURATIONS.shortBreakMs,
  );
});
it("transitions from focus to long break every fourth completed focus session", () => {
  const focusState = {
    ...timerReducer(createInitialTimerState(), { type: "START", now: 2_000 }),
    completedFocusCount: 3,
  };

  const nextState = timerReducer(focusState, {
    type: "TICK",
    now: focusState.endTimestamp!,
  });

  expect(nextState.phase).toBe("longBreak");
  expect(nextState.completedFocusCount).toBe(4);
  expect(nextState.remainingMs).toBe(DEFAULT_TIMER_DURATIONS.longBreakMs);
});
