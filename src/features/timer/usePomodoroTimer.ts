import { useEffect, useReducer, useRef } from "react";

import {
  createInitialTimerState,
  DEFAULT_TIMER_DURATIONS,
  timerReducer,
  type TimerDurations,
  type TimerPhase,
} from "./timerReducer";

type ActiveTimerPhase = Exclude<TimerPhase, "idle">;

type PhaseChangeHandler = (phase: ActiveTimerPhase) => void;

export function usePomodoroTimer(
  durations: TimerDurations = DEFAULT_TIMER_DURATIONS,
  onPhaseChange?: PhaseChangeHandler,
) {
  const [state, dispatch] = useReducer(
    timerReducer,
    durations,
    createInitialTimerState,
  );
  const previousPhaseRef = useRef(state.phase);
  const onPhaseChangeRef = useRef(onPhaseChange);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  useEffect(() => {
    const previousPhase = previousPhaseRef.current;
    previousPhaseRef.current = state.phase;

    if (previousPhase === "idle" || state.phase === "idle") {
      return;
    }

    if (previousPhase !== state.phase) {
      onPhaseChangeRef.current?.(state.phase);
    }
  }, [state.phase]);

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
