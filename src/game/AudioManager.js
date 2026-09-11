// ==========================================================================
// AUDIO MANAGER - High-Performance Procedural Web Audio Synthesizer
// Zero external file dependencies - plays instantly and reliably!
// ==========================================================================

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.ambienceGain = null;
    this.isAmbiencePlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Subtle background cinematic drone
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.ambienceGain.connect(this.masterGain);
    this.startAmbience();
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  startAmbience() {
    if (!this.ctx || this.isAmbiencePlaying) return;
    this.isAmbiencePlaying = true;

    // Rhythmic low synth pulse
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(this.ambienceGain);
    osc.start();
  }

  // --- SOUND EFFECTS ---

  // Spider-Man Web Shoot: "THWIP!"
  playThwip() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // White noise burst for air compression
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, t + 0.14);
    noiseFilter.Q.setValueAtTime(4, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);

    // High pitch snap osc
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.12);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Web Reel / Pull Sound
  playWebPull() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.6);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.7);
  }

  // Green Goblin Laugh / Cackle
  playGoblinLaugh() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const notes = [450, 520, 480, 560, 420, 360];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, startTime + 0.07);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    });
  }

  // Glider Thruster Roar
  playGliderRoar(duration = 1.8) {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(330, t + duration * 0.4);
    osc.frequency.exponentialRampToValueAtTime(90, t + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(300, t + duration);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Dice Tumble Click
  playDiceClick() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300 + Math.random() * 200, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Player Footstep Tap
  playFootstep() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + Math.random() * 30, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Bonus Roll Chime
  playBonusChime() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // Dramatic Suspense Thump (when landing on 100)
  playSuspenseHeartbeat() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    [0, 0.25].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + offset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, st);
      osc.frequency.exponentialRampToValueAtTime(35, st + 0.18);

      gain.gain.setValueAtTime(0.7, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + 0.22);
    });
  }

  // Victory Fanfare
  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;
    // Heroic fanfare notes
    const fanfare = [
      { f: 523.25, d: 0.15, s: 0 },
      { f: 523.25, d: 0.15, s: 0.18 },
      { f: 523.25, d: 0.15, s: 0.36 },
      { f: 659.25, d: 0.4, s: 0.54 },
      { f: 587.33, d: 0.2, s: 0.98 },
      { f: 659.25, d: 0.2, s: 1.20 },
      { f: 783.99, d: 0.8, s: 1.42 }
    ];

    fanfare.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + note.s;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, st);

      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + note.d + 0.05);
    });
  }

  // Defeat / Elimination Gong
  playDefeatGong() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 2.0);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 2.3);
  }

  // Spider-Man catches MJ with both arms: Warm, charming heroic chime
  playHeroicCatch() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // Sweet heroic arpeggiated chime
    const chords = [
      { f: 523.25, s: 0, d: 0.35 },    // C5
      { f: 659.25, s: 0.08, d: 0.35 }, // E5
      { f: 783.99, s: 0.16, d: 0.4 },  // G5
      { f: 1046.5, s: 0.24, d: 0.6 }   // C6
    ];

    chords.forEach(c => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + c.s;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, st);

      gain.gain.setValueAtTime(0.4, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + c.d);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(st);
      osc.stop(st + c.d + 0.05);
    });
  }

  // Dr. Octopus Mechanical Emergence: Heavy hydraulic servo hiss & metallic clamp
  playDocOckEmergence() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // 1. Heavy low metallic thud
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.8);

    subGain.gain.setValueAtTime(0.7, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(220, t);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(t);
    subOsc.stop(t + 0.9);

    // 2. High metallic servo whir
    const servoOsc = this.ctx.createOscillator();
    const servoGain = this.ctx.createGain();
    servoOsc.type = 'sawtooth';
    servoOsc.frequency.setValueAtTime(680, t + 0.1);
    servoOsc.frequency.exponentialRampToValueAtTime(1250, t + 0.4);
    servoOsc.frequency.exponentialRampToValueAtTime(450, t + 0.8);

    servoGain.gain.setValueAtTime(0.01, t);
    servoGain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    servoGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    const servoFilter = this.ctx.createBiquadFilter();
    servoFilter.type = 'bandpass';
    servoFilter.frequency.setValueAtTime(900, t);
    servoFilter.Q.setValueAtTime(5, t);

    servoOsc.connect(servoFilter);
    servoFilter.connect(servoGain);
    servoGain.connect(this.masterGain);
    servoOsc.start(t + 0.1);
    servoOsc.stop(t + 0.9);
  }

  // Dr. Octopus "JUST LIKE I PLANNED" sinister chord sting
  playDocOckVoiceChime() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // Dark sinister minor chords: D minor / Bb major villainous progression
    const darkChords = [146.83, 174.61, 220.0, 293.66]; // D3, F3, A3, D4

    darkChords.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 2.5);
    });
  }

  // Gentle resonant water droplet plop
  playWaterDrop() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 + Math.random() * 120, t);
    osc.frequency.exponentialRampToValueAtTime(880 + Math.random() * 200, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Soft organic foliage wind rustle
  playRustle() {
    if (this.isMuted) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }
}

