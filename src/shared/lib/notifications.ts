export type NotificationPhase = "focus" | "shortBreak" | "longBreak";

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }

  return Notification.requestPermission();
}

export function notifyPhaseChange(phase: NotificationPhase): boolean {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return false;
  }

  const message =
    phase === "focus" ? "Focus session started." : "Time for a break.";

  new Notification("Productivity Planner", { body: message });

  return true;
}
