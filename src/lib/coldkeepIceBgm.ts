/**
 * ColdKeep BGM — 冬の癒し Lo-Fi Piano
 *
 * Inspired by: 「静かな夜に聴く、冬の癒し曲【作業用BGM】」(fjjrO1ppGxU)
 *
 * Sound design:
 *  - 78 BPM, swing 8th-note drum pattern (kick / snare / hi-hat)
 *  - Jazz chord loop: Cm9 → AbM9 → Fm9 → Gm7
 *  - 3 layers: bass, chord voicing (arpeggiated), rubato melody
 *  - Muffled lo-fi piano (triangle + sine, per-note 1100 Hz lowpass)
 *  - Vinyl crackle + tape hiss
 *  - Warm room reverb (1.8 s tail)
 *  - Independent sub-graph → ctx.destination (bypasses site-wide 1050 Hz lowpass)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type BgmState = {
    isPlaying: boolean;
    ctx: AudioContext | null;
    masterGain: GainNode | null;
    dryBus: GainNode | null;
    wetBus: GainNode | null;
    noiseSource: AudioBufferSourceNode | null;
    phraseTimer: number | null;
    drumTimer: number | null;
    chordStep: number;
    barStep: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BPM     = 74;
const BEAT_S  = 60 / BPM;          // ≈ 0.769 s
const BAR_S   = BEAT_S * 4;        // ≈ 3.077 s
const PHRASE_S = BAR_S * 2;        // ≈ 6.154 s  (each chord = 2 bars)

// Swing: off-beat lands at 64 % of a beat (≈ 0.49 s after on-beat at 78 BPM)
const SWING = BEAT_S * 0.64;

/**
 * Chord progression: Cm9 → AbM9 → Fm9 → Gm7
 * bass:    MIDI (C2/Ab1/F2/G2)
 * voicing: open 3-note chord (C3–D4 register)
 * melody:  4 notes across 2 bars (C4–F4 register, rubato)
 */
const CHORDS = [
    { bass: [36, 43, 39], voicing: [55, 58, 62, 65], melody: [64, 67, 70, 67], glint: [79, 77] },
    { bass: [32, 39, 36], voicing: [51, 55, 58, 62], melody: [63, 60, 58, 60], glint: [75, 74] },
    { bass: [41, 48, 44], voicing: [53, 56, 60, 63], melody: [65, 68, 67, 63], glint: [80, 79] },
    { bass: [43, 50, 46], voicing: [53, 57, 60, 65], melody: [67, 65, 62, 60], glint: [77, 75] },
    { bass: [39, 46, 43], voicing: [55, 58, 62, 67], melody: [70, 72, 75, 72], glint: [82, 79] },
    { bass: [34, 41, 38], voicing: [53, 57, 62, 65], melody: [68, 67, 65, 62], glint: [80, 77] },
    { bass: [37, 44, 41], voicing: [52, 56, 59, 63], melody: [64, 63, 59, 61], glint: [76, 75] },
    { bass: [43, 47, 50], voicing: [50, 53, 58, 62], melody: [65, 63, 62, 60], glint: [74, 72] },
] as const;

// ─── State ────────────────────────────────────────────────────────────────────

const state: BgmState = {
    isPlaying: false,
    ctx: null,
    masterGain: null,
    dryBus: null,
    wetBus: null,
    noiseSource: null,
    phraseTimer: null,
    drumTimer: null,
    chordStep: 0,
    barStep: 0,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rand  = (a: number, b: number) => a + Math.random() * (b - a);
const m2f   = (midi: number)          => 440 * Math.pow(2, (midi - 69) / 12);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const noiseBuffer = (ctx: AudioContext, dur: number): AudioBuffer => {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
};

// ─── Drum Synthesis ───────────────────────────────────────────────────────────

/** Lo-fi kick: sine wave with fast pitch drop (140 Hz → 50 Hz) */
const playKick = (ctx: AudioContext, destination: AudioNode, startAt: number) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, startAt);
    osc.frequency.exponentialRampToValueAtTime(50, startAt + 0.07);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.40, startAt + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.24);

    osc.connect(gain);
    gain.connect(destination);
    osc.start(startAt);
    osc.stop(startAt + 0.28);
};

/** Lo-fi snare: noise burst (hp @ 900 Hz) + short body tone */
const playSnare = (
    ctx: AudioContext,
    dryDest: AudioNode,
    wetDest: AudioNode | null,
    startAt: number,
) => {
    // Noise body
    const src  = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.15);

    const hp   = ctx.createBiquadFilter();
    hp.type    = 'highpass';
    hp.frequency.value = 900;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.20, startAt + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.13);

    src.connect(hp); hp.connect(gain); gain.connect(dryDest);
    if (wetDest) {
        const wg = ctx.createGain(); wg.gain.value = 0.28;
        gain.connect(wg); wg.connect(wetDest);
    }
    src.start(startAt); src.stop(startAt + 0.16);

    // Tone body (crack/thump feel)
    const osc  = ctx.createOscillator();
    const og   = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 220;
    og.gain.setValueAtTime(0.0001, startAt);
    og.gain.exponentialRampToValueAtTime(0.10, startAt + 0.002);
    og.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.055);
    osc.connect(og); og.connect(dryDest);
    osc.start(startAt); osc.stop(startAt + 0.08);
};

/** Lo-fi hi-hat: highpass-filtered noise (hp @ 6000 Hz), closed or open */
const playHihat = (
    ctx: AudioContext,
    destination: AudioNode,
    startAt: number,
    open: boolean,
) => {
    const dur  = open ? rand(0.10, 0.16) : rand(0.03, 0.05);
    const vol  = open ? rand(0.060, 0.080) : rand(0.042, 0.062);

    const src  = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, dur + 0.02);

    const hp   = ctx.createBiquadFilter();
    hp.type    = 'highpass';
    hp.frequency.value = 6200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(vol, startAt + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + dur);

    src.connect(hp); hp.connect(gain); gain.connect(destination);
    src.start(startAt); src.stop(startAt + dur + 0.02);
};

// ─── Lo-Fi Piano Voice ────────────────────────────────────────────────────────

/**
 * Muffled piano: triangle (body) + sine (octave), per-note lowpass,
 * piano ADSR with filter that closes during decay.
 */
const playPianoNote = (
    ctx: AudioContext,
    destination: AudioNode,
    midi: number,
    startAt: number,
    duration: number,
    volume: number,
    warmthHz = 1100,
) => {
    const freq = m2f(midi);

    const osc1   = ctx.createOscillator();
    const osc2   = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const g1     = ctx.createGain();
    const g2     = ctx.createGain();
    const env    = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startAt);
    osc2.frequency.setValueAtTime(freq * 2.004, startAt); // slightly sharp octave

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(warmthHz, startAt);
    filter.frequency.exponentialRampToValueAtTime(
        clamp(warmthHz * 0.28, 80, warmthHz),
        startAt + duration * 0.65,
    );
    filter.Q.value = 0.55;

    const atk = 0.04;
    const dcy = 0.38;
    const sus = volume * 0.22;
    const rel = 0.5;

    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.exponentialRampToValueAtTime(volume, startAt + atk);
    env.gain.exponentialRampToValueAtTime(sus, startAt + atk + dcy);
    env.gain.setValueAtTime(sus, startAt + Math.max(duration - rel, atk + dcy + 0.01));
    env.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    g1.gain.value = 0.72;
    g2.gain.value = 0.20;

    osc1.connect(g1); g1.connect(filter);
    osc2.connect(g2); g2.connect(filter);
    filter.connect(env);
    env.connect(destination);

    const stopAt = startAt + duration + 0.12;
    osc1.start(startAt); osc2.start(startAt);
    osc1.stop(stopAt);   osc2.stop(stopAt);
};

const playIceBell = (
    ctx: AudioContext,
    destination: AudioNode,
    midi: number,
    startAt: number,
    duration: number,
    volume: number,
) => {
    const freq = m2f(midi);
    const carrier = ctx.createOscillator();
    const shimmer = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const carrierGain = ctx.createGain();
    const shimmerGain = ctx.createGain();
    const env = ctx.createGain();

    carrier.type = 'sine';
    shimmer.type = 'triangle';
    carrier.frequency.setValueAtTime(freq, startAt);
    shimmer.frequency.setValueAtTime(freq * 2.01, startAt);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(clamp(freq * 2.6, 900, 4800), startAt);
    filter.frequency.exponentialRampToValueAtTime(clamp(freq * 1.3, 500, 3200), startAt + duration);
    filter.Q.value = 2.4;

    env.gain.setValueAtTime(0.0001, startAt);
    env.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
    env.gain.exponentialRampToValueAtTime(volume * 0.18, startAt + duration * 0.42);
    env.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    carrierGain.gain.value = 0.76;
    shimmerGain.gain.value = 0.18;

    carrier.connect(carrierGain); carrierGain.connect(filter);
    shimmer.connect(shimmerGain); shimmerGain.connect(filter);
    filter.connect(env);
    env.connect(destination);

    carrier.start(startAt); shimmer.start(startAt);
    carrier.stop(startAt + duration + 0.08);
    shimmer.stop(startAt + duration + 0.08);
};

// ─── Drum Scheduler ───────────────────────────────────────────────────────────

/**
 * One-bar drum pattern (swing 8ths):
 *
 *   Beat:   1    swg  2    swg  3    swg  4    swg
 *   Kick:   K              K
 *   Snare:       S              S
 *   Hat:    ch   ch   ch   oh   ch   ch   ch   oh
 *
 *   ch = closed hi-hat, oh = open hi-hat
 *   Occasional ghost notes / dropped hats for human feel
 */
const scheduleDrums = (barStart: number) => {
    if (!state.isPlaying || !state.ctx || !state.dryBus) return;

    const ctx = state.ctx;
    const dry = state.dryBus;
    const wet = state.wetBus;

    // Slight per-bar timing drift for human feel (±6 ms)
    const drift = rand(-0.006, 0.006);

    type HitDef = { t: number; type: 'kick' | 'snare' | 'hat'; open?: boolean };

    const pattern: HitDef[] = [
        { t: 0,                 type: 'kick'  },
        { t: 0,                 type: 'hat',  open: false },
        { t: SWING,             type: 'hat',  open: false },
        { t: BEAT_S,            type: 'snare' },
        { t: BEAT_S,            type: 'hat',  open: false },
        { t: BEAT_S + SWING,    type: 'hat',  open: true  },
        { t: BEAT_S * 2 + SWING,type: 'kick'  },
        { t: BEAT_S * 2,        type: 'hat',  open: false },
        { t: BEAT_S * 2 + SWING,type: 'hat',  open: false },
        { t: BEAT_S * 3,        type: 'snare' },
        { t: BEAT_S * 3,        type: 'hat',  open: false },
        { t: BEAT_S * 3 + SWING,type: 'hat',  open: true  },
    ];

    pattern.forEach(({ t, type, open }) => {
        // Random hi-hat drops for human feel.
        if (type === 'hat' && Math.random() < 0.22) return;

        const at = barStart + t + drift;
        if (type === 'kick')  playKick(ctx, dry, at);
        if (type === 'snare') playSnare(ctx, dry, wet, at);
        if (type === 'hat')   playHihat(ctx, dry, at, open ?? false);
    });

    // Occasional extra ghost snare hit for groove (on the "e" of beat 4)
    if (Math.random() < 0.24) {
        const ghostAt = barStart + BEAT_S * 3.25 + drift;
        const ghost   = ctx.createOscillator();
        const gg      = ctx.createGain();
        ghost.type = 'triangle'; ghost.frequency.value = 180;
        gg.gain.setValueAtTime(0.0001, ghostAt);
        gg.gain.exponentialRampToValueAtTime(0.035, ghostAt + 0.002);
        gg.gain.exponentialRampToValueAtTime(0.0001, ghostAt + 0.04);
        ghost.connect(gg); gg.connect(dry);
        ghost.start(ghostAt); ghost.stop(ghostAt + 0.05);
    }

    state.barStep++;
    const nextBar    = barStart + BAR_S;
    const msUntilNext = (nextBar - ctx.currentTime) * 1000;
    state.drumTimer  = window.setTimeout(
        () => scheduleDrums(nextBar),
        Math.max(msUntilNext - 200, 0),
    );
};

// ─── Phrase Scheduler (Piano + Bass) ─────────────────────────────────────────

const schedulePhrase = (phraseStart: number) => {
    if (!state.isPlaying || !state.ctx || !state.dryBus) return;

    const ctx   = state.ctx;
    const dry   = state.dryBus;
    const wet   = state.wetBus;
    const chord = CHORDS[state.chordStep % CHORDS.length];
    const phraseIndex = state.chordStep % CHORDS.length;
    state.chordStep++;

    // 1. Bass (whole phrase, very warm lowpass)
    chord.bass.forEach((midi, i) => {
        const offsets = [0, BEAT_S * 2 + SWING, BAR_S + BEAT_S * 2] as const;
        const t = phraseStart + offsets[i];
        const dur = i === 0 ? BAR_S * 1.25 : BEAT_S * 1.9;
        const vol = i === 0 ? 0.16 : 0.09;
        playPianoNote(ctx, dry, midi, t, dur, vol, 620);
    });

    // 2. Chord voicing — arpeggiate at start of each bar within phrase
    [0, BAR_S].forEach((barOff) => {
        chord.voicing.forEach((midi, i) => {
            const roll = phraseIndex % 2 === 0 ? i : chord.voicing.length - 1 - i;
            const t   = phraseStart + barOff + roll * 0.075 + rand(-0.018, 0.024);
            const dur = BAR_S * rand(0.82, 1.05);
            const vol = rand(0.056, 0.082);
            playPianoNote(ctx, dry, midi, t, dur, vol, 980);
            if (wet) playPianoNote(ctx, wet, midi, t, dur, vol * 0.55, 1100);
        });
    });

    // 3. Melody (4 notes, rubato)
    const cellSize = PHRASE_S / 4;
    chord.melody.forEach((midi, i) => {
        if (i === 1 && phraseIndex % 4 === 2) return;
        const t   = phraseStart + i * cellSize + rand(-0.12, 0.14);
        const dur = cellSize * rand(0.62, 0.95);
        const vol = rand(0.085, 0.125);
        playPianoNote(ctx, dry, midi, t, dur, vol, 1320);
        if (wet) playPianoNote(ctx, wet, midi, t, dur, vol * 0.48, 1400);
    });

    if (wet) {
        chord.glint.forEach((midi, i) => {
            const t = phraseStart + BAR_S + BEAT_S * (1.25 + i * 0.72) + rand(-0.035, 0.045);
            playIceBell(ctx, wet, midi, t, rand(1.25, 1.8), rand(0.026, 0.04));
        });
    }

    if (phraseIndex === 3 || phraseIndex === 7) {
        [62, 65, 67].forEach((midi, i) => {
            const t = phraseStart + PHRASE_S - BEAT_S * 0.9 + i * 0.16;
            playIceBell(ctx, wet ?? dry, midi + (phraseIndex === 7 ? -2 : 0), t, 0.72, 0.022);
        });
    }

    if (phraseIndex === 0 || phraseIndex === 4) {
        chord.voicing.slice(0, 3).forEach((midi, i) => {
            const t = phraseStart + i * 0.18;
            playPianoNote(ctx, wet ?? dry, midi - 12, t, PHRASE_S * 1.85, 0.038, 720);
        });
    }

    if (state.masterGain) {
        const swell = phraseIndex === 0 || phraseIndex === 4 ? 0.86 : 0.78;
        state.masterGain.gain.cancelScheduledValues(phraseStart);
        state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, phraseStart);
        state.masterGain.gain.linearRampToValueAtTime(swell, phraseStart + BAR_S);
        state.masterGain.gain.linearRampToValueAtTime(0.80, phraseStart + PHRASE_S);
    }

    // Schedule next phrase
    const nextStart   = phraseStart + PHRASE_S;
    const msUntilNext = (nextStart - ctx.currentTime) * 1000;
    state.phraseTimer = window.setTimeout(
        () => schedulePhrase(nextStart),
        Math.max(msUntilNext - 250, 0),
    );
};

// ─── Vinyl Crackle ────────────────────────────────────────────────────────────

const createVinylCrackle = (ctx: AudioContext, destination: AudioNode): AudioBufferSourceNode => {
    const len  = Math.floor(ctx.sampleRate * 4.0);
    const buf  = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
        const hiss = (Math.random() * 2 - 1) * 0.006;
        const pop  = Math.random() < 0.0008 ? (Math.random() * 2 - 1) * rand(0.25, 0.9) : 0;
        data[i]    = hiss + pop;
    }

    const src  = ctx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;

    const bp   = ctx.createBiquadFilter();
    bp.type    = 'bandpass';
    bp.frequency.value = 3400;
    bp.Q.value = 0.55;

    const gn   = ctx.createGain();
    gn.gain.value = 0.040;

    src.connect(bp); bp.connect(gn); gn.connect(destination);
    src.start();
    return src;
};

// ─── Warm Reverb ─────────────────────────────────────────────────────────────

const createWarmReverb = (ctx: AudioContext): AudioBuffer => {
    const len = Math.floor(ctx.sampleRate * 1.85);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) {
            const t = i / len;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.8);
        }
    }
    return buf;
};

// ─── Sub-Graph ────────────────────────────────────────────────────────────────

const buildGraph = (ctx: AudioContext) => {
    const master = ctx.createGain();
    const reverb = ctx.createConvolver();
    const dryBus = ctx.createGain();
    const wetBus = ctx.createGain();
    const comp   = ctx.createDynamicsCompressor();

    reverb.buffer    = createWarmReverb(ctx);
    master.gain.value = 0.72;
    dryBus.gain.value = 0.74;
    wetBus.gain.value = 0.36;

    comp.threshold.value = -20;
    comp.knee.value      = 16;
    comp.ratio.value     = 4;
    comp.attack.value    = 0.008;
    comp.release.value   = 0.35;

    dryBus.connect(comp);
    wetBus.connect(reverb);
    reverb.connect(comp);
    comp.connect(master);
    master.connect(ctx.destination);

    state.masterGain = master;
    state.dryBus     = dryBus;
    state.wetBus     = wetBus;

    state.noiseSource = createVinylCrackle(ctx, master);
};

// ─── Public API ───────────────────────────────────────────────────────────────

export const startColdkeepIceBgm = (ctx: AudioContext) => {
    if (state.isPlaying) return;

    state.ctx       = ctx;
    state.chordStep = 0;
    state.barStep   = 0;
    buildGraph(ctx);
    state.isPlaying = true;

    const firstStart = ctx.currentTime + 0.3;

    // Piano phrase starts first
    schedulePhrase(firstStart);

    // Drums start on the same beat (delay 1 beat so piano leads slightly)
    state.drumTimer = window.setTimeout(
        () => scheduleDrums(firstStart),
        Math.max((firstStart - ctx.currentTime) * 1000 - 100, 0),
    );
};

export const stopColdkeepIceBgm = () => {
    if (!state.isPlaying) return;
    state.isPlaying = false;

    if (state.phraseTimer !== null) { window.clearTimeout(state.phraseTimer); state.phraseTimer = null; }
    if (state.drumTimer   !== null) { window.clearTimeout(state.drumTimer);   state.drumTimer   = null; }

    if (state.noiseSource) {
        try { state.noiseSource.stop(); } catch { /* already stopped */ }
        state.noiseSource = null;
    }

    if (state.masterGain && state.ctx) {
        const now = state.ctx.currentTime;
        state.masterGain.gain.cancelScheduledValues(now);
        state.masterGain.gain.setValueAtTime(state.masterGain.gain.value, now);
        state.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }

    state.ctx        = null;
    state.masterGain = null;
    state.dryBus     = null;
    state.wetBus     = null;
};
