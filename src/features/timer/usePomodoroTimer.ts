import { useEffect, useReducer } from "react";

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

  useEffect(() => {
    if (state.phase === "idle" || state.isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: "TICK", now: Date.now() });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.phase, state.isPaused]);

  return {
    state,
    start: () => dispatch({ type: "START", now: Date.now() }),
    pause: () => dispatch({ type: "PAUSE", now: Date.now() }),
    resume: () => dispatch({ type: "RESUME", now: Date.now() }),
    skip: () => dispatch({ type: "SKIP", now: Date.now() }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
