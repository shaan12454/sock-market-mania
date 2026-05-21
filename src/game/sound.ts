let ctx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

export function playBeep(freq = 440, duration = 80) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.frequency.value = freq;
  osc.type = "square";
  gain.gain.setValueAtTime(0.06, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration / 1000);
  osc.start();
  osc.stop(c.currentTime + duration / 1000);
}

export const SFX = {
  click: () => playBeep(440, 50),
  success: () => { playBeep(660, 100); setTimeout(() => playBeep(880, 100), 110); },
  error: () => playBeep(180, 200),
  event: () => { playBeep(880, 80); setTimeout(() => playBeep(660, 80), 90); setTimeout(() => playBeep(550, 200), 180); },
  trade: () => { playBeep(550, 60); setTimeout(() => playBeep(770, 80), 70); },
};
