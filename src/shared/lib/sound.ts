const CHIME_VOLUME = 0.06;
const TONE_DURATION_SECONDS = 0.22;
const FADE_DURATION_SECONDS = 0.02;

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const endTime = startTime + TONE_DURATION_SECONDS;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(
    CHIME_VOLUME,
    startTime + FADE_DURATION_SECONDS,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    endTime - FADE_DURATION_SECONDS,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime);
}

export function playPhaseChangeChime(): void {
  if (!("AudioContext" in window)) {
    return;
  }

  const context = new AudioContext();
  const now = context.currentTime;

  playTone(context, 523.25, now);
  playTone(context, 659.25, now + 0.28);

  window.setTimeout(() => {
    void context.close();
  }, 800);
}
