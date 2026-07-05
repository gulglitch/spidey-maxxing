/**
 * Synthesized sound effects using Web Audio API
 * These work without any sound files!
 */

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/**
 * THWIP - Web shooting sound
 * Creates a sharp, high-pitched "thwip" using noise and filtering
 */
export const playThwipSynth = (volume: number = 0.3): void => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create noise buffer for that "airy" thwip sound
  const bufferSize = ctx.sampleRate * 0.1; // 100ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Generate white noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // High-pass filter for that sharp "thwip" quality
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, now);
  filter.Q.setValueAtTime(5, now);

  // Envelope for quick attack and decay
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Quick attack
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Fast decay

  // Connect nodes
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play
  noise.start(now);
  noise.stop(now + 0.15);
};

/**
 * IMPACT - Web hitting surface
 * Creates a punchy impact sound with low frequency thump
 */
export const playImpactSynth = (volume: number = 0.4): void => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Oscillator for low frequency thump
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

  // Noise for impact texture
  const bufferSize = ctx.sampleRate * 0.2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Filter for noise
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, now);

  // Gain envelope
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

  // Connect
  osc.connect(gainNode);
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play
  osc.start(now);
  osc.stop(now + 0.25);
  noise.start(now);
  noise.stop(now + 0.25);
};

/**
 * SWING - Whoosh sound for swinging
 * Creates a doppler-effect whoosh
 */
export const playSwingSynth = (volume: number = 0.25): void => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Pink noise for wind/whoosh effect
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Band-pass filter with modulation
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.4);
  filter.Q.setValueAtTime(3, now);

  // Envelope
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

  // Connect
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play
  noise.start(now);
  noise.stop(now + 0.4);
};

/**
 * PULL - Magnetic/tension sound
 * Creates a rising pitch with vibrato
 */
export const playPullSynth = (volume: number = 0.3): void => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Oscillator for pull tone
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(100, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);

  // LFO for vibrato
  const lfo = ctx.createOscillator();
  lfo.frequency.setValueAtTime(8, now);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(10, now);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Filter for character
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(5, now);

  // Envelope
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
  gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.2);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

  // Connect
  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play
  lfo.start(now);
  osc.start(now);
  lfo.stop(now + 0.35);
  osc.stop(now + 0.35);
};

/**
 * AMBIENT - Subtle background hum (optional)
 */
export const playAmbientHum = (volume: number = 0.05): (() => void) => {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, now);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume, now);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);

  // Return stop function
  return () => {
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  };
};
