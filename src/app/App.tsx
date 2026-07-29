import { useState } from "react";

import {
  notifyPhaseChange,
  requestNotificationPermission,
  type NotificationPhase,
} from "../shared/lib/notifications";
import { TimerControls } from "../features/timer/TimerControls";
import { TimerDisplay } from "../features/timer/TimerDisplay";
import { usePomodoroTimer } from "../features/timer/usePomodoroTimer";
import { playPhaseChangeChime } from "@/shared/lib/sound";

export default function App() {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [inAppAlert, setInAppAlert] = useState<string | null>(null);
  function handlePhaseChange(phase: NotificationPhase) {
    const message =
      phase === "focus" ? "Focus session started." : "Time for a break.";

    playPhaseChangeChime();

    if (!notifyPhaseChange(phase)) {
      setInAppAlert(message);
    }
  }
  const { state, start, pause, resume, skip, reset } = usePomodoroTimer(
    undefined,
    handlePhaseChange,
  );
  async function handleEnableAlerts() {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      setInAppAlert(null);
    }
  }

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
        {inAppAlert ? (
          <div
            role="status"
            className="mt-6 rounded border border-gold/60 bg-paper px-4 py-3 text-center text-sm font-medium text-ink"
          >
            {inAppAlert}
          </div>
        ) : null}
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

        <footer className="flex flex-col items-center gap-3 text-center text-sm text-paper/70">
          <p>{state.completedFocusCount} focus sessions completed</p>

          {notificationPermission === "default" ? (
            <button
              type="button"
              onClick={handleEnableAlerts}
              className="min-h-11 rounded border border-gold/60 px-4 font-medium text-gold transition-colors hover:bg-gold hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Enable alerts
            </button>
          ) : notificationPermission === "granted" ? (
            <p>Alerts enabled</p>
          ) : (
            <p>Alerts are off. You’ll still see in-app updates.</p>
          )}
        </footer>
      </div>
    </main>
  );
}
