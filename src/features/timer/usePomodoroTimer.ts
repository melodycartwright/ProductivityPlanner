import { useReducer } from "react";

import {
  createInitialTimerState,
  DEFAULT_TIMER_DURATIONS,
  timerReducer,
  type TimerDurations,
} from "./timerReducer";

export function usePomodoroTimer(
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS,
) {
  const [state, dispatch] = useReducer(
    timerReducer,
    durations,
    createInitialTimerState,
  );

  return {
    state,
    start: () => dispatch({ type: "START", now: Date.now() }),
    pause: () => dispatch({ type: "PAUSE", now: Date.now() }),
    resume: () => dispatch({ type: "RESUME", now: Date.now() }),
    skip: () => dispatch({ type: "SKIP", now: Date.now() }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
