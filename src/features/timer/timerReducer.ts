export const DEFAULT_TIMER_DURATIONS = {
  focusMs: 25 * 60 * 1000,
  shortBreakMs: 5 * 60 * 1000,
  longBreakMs: 15 * 60 * 1000,
  longBreakInterval: 4,
} as const;

export type TimerPhase = "idle" | "focus" | "shortBreak" | "longBreak";

export type TimerDurations = typeof DEFAULT_TIMER_DURATIONS;

export interface TimerState {
  phase: TimerPhase;
  isPaused: boolean;
  completedFocusCount: number;
  endTimestamp: number | null;
  remainingMs: number;
  totalMs: number;
  durations: TimerDurations;
}
export type TimerAction =
  | { type: "START"; now: number }
  | { type: "PAUSE"; now: number }
  | { type: "RESUME"; now: number }
  | { type: "SKIP"; now: number }
  | { type: "RESET" }
  | { type: "TICK"; now: number };

export function createInitialTimerState(
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS,
): TimerState {
  return {
    phase: "idle",
    isPaused: false,
    completedFocusCount: 0,
    endTimestamp: null,
    remainingMs: durations.focusMs,
    totalMs: durations.focusMs,
    durations,
  };
}
export function timerReducer(
  state: TimerState,
  action: TimerAction,
): TimerState {
  switch (action.type) {
    case "START":
      if (state.phase !== "idle") {
        return state;
      }

      return {
        ...state,
        phase: "focus",
        isPaused: false,
        endTimestamp: action.now + state.durations.focusMs,
        remainingMs: state.durations.focusMs,
        totalMs: state.durations.focusMs,
      };

    case "PAUSE":
      if (
        state.phase === "idle" ||
        state.isPaused ||
        state.endTimestamp === null
      ) {
        return state;
      }

      return {
        ...state,
        isPaused: true,
        endTimestamp: null,
        remainingMs: Math.max(state.endTimestamp - action.now, 0),
      };

    case "RESET":
      return createInitialTimerState(state.durations);

    case "RESUME":
      if (state.phase === "idle" || !state.isPaused) {
        return state;
      }

      return {
        ...state,
        isPaused: false,
        endTimestamp: action.now + state.remainingMs,
      };
    case "TICK":
      if (
        state.phase === "idle" ||
        state.isPaused ||
        state.endTimestamp === null
      ) {
        return state;
      }

      if (action.now >= state.endTimestamp) {
        if (state.phase === "focus") {
          const nextCompletedFocusCount = state.completedFocusCount + 1;
          const nextPhase =
            nextCompletedFocusCount % state.durations.longBreakInterval === 0
              ? "longBreak"
              : "shortBreak";

          const nextDuration =
            nextPhase === "longBreak"
              ? state.durations.longBreakMs
              : state.durations.shortBreakMs;

          return {
            ...state,
            phase: nextPhase,
            completedFocusCount: nextCompletedFocusCount,
            endTimestamp: action.now + nextDuration,
            remainingMs: nextDuration,
            totalMs: nextDuration,
            isPaused: false,
          };
        }

        return {
          ...state,
          phase: "focus",
          endTimestamp: action.now + state.durations.focusMs,
          remainingMs: state.durations.focusMs,
          totalMs: state.durations.focusMs,
          isPaused: false,
        };
      }

      return {
        ...state,
        remainingMs: Math.max(state.endTimestamp - action.now, 0),
      };

    case "SKIP":
      if (state.phase === "idle") {
        return state;
      }

      if (state.phase === "focus") {
        return {
          ...state,
          phase: "shortBreak",
          endTimestamp: action.now + state.durations.shortBreakMs,
          remainingMs: state.durations.shortBreakMs,
          totalMs: state.durations.shortBreakMs,
          isPaused: false,
        };
      }

      return {
        ...state,
        phase: "focus",
        endTimestamp: action.now + state.durations.focusMs,
        remainingMs: state.durations.focusMs,
        totalMs: state.durations.focusMs,
        isPaused: false,
      };
  }
}
