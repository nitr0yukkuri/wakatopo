type SeaState = {
    initialized: boolean;
    isPlaying: boolean;
    ctx: AudioContext | null;
    destination: AudioNode | null;
    mixGain: GainNode | null;
    shoreGain: GainNode | null;
    foamGain: GainNode | null;
    undertowGain: GainNode | null;
    shoreFilter: BiquadFilterNode | null;
    foamFilter: BiquadFilterNode | null;
    undertowFilter: BiquadFilterNode | null;
    shoreSource: AudioBufferSourceNode | null;
    foamSource: AudioBufferSourceNode | null;
    undertowSource: AudioBufferSourceNode | null;
    breathTimer: number | null;
    motifTimer: number | null;
    chordTimer: number | null;
    harmonicStep: number;
};

const state: SeaState = {
    initialized: false,
    isPlaying: false,
    ctx: null,
    destination: null,
    mixGain: null,
    shoreGain: null,
    foamGain: null,
    undertowGain: null,
    shoreFilter: null,
    foamFilter: null,
    undertowFilter: null,
    shoreSource: null,
    foamSource: null,
    undertowSource: null,
    breathTimer: null,
    motifTimer: null,
    chordTimer: null,
    harmonicStep: 0,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const HARMONY_STEPS: Array<{ root: number; color: number[] }> = [
    { root: 45, color: [52, 57] }, // A2 + E3 + A3
    { root: 48, color: [55, 60] }, // C3 + G3 + C4
    { root: 43, color: [50, 55] }, // G2 + D3 + G3
    { root: 46, color: [53, 58] }, // Bb2 + F3 + Bb3
];

const createWhiteNoiseBuffer = (ctx: AudioContext, seconds: number) => {
    const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }

    return buffer;
};

const createBrownNoiseBuffer = (ctx: AudioContext, seconds: number) => {
    const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;

    for (let i = 0; i < frames; i += 1) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.025 * white) / 1.025;
        data[i] = Math.max(-1, Math.min(1, lastOut * 3.5));
    }

    return buffer;
};

const createLoopSource = (ctx: AudioContext, buffer: AudioBuffer, out: AudioNode) => {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(out);
    src.start();
    return src;
};

const stopSource = (source: AudioBufferSourceNode | null) => {
    if (!source) return;

    try {
        source.stop();
    } catch {
        // no-op
    }

    source.disconnect();
};

const createSoftVoice = (
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    duration: number,
    volume: number,
    attack: number,
    releasePad: number,
    highCutHz: number,
) => {
    const carrier = ctx.createOscillator();
    const color = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    carrier.type = 'triangle';
    carrier.frequency.setValueAtTime(Math.max(36, frequency), ctx.currentTime);

    color.type = 'sine';
    color.frequency.setValueAtTime(Math.max(36, frequency * 2), ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(highCutHz, ctx.currentTime);
    filter.Q.value = 0.55;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    carrier.connect(filter);
    color.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    carrier.start();
    color.start();
    carrier.stop(ctx.currentTime + duration + releasePad);
    color.stop(ctx.currentTime + duration + releasePad);
};

const scheduleChordBed = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const step = HARMONY_STEPS[state.harmonicStep % HARMONY_STEPS.length];
    state.harmonicStep += 1;

    const chordNotes = [step.root, ...step.color];
    const span = rand(8.0, 12.2);

    for (const midi of chordNotes) {
        createSoftVoice(
            state.ctx,
            state.mixGain,
            midiToFreq(midi),
            span,
            rand(0.007, 0.011),
            rand(1.0, 1.8),
            0.2,
            rand(1300, 1850),
        );
    }

    const nextMs = Math.floor(rand(9000, 14000));
    state.chordTimer = window.setTimeout(() => {
        scheduleChordBed();
    }, nextMs);
};

const schedulePianoMotif = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const scale = [57, 60, 62, 64, 67, 69]; // A minor pentatonic-ish plus color
    const noteCount = Math.floor(rand(2, 4.99));
    const startAt = state.ctx.currentTime + rand(0.08, 0.26);

    for (let i = 0; i < noteCount; i += 1) {
        const midi = scale[Math.floor(rand(0, scale.length))];
        const offset = i * rand(0.38, 0.72);
        const duration = rand(1.8, 3.3);

        const carrier = state.ctx.createOscillator();
        const overtone = state.ctx.createOscillator();
        const filter = state.ctx.createBiquadFilter();
        const gain = state.ctx.createGain();

        carrier.type = 'triangle';
        carrier.frequency.setValueAtTime(midiToFreq(midi), startAt + offset);

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(midiToFreq(midi + 12), startAt + offset);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(rand(1200, 2100), startAt + offset);
        filter.Q.value = 0.62;

        gain.gain.setValueAtTime(0.0001, startAt + offset);
        gain.gain.linearRampToValueAtTime(rand(0.006, 0.013), startAt + offset + rand(0.09, 0.18));
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + offset + duration);

        carrier.connect(filter);
        overtone.connect(filter);
        filter.connect(gain);
        gain.connect(state.mixGain);

        carrier.start(startAt + offset);
        overtone.start(startAt + offset);
        carrier.stop(startAt + offset + duration + 0.12);
        overtone.stop(startAt + offset + duration + 0.12);
    }

    const nextMs = Math.floor(rand(3600, 6400));
    state.motifTimer = window.setTimeout(() => {
        schedulePianoMotif();
    }, nextMs);
};

const scheduleBreathing = () => {
    if (!state.ctx || !state.mixGain) return;

    const now = state.ctx.currentTime;
    const duration = rand(6.0, 9.0);
    const target = rand(0.84, 1.0);
    const current = state.mixGain.gain.value;
    const attack = Math.min(duration * 0.45, 2.8);

    state.mixGain.gain.cancelScheduledValues(now);
    state.mixGain.gain.setValueAtTime(current, now);
    state.mixGain.gain.linearRampToValueAtTime(target, now + attack);
    state.mixGain.gain.linearRampToValueAtTime(rand(0.86, 0.98), now + duration);
    modulateFilters();

    const nextMs = Math.floor((duration + rand(0.35, 0.9)) * 1000);
    state.breathTimer = window.setTimeout(() => {
        if (!state.isPlaying) return;
        scheduleBreathing();
    }, nextMs);
};

const initialize = (ctx: AudioContext, destination: AudioNode) => {
    if (state.initialized && state.ctx === ctx && state.destination === destination) return;

    state.ctx = ctx;
    state.destination = destination;

    const mixGain = ctx.createGain();
    mixGain.gain.value = 0.9;

    const shoreGain = ctx.createGain();
    shoreGain.gain.value = 0.0001;
    const shoreFilter = ctx.createBiquadFilter();
    shoreFilter.type = 'lowpass';
    shoreFilter.frequency.value = rand(820, 1200);
    shoreFilter.Q.value = 0.7;

    const foamGain = ctx.createGain();
    foamGain.gain.value = 0.0001;
    const foamFilter = ctx.createBiquadFilter();
    foamFilter.type = 'highpass';
    foamFilter.frequency.value = rand(2600, 4700);
    foamFilter.Q.value = 0.5;

    const undertowGain = ctx.createGain();
    undertowGain.gain.value = 0.0001;
    const undertowFilter = ctx.createBiquadFilter();
    undertowFilter.type = 'bandpass';
    undertowFilter.frequency.value = rand(110, 160);
    undertowFilter.Q.value = 0.75;

    shoreFilter.connect(shoreGain);
    shoreGain.connect(mixGain);

    foamFilter.connect(foamGain);
    foamGain.connect(mixGain);

    undertowFilter.connect(undertowGain);
    undertowGain.connect(mixGain);

    mixGain.connect(destination);

    state.mixGain = mixGain;
    state.shoreGain = shoreGain;
    state.foamGain = foamGain;
    state.undertowGain = undertowGain;
    state.shoreFilter = shoreFilter;
    state.foamFilter = foamFilter;
    state.undertowFilter = undertowFilter;
    state.initialized = true;
};

const applyStartEnvelope = () => {
    if (!state.ctx) return;

    const now = state.ctx.currentTime;

    if (state.shoreGain) {
        state.shoreGain.gain.cancelScheduledValues(now);
        state.shoreGain.gain.setValueAtTime(0.0001, now);
        state.shoreGain.gain.linearRampToValueAtTime(0.15, now + 1.4);
    }

    if (state.foamGain) {
        state.foamGain.gain.cancelScheduledValues(now);
        state.foamGain.gain.setValueAtTime(0.0001, now);
        state.foamGain.gain.linearRampToValueAtTime(0.052, now + 0.18);
        state.foamGain.gain.linearRampToValueAtTime(0.045, now + 1.4);
    }

    if (state.undertowGain) {
        state.undertowGain.gain.cancelScheduledValues(now);
        state.undertowGain.gain.setValueAtTime(0.0001, now);
        state.undertowGain.gain.linearRampToValueAtTime(0.036, now + 2.2);
    }
};

const modulateFilters = () => {
    if (!state.ctx) return;

    const now = state.ctx.currentTime;

    if (state.shoreFilter) {
        state.shoreFilter.frequency.cancelScheduledValues(now);
        state.shoreFilter.frequency.setValueAtTime(rand(760, 1180), now);
        state.shoreFilter.frequency.linearRampToValueAtTime(rand(920, 1360), now + rand(5.5, 8.7));
    }

    if (state.foamFilter) {
        state.foamFilter.frequency.cancelScheduledValues(now);
        state.foamFilter.frequency.setValueAtTime(rand(2200, 3600), now);
        state.foamFilter.frequency.linearRampToValueAtTime(rand(3400, 5600), now + rand(4.8, 7.4));
    }

    if (state.undertowFilter) {
        state.undertowFilter.frequency.cancelScheduledValues(now);
        state.undertowFilter.frequency.setValueAtTime(rand(95, 150), now);
        state.undertowFilter.frequency.linearRampToValueAtTime(rand(110, 178), now + rand(6.2, 9.1));
    }
};

export const startDenshouoSeaBgm = ({ ctx, destination }: { ctx: AudioContext; destination: AudioNode }) => {
    if (state.isPlaying) return;

    initialize(ctx, destination);

    if (!state.shoreFilter || !state.foamFilter || !state.undertowFilter) return;

    const shoreNoise = createBrownNoiseBuffer(ctx, 5.0);
    const foamNoise = createWhiteNoiseBuffer(ctx, 2.6);
    const undertowNoise = createBrownNoiseBuffer(ctx, 6.2);

    state.shoreSource = createLoopSource(ctx, shoreNoise, state.shoreFilter);
    state.foamSource = createLoopSource(ctx, foamNoise, state.foamFilter);
    state.undertowSource = createLoopSource(ctx, undertowNoise, state.undertowFilter);

    state.isPlaying = true;
    state.harmonicStep = Math.floor(rand(0, HARMONY_STEPS.length));

    applyStartEnvelope();
    modulateFilters();
    scheduleBreathing();
    scheduleChordBed();
    schedulePianoMotif();
};

export const stopDenshouoSeaBgm = () => {
    if (!state.isPlaying) return;

    state.isPlaying = false;

    if (state.breathTimer !== null) {
        window.clearTimeout(state.breathTimer);
        state.breathTimer = null;
    }

    if (state.motifTimer !== null) {
        window.clearTimeout(state.motifTimer);
        state.motifTimer = null;
    }

    if (state.chordTimer !== null) {
        window.clearTimeout(state.chordTimer);
        state.chordTimer = null;
    }

    stopSource(state.shoreSource);
    stopSource(state.foamSource);
    stopSource(state.undertowSource);

    state.shoreSource = null;
    state.foamSource = null;
    state.undertowSource = null;

    if (state.mixGain && state.ctx) {
        const now = state.ctx.currentTime;
        state.mixGain.gain.cancelScheduledValues(now);
        state.mixGain.gain.setValueAtTime(state.mixGain.gain.value, now);
        state.mixGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    }
};
