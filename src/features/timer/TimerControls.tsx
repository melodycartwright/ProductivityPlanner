import type { TimerPhase } from "./timerReducer";

interface TimerControlsProps {
  phase: TimerPhase;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function TimerControls({
  phase,
  isPaused,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
}: TimerControlsProps) {
  const isIdle = phase === "idle";

  const primaryLabel = isIdle ? "Start" : isPaused ? "Resume" : "Pause";
  const handlePrimaryAction = isIdle ? onStart : isPaused ? onResume : onPause;

  return (
    <div className="flex w-full max-w-80 flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={handlePrimaryAction}
        className="min-h-12 flex-1 rounded-full bg-tomato px-6 py-3 text-base font-semibold text-paper transition-colors hover:bg-tomato-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {primaryLabel}
      </button>

      {!isIdle && (
        <button
          type="button"
          onClick={isPaused ? onReset : onSkip}
          className="min-h-12 flex-1 rounded-full border border-paper/40 px-6 py-3 text-base font-semibold text-paper transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {isPaused ? "Reset" : "Skip"}
        </button>
      )}
    </div>
  );
}
