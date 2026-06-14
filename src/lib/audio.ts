// Tiny Web Audio synthesizer — all sounds generated procedurally, zero assets.
// AudioContext is created lazily on first user gesture (click), per browser policy.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.12
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.005);
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + start + dur
  );
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

function noiseClick(ac: AudioContext, start: number, dur: number, gain = 0.18) {
  const frames = Math.floor(ac.sampleRate * dur);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  src.connect(hp).connect(g).connect(ac.destination);
  src.start(ac.currentTime + start);
}

/** Mechanical floppy-insert: a low thunk + a sharp shutter click. */
export function playInsert() {
  const ac = getCtx();
  if (!ac) return;
  blip(ac, 150, 0, 0.06, "square", 0.14);
  noiseClick(ac, 0.02, 0.05, 0.16);
  blip(ac, 90, 0.05, 0.08, "square", 0.1);
}

/** Short synthesized dial-up modem handshake. */
export function playModem() {
  const ac = getCtx();
  if (!ac) return;
  // dial tone
  blip(ac, 440, 0, 0.18, "sine", 0.08);
  // handshake tone pairs
  blip(ac, 1200, 0.22, 0.16, "square", 0.06);
  blip(ac, 2400, 0.22, 0.16, "square", 0.05);
  blip(ac, 1800, 0.42, 0.14, "square", 0.06);
  noiseClick(ac, 0.58, 0.22, 0.05); // carrier hiss
  blip(ac, 2100, 0.62, 0.2, "sawtooth", 0.05);
  blip(ac, 1500, 0.62, 0.2, "square", 0.04);
}

/** Rising confirmation chirp for "transmission complete". */
export function playComplete() {
  const ac = getCtx();
  if (!ac) return;
  blip(ac, 660, 0, 0.08, "square", 0.1);
  blip(ac, 880, 0.09, 0.08, "square", 0.1);
  blip(ac, 1320, 0.18, 0.14, "square", 0.11);
}
