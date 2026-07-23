import type { TimerPhase } from "./timerReducer";

interface TimerDisplayProps {
  phase: TimerPhase;
  remainingMs: number;
  totalMs: number;
}

const RING_RADIUS = 132;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case "focus":
      return "Focus";
    case "shortBreak":
      return "Short break";
    case "longBreak":
      return "Long break";
    case "idle":
      return "Ready to focus";
  }
}

function formatRemainingTime(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TimerDisplay({
  phase,
  remainingMs,
  totalMs,
}: TimerDisplayProps) {
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const totalSeconds = Math.max(1, Math.ceil(totalMs / 1000));
  const progress = Math.min(1, remainingSeconds / totalSeconds);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  const isFocus = phase === "idle" || phase === "focus";
  const accentClass = isFocus ? "text-tomato" : "text-gold";

  return (
    <section
      aria-label={`${getPhaseLabel(phase)} timer`}
      className="flex w-full flex-col items-center gap-6"
    >
      <p
        className={`text-sm font-semibold tracking-[0.2em] uppercase ${accentClass}`}
      >
        {getPhaseLabel(phase)}
      </p>

      <div className="relative grid aspect-square w-full max-w-80 place-items-center">
        <svg aria-hidden="true" className="-rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-paper/15"
          />
          <circle
            cx="150"
            cy="150"
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={`${accentClass} transition-[stroke-dashoffset] duration-300`}
          />
        </svg>

        <time
          dateTime={`PT${remainingSeconds}S`}
          className="absolute font-mono text-5xl font-semibold tracking-tight text-paper sm:text-6xl"
        >
          {formatRemainingTime(remainingMs)}
        </time>
      </div>
    </section>
  );
}
