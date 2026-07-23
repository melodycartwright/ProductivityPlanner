import { TimerControls } from "../features/timer/TimerControls";
import { TimerDisplay } from "../features/timer/TimerDisplay";
import { usePomodoroTimer } from "../features/timer/usePomodoroTimer";

export default function App() {
  const { state, start, pause, resume, skip, reset } = usePomodoroTimer();

  return (
    <main className="min-h-dvh bg-cover text-paper">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
        <header className="border-b border-gold/30 pb-6">
          <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Productivity Planner
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            One task at a time.
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-10 py-12">
          <TimerDisplay
            phase={state.phase}
            remainingMs={state.remainingMs}
            totalMs={state.totalMs}
          />

          <TimerControls
            phase={state.phase}
            isPaused={state.isPaused}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onSkip={skip}
            onReset={reset}
          />
        </div>

        <footer className="text-center text-sm text-paper/70">
          {state.completedFocusCount} focus sessions completed
        </footer>
      </div>
    </main>
  );
}
