type IceState = {
    initialized: boolean;
    isPlaying: boolean;
    ctx: AudioContext | null;
    destination: AudioNode | null;
    mixGain: GainNode | null;
    clinkTimer: number | null;
};

const state: IceState = {
    initialized: false,
    isPlaying: false,
    ctx: null,
    destination: null,
    mixGain: null,
    clinkTimer: null,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

// ASMR風の氷がぶつかる音（非整数倍音を含む高い周波数帯と高速減衰）
const createIceClink = (
    ctx: AudioContext,
    destination: AudioNode,
    startAt: number,
    baseFrequency: number,
    volume: number
) => {
    // 氷やガラス特有の非整数倍音比率
    const freqs = [baseFrequency, baseFrequency * 1.54, baseFrequency * 2.37];
    const decayTimes = [0.12, 0.08, 0.05]; // 高音ほど早く減衰する

    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        
        const attack = 0.002; // 非常に鋭いアタック（カチッという音）
        const decay = decayTimes[i];

        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(volume * (1 - i * 0.2), startAt + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + decay);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(startAt);
        osc.stop(startAt + attack + decay + 0.05);
    });
};

const scheduleIceClink = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const now = state.ctx.currentTime;
    
    // 時折、複数の氷が連鎖してぶつかる（クラスター）
    const isCluster = Math.random() < 0.35;
    const numClinks = isCluster ? Math.floor(rand(2, 6)) : 1;
    
    let timeOffset = 0;
    for (let i = 0; i < numClinks; i++) {
        const freq = rand(2500, 5000); // グラスと氷の高い反響音
        const vol = rand(0.015, 0.04); // BGMとして邪魔にならない控えめな音量
        createIceClink(state.ctx, state.mixGain, now + timeOffset, freq, vol);
        timeOffset += rand(0.03, 0.15); // 連続するカチャカチャ音の間隔
    }

    // 次の氷の音までの間隔（ASMR的な不規則性）
    const nextIn = rand(0.8, 4.0);
    state.clinkTimer = window.setTimeout(() => {
        scheduleIceClink();
    }, Math.floor(nextIn * 1000));
};

const initialize = (ctx: AudioContext, destination: AudioNode) => {
    if (state.initialized && state.ctx === ctx && state.destination === destination) return;
    state.ctx = ctx;
    state.destination = destination;

    const mixGain = ctx.createGain();
    mixGain.gain.value = 1.0;
    mixGain.connect(destination);

    state.mixGain = mixGain;
    state.initialized = true;
};

export const startColdkeepIceBgm = ({ ctx, destination }: { ctx: AudioContext; destination: AudioNode }) => {
    if (state.isPlaying) return;

    initialize(ctx, destination);
    state.isPlaying = true;

    // 最初の氷の音を少し遅延してスタート
    state.clinkTimer = window.setTimeout(() => {
        scheduleIceClink();
    }, 500);
};

export const stopColdkeepIceBgm = () => {
    if (!state.isPlaying) return;
    state.isPlaying = false;

    if (state.clinkTimer !== null) {
        window.clearTimeout(state.clinkTimer);
        state.clinkTimer = null;
    }

    if (state.mixGain && state.ctx) {
        const now = state.ctx.currentTime;
        state.mixGain.gain.cancelScheduledValues(now);
        state.mixGain.gain.setValueAtTime(state.mixGain.gain.value, now);
        state.mixGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);
    }
};
