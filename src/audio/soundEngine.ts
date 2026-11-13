import type { DisasterId, GameSettings } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private lastHoverAt = 0;
  private settings: GameSettings = {
    calmMode: false,
    muted: false,
    volume: 0.6,
  };

  public updateSettings(settings: GameSettings): void {
    this.settings = { ...settings };
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.settings.muted || this.settings.volume <= 0.001) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private effectiveGain(base: number): number {
    const calmFactor = this.settings.calmMode ? 0.38 : 1.0;
    return Math.max(0, Math.min(1, base * this.settings.volume * calmFactor));
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    gainLevel: number,
    delaySec = 0,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const safeType: OscillatorType =
      this.settings.calmMode && (type === 'sawtooth' || type === 'square') ? 'sine' : type;

    const gainVal = this.effectiveGain(gainLevel);
    if (gainVal <= 0.001) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = safeType;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + Math.min(0.025, durationSec * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.03);
  }

  private playNoiseBurst(
    durationSec: number,
    filterFreq: number,
    gainLevel: number,
    delaySec = 0,
    filterType: BiquadFilterType = 'lowpass'
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const gainVal = this.effectiveGain(gainLevel);
    if (gainVal <= 0.001) return;

    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = this.settings.calmMode ? Math.min(filterFreq, 380) : filterFreq;

    const now = ctx.currentTime + delaySec;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + Math.min(0.04, durationSec * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + durationSec + 0.02);
  }

  // Interaction feedback
  public playHover(): void {
    const now = performance.now();
    if (now - this.lastHoverAt < 70) return;
    this.lastHoverAt = now;
    this.playTone(540, 0.035, 'sine', 0.045, 0, 620);
  }

  public playSelect(): void {
    this.playTone(460, 0.075, 'sine', 0.16, 0, 560);
  }

  // Character movement foley
  public playFootstep(running = false): void {
    if (running) {
      this.playTone(155 + Math.random() * 30, 0.055, 'triangle', 0.1, 0, 82);
      this.playNoiseBurst(0.04, 450, 0.045, 0);
    } else {
      this.playTone(125 + Math.random() * 20, 0.06, 'triangle', 0.075, 0, 74);
    }
  }

  public playJump(): void {
    this.playTone(220, 0.14, 'sine', 0.11, 0, 390);
  }

  public playLand(): void {
    this.playTone(115, 0.09, 'triangle', 0.12, 0, 58);
    this.playNoiseBurst(0.07, 280, 0.06, 0);
  }

  // Cinematic freeze & blur focus cue
  public playDecisionFreeze(): void {
    if (this.settings.calmMode) {
      this.playTone(293.66, 0.28, 'sine', 0.1, 0, 329.63);
      return;
    }
    this.playTone(320, 0.28, 'sine', 0.13, 0, 190);
    this.playNoiseBurst(0.24, 340, 0.09, 0.02, 'bandpass');
  }

  public playCountdownTick(urgent: boolean): void {
    if (this.settings.calmMode) return;
    this.playTone(urgent ? 880 : 620, 0.045, 'triangle', urgent ? 0.11 : 0.05, 0);
  }

  public playStageTransition(): void {
    this.playNoiseBurst(0.45, 360, 0.07, 0, 'bandpass');
    this.playTone(260, 0.3, 'sine', 0.06, 0.04, 340);
  }

  // Disaster ambient & event cues
  public playDisasterIntro(disasterId: DisasterId): void {
    if (this.settings.calmMode) {
      this.playTone(329.63, 0.35, 'sine', 0.11, 0, 392);
      return;
    }

    if (disasterId === 'earthquake') {
      this.playNoiseBurst(0.75, 160, 0.34, 0);
      this.playTone(68, 0.65, 'sawtooth', 0.14, 0, 46);
      this.playNoiseBurst(0.35, 320, 0.12, 0.38);
    } else if (disasterId === 'flood') {
      this.playNoiseBurst(0.85, 520, 0.24, 0);
      this.playTone(210, 0.45, 'sine', 0.11, 0.1, 175);
    } else {
      // Fire alarm double pulse + crackle
      this.playTone(740, 0.13, 'triangle', 0.14, 0);
      this.playTone(740, 0.13, 'triangle', 0.14, 0.22);
      this.playNoiseBurst(0.5, 820, 0.13, 0.06, 'bandpass');
    }
  }

  public playEnvironmentalTick(disasterId: DisasterId): void {
    if (this.settings.calmMode) return;
    if (disasterId === 'earthquake') {
      this.playNoiseBurst(0.25, 140, 0.12, 0);
    } else if (disasterId === 'flood') {
      this.playNoiseBurst(0.32, 460, 0.08, 0);
    } else {
      this.playNoiseBurst(0.18, 980, 0.065, 0, 'bandpass');
    }
  }

  public playHazardConsequence(failureHazard: string): void {
    if (this.settings.calmMode) {
      this.playTone(246.94, 0.35, 'sine', 0.12, 0, 174.61);
      return;
    }

    switch (failureHazard) {
      case 'shattering_glass':
        this.playNoiseBurst(0.22, 3400, 0.24, 0.15, 'highpass');
        this.playTone(1600, 0.09, 'triangle', 0.12, 0.18, 900);
        this.playTone(1240, 0.11, 'triangle', 0.1, 0.25, 680);
        break;
      case 'electric_arc':
      case 'lightning_strike':
        this.playNoiseBurst(0.18, 2200, 0.24, 0.12, 'bandpass');
        this.playTone(540, 0.16, 'sawtooth', 0.14, 0.12, 180);
        break;
      case 'swept_water':
      case 'submerged_room':
        this.playNoiseBurst(0.65, 420, 0.28, 0.08);
        this.playTone(140, 0.4, 'sine', 0.16, 0.15, 72);
        break;
      case 'smoke_blast':
      case 'flame_flare':
        this.playNoiseBurst(0.55, 640, 0.28, 0.1);
        this.playTone(190, 0.3, 'sawtooth', 0.13, 0.12, 95);
        break;
      case 'falling_debris':
      case 'toppling_shelf':
      case 'balcony_fall':
        this.playNoiseBurst(0.35, 220, 0.3, 0.18);
        this.playTone(110, 0.25, 'triangle', 0.2, 0.2, 48);
        break;
      default:
        this.playNoiseBurst(0.3, 280, 0.22, 0.1);
    }
  }

  public playCorrect(): void {
    this.playTone(523.25, 0.14, 'sine', 0.19, 0);
    this.playTone(659.25, 0.18, 'sine', 0.19, 0.09);
    this.playTone(783.99, 0.28, 'sine', 0.18, 0.18);
  }

  public playIncorrect(): void {
    if (this.settings.calmMode) {
      this.playTone(293.66, 0.28, 'sine', 0.13, 0, 220);
      return;
    }
    this.playTone(240, 0.2, 'sawtooth', 0.17, 0, 145);
    this.playTone(165, 0.34, 'sawtooth', 0.18, 0.14, 82);
    this.playNoiseBurst(0.24, 240, 0.19, 0.1);
  }

  public playGameOver(): void {
    if (this.settings.calmMode) {
      this.playTone(220, 0.45, 'sine', 0.1, 0, 174.61);
      return;
    }
    this.playTone(196, 0.32, 'triangle', 0.15, 0, 146.83);
    this.playTone(146.83, 0.5, 'sine', 0.16, 0.22, 110);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.26, 'sine', 0.19, idx * 0.11);
    });
  }
}

export const soundEngine = new SoundEngine();
