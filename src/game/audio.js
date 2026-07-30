export function createAudioFeedback(audioHandle) {
  function tone(frequency, duration = 0.08, volume = 0.055) {
    const context = audioHandle?.context;
    if (!context || context.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  return {
    sent() {
      tone(420, 0.07);
      window.setTimeout(() => tone(620, 0.06, 0.04), 50);
    },
    reply() {
      tone(680, 0.1, 0.045);
      window.setTimeout(() => tone(920, 0.13, 0.035), 80);
    },
  };
}
