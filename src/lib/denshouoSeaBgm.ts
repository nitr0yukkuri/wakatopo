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
    foamHighpass: BiquadFilterNode | null;
    foamLowpass: BiquadFilterNode | null;
    undertowFilter: BiquadFilterNode | null;
    shoreSource: AudioBufferSourceNode | null;
    foamSource: AudioBufferSourceNode | null;
    undertowSource: AudioBufferSourceNode | null;
    breathTimer: number | null;
    macroTimer: number | null;
    motifTimer: number | null;
    chordTimer: number | null;
    foamPulseTimer: number | null;
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
    foamHighpass: null,
    foamLowpass: null,
    undertowFilter: null,
    shoreSource: null,
    foamSource: null,
    undertowSource: null,
    breathTimer: null,
    macroTimer: null,
    motifTimer: null,
    chordTimer: null,
    foamPulseTimer: null,
    harmonicStep: 0,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

const HARMONY_STEPS: Array<{ root: number; color: number[] }> = [
    { root: 45, color: [52, 57, 60] },
    { root: 48, color: [55, 60, 64] },
    { root: 43, color: [50, 57, 60] },
    { root: 41, color: [48, 53, 57] },
    { root: 46, color: [53, 58, 62] },
];

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

const createPinkNoiseBuffer = (ctx: AudioContext, seconds: number) => {
    const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < frames; i += 1) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = Math.max(-1, Math.min(1, pink * 0.1));
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

const clearTimer = (timer: number | null) => {
    if (timer !== null) {
        window.clearTimeout(timer);
    }
    return null;
};

const createPianoVoice = (
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    startAt: number,
    duration: number,
    attack: number,
    volume: number,
    lowpassHz: number,
) => {
    const body = ctx.createOscillator();
    const tone = ctx.createOscillator();
    const air = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    body.type = 'triangle';
    tone.type = 'sine';
    air.type = 'sine';

    body.frequency.setValueAtTime(frequency, startAt);
    tone.frequency.setValueAtTime(frequency * 2, startAt);
    air.frequency.setValueAtTime(frequency * 3.01, startAt);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, startAt);
    filter.Q.value = 0.6;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    body.connect(filter);
    tone.connect(filter);
    air.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    body.start(startAt);
    tone.start(startAt);
    air.start(startAt);

    const stopAt = startAt + duration + 0.2;
    body.stop(stopAt);
    tone.stop(stopAt);
    air.stop(stopAt);
};

const scheduleFoamPulse = () => {
    if (!state.isPlaying || !state.ctx || !state.foamGain) return;

    const now = state.ctx.currentTime;
    const base = rand(0.019, 0.028);
    const swell = rand(0.029, 0.043);
    const attack = rand(0.3, 1.2);
    const release = rand(1.8, 4.0);

    state.foamGain.gain.cancelScheduledValues(now);
    state.foamGain.gain.setValueAtTime(state.foamGain.gain.value, now);
    state.foamGain.gain.linearRampToValueAtTime(swell, now + attack);
    state.foamGain.gain.linearRampToValueAtTime(base, now + attack + release);

    state.foamPulseTimer = window.setTimeout(() => {
        scheduleFoamPulse();
    }, Math.floor(rand(2600, 6800)));
};

const scheduleMacroShift = () => {
    if (!state.isPlaying || !state.ctx || !state.shoreGain || !state.foamGain || !state.undertowGain) return;

    const now = state.ctx.currentTime;
    const span = rand(16, 30);

    const shoreTarget = rand(0.16, 0.24);
    const foamTarget = rand(0.019, 0.03);
    const undertowTarget = rand(0.038, 0.055);

    state.shoreGain.gain.cancelScheduledValues(now);
    state.shoreGain.gain.setValueAtTime(state.shoreGain.gain.value, now);
    state.shoreGain.gain.linearRampToValueAtTime(shoreTarget, now + span);

    state.foamGain.gain.cancelScheduledValues(now);
    state.foamGain.gain.setValueAtTime(state.foamGain.gain.value, now);
    state.foamGain.gain.linearRampToValueAtTime(foamTarget, now + span * rand(0.65, 0.95));

    state.undertowGain.gain.cancelScheduledValues(now);
    state.undertowGain.gain.setValueAtTime(state.undertowGain.gain.value, now);
    state.undertowGain.gain.linearRampToValueAtTime(undertowTarget, now + span * rand(0.7, 1.0));

    state.macroTimer = window.setTimeout(() => {
        scheduleMacroShift();
    }, Math.floor((span + rand(2.6, 5.8)) * 1000));
};

const scheduleBreathing = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const now = state.ctx.currentTime;
    const duration = rand(5.8, 10.4);
    const target = rand(0.83, 1.0);
    const attack = duration * rand(0.25, 0.48);
    const recover = duration * rand(0.52, 0.78);

    state.mixGain.gain.cancelScheduledValues(now);
    state.mixGain.gain.setValueAtTime(state.mixGain.gain.value, now);
    state.mixGain.gain.linearRampToValueAtTime(target, now + attack);
    state.mixGain.gain.linearRampToValueAtTime(rand(0.86, 0.97), now + recover);

    if (state.shoreFilter) {
        state.shoreFilter.frequency.cancelScheduledValues(now);
        state.shoreFilter.frequency.setValueAtTime(rand(780, 1180), now);
        state.shoreFilter.frequency.linearRampToValueAtTime(rand(980, 1420), now + duration);
    }

    if (state.foamHighpass) {
        state.foamHighpass.frequency.cancelScheduledValues(now);
        state.foamHighpass.frequency.setValueAtTime(rand(1700, 2600), now);
        state.foamHighpass.frequency.linearRampToValueAtTime(rand(2300, 3400), now + duration * 0.82);
    }

    if (state.foamLowpass) {
        state.foamLowpass.frequency.cancelScheduledValues(now);
        state.foamLowpass.frequency.setValueAtTime(rand(3900, 5200), now);
        state.foamLowpass.frequency.linearRampToValueAtTime(rand(4500, 6100), now + duration * 0.72);
    }

    if (state.undertowFilter) {
        state.undertowFilter.frequency.cancelScheduledValues(now);
        state.undertowFilter.frequency.setValueAtTime(rand(94, 145), now);
        state.undertowFilter.frequency.linearRampToValueAtTime(rand(118, 176), now + duration * 0.9);
    }

    state.breathTimer = window.setTimeout(() => {
        scheduleBreathing();
    }, Math.floor((duration + rand(0.4, 1.4)) * 1000));
};

const scheduleChordBed = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const step = HARMONY_STEPS[state.harmonicStep % HARMONY_STEPS.length];
    state.harmonicStep += 1;

    const baseStart = state.ctx.currentTime + rand(0.1, 0.5);
    const span = rand(10.0, 18.0);

    for (let i = 0; i < step.color.length; i += 1) {
        const midi = i === 0 ? step.root : step.color[i];
        createPianoVoice(
            state.ctx,
            state.mixGain,
            midiToFreq(midi),
            baseStart + i * rand(0.08, 0.34),
            span * rand(0.72, 1.04),
            rand(1.2, 2.7),
            rand(0.0038, 0.0075),
            rand(900, 1650),
        );
    }

    state.chordTimer = window.setTimeout(() => {
        scheduleChordBed();
    }, Math.floor(rand(9800, 17600)));
};

const schedulePianoMotif = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const scale = [50, 53, 57, 60, 62, 65, 69, 72];
    const phraseCount = Math.floor(rand(1, 4.2));
    const phraseStart = state.ctx.currentTime + rand(0.06, 0.35);

    for (let i = 0; i < phraseCount; i += 1) {
        if (Math.random() < 0.25) continue;

        const midi = scale[Math.floor(rand(0, scale.length))];
        const startAt = phraseStart + i * rand(0.48, 1.6);
        const length = rand(1.6, 4.4);

        createPianoVoice(
            state.ctx,
            state.mixGain,
            midiToFreq(midi),
            startAt,
            length,
            rand(0.14, 0.42),
            rand(0.0022, 0.0062),
            rand(980, 1880),
        );
    }

    state.motifTimer = window.setTimeout(() => {
        schedulePianoMotif();
    }, Math.floor(rand(4200, 12400)));
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
    shoreFilter.frequency.value = rand(840, 1240);
    shoreFilter.Q.value = 0.72;

    const foamGain = ctx.createGain();
    foamGain.gain.value = 0.0001;
    const foamHighpass = ctx.createBiquadFilter();
    foamHighpass.type = 'highpass';
    foamHighpass.frequency.value = rand(1800, 2800);
    foamHighpass.Q.value = 0.68;
    const foamLowpass = ctx.createBiquadFilter();
    foamLowpass.type = 'lowpass';
    foamLowpass.frequency.value = rand(3900, 5600);
    foamLowpass.Q.value = 0.56;

    const undertowGain = ctx.createGain();
    undertowGain.gain.value = 0.0001;
    const undertowFilter = ctx.createBiquadFilter();
    undertowFilter.type = 'bandpass';
    undertowFilter.frequency.value = rand(102, 162);
    undertowFilter.Q.value = 0.78;

    shoreFilter.connect(shoreGain);
    shoreGain.connect(mixGain);

    foamHighpass.connect(foamLowpass);
    foamLowpass.connect(foamGain);
    foamGain.connect(mixGain);

    undertowFilter.connect(undertowGain);
    undertowGain.connect(mixGain);

    mixGain.connect(destination);

    state.mixGain = mixGain;
    state.shoreGain = shoreGain;
    state.foamGain = foamGain;
    state.undertowGain = undertowGain;
    state.shoreFilter = shoreFilter;
    state.foamHighpass = foamHighpass;
    state.foamLowpass = foamLowpass;
    state.undertowFilter = undertowFilter;
    state.initialized = true;
};

const applyStartEnvelope = () => {
    if (!state.ctx) return;
    const now = state.ctx.currentTime;

    if (state.shoreGain) {
        state.shoreGain.gain.cancelScheduledValues(now);
        state.shoreGain.gain.setValueAtTime(0.0001, now);
        state.shoreGain.gain.linearRampToValueAtTime(0.19, now + 1.5);
    }

    if (state.foamGain) {
        state.foamGain.gain.cancelScheduledValues(now);
        state.foamGain.gain.setValueAtTime(0.0001, now);
        state.foamGain.gain.linearRampToValueAtTime(0.03, now + 1.0);
        state.foamGain.gain.linearRampToValueAtTime(0.024, now + 2.1);
    }

    if (state.undertowGain) {
        state.undertowGain.gain.cancelScheduledValues(now);
        state.undertowGain.gain.setValueAtTime(0.0001, now);
        state.undertowGain.gain.linearRampToValueAtTime(0.044, now + 2.4);
    }
};

export const startDenshouoSeaBgm = ({ ctx, destination }: { ctx: AudioContext; destination: AudioNode }) => {
    if (state.isPlaying) return;

    initialize(ctx, destination);

    if (!state.shoreFilter || !state.foamHighpass || !state.undertowFilter) return;

    const shoreNoise = createBrownNoiseBuffer(ctx, 5.5);
    const foamNoise = createPinkNoiseBuffer(ctx, 4.2);
    const undertowNoise = createBrownNoiseBuffer(ctx, 7.0);

    state.shoreSource = createLoopSource(ctx, shoreNoise, state.shoreFilter);
    state.foamSource = createLoopSource(ctx, foamNoise, state.foamHighpass);
    state.undertowSource = createLoopSource(ctx, undertowNoise, state.undertowFilter);

    state.isPlaying = true;
    state.harmonicStep = Math.floor(rand(0, HARMONY_STEPS.length));

    applyStartEnvelope();
    scheduleBreathing();
    scheduleMacroShift();
    scheduleFoamPulse();
    scheduleChordBed();
    schedulePianoMotif();
};

export const stopDenshouoSeaBgm = () => {
    if (!state.isPlaying) return;
    state.isPlaying = false;

    state.breathTimer = clearTimer(state.breathTimer);
    state.macroTimer = clearTimer(state.macroTimer);
    state.motifTimer = clearTimer(state.motifTimer);
    state.chordTimer = clearTimer(state.chordTimer);
    state.foamPulseTimer = clearTimer(state.foamPulseTimer);

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
        state.mixGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);
    }
};
