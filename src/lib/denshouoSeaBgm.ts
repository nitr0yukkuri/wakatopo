type SeaState = {
    initialized: boolean;
    isPlaying: boolean;
    ctx: AudioContext | null;
    destination: AudioNode | null;
    mixGain: GainNode | null;
    breathTimer: number | null;
    phraseTimer: number | null;
    harmonicStep: number;
};

const state: SeaState = {
    initialized: false,
    isPlaying: false,
    ctx: null,
    destination: null,
    mixGain: null,
    breathTimer: null,
    phraseTimer: null,
    harmonicStep: 0,
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// 完全にコントロールされた楽曲の進行（海と沈黙を表現するルバートピアノ）
type PhraseDef = {
    bass: number[];
    arp: number[];
    melody: number[];
};

const SCORE: PhraseDef[] = [
    // 1: 静かなる沈み込み (Cm11)
    { bass: [36, 43], arp: [55, 58, 62], melody: [67, 65, 63, 62] },
    // 2: 揺らめく光 (AbM9#11)
    { bass: [32, 44], arp: [55, 60, 63], melody: [67, 72, 70, 67] },
    // 3: さらなる深淵 (Fm9)
    { bass: [29, 41], arp: [56, 60, 65], melody: [72, 75, 74, 72] },
    // 4: 立ち止まる (G7sus4 b9)
    { bass: [31, 43], arp: [55, 59, 63], melody: [67, 63, 60, 59] },

    // 5: 再び沈む (Cm11)
    { bass: [36, 43], arp: [55, 62, 63], melody: [67, 70, 75, 74] },
    // 6: 広い景色 (EbM9)
    { bass: [39, 46], arp: [55, 58, 62], melody: [67, 74, 70, 67] },
    // 7: 郷愁 (Fm9)
    { bass: [29, 41], arp: [53, 56, 60], melody: [68, 65, 63, 60] },
    // 8: 次の波へ (Bb13)
    { bass: [34, 46], arp: [58, 62, 65], melody: [68, 72, 70, 67] }
];

const clearTimer = (timer: number | null) => {
    if (timer !== null) { window.clearTimeout(timer); }
    return null;
};

// 重厚で余韻の長いピアノシンセサイザーの作成
const createLushPianoVoice = (
    ctx: AudioContext,
    destination: AudioNode,
    frequency: number,
    startAt: number,
    duration: number,
    volume: number,
    lowpassHz: number
) => {
    // 豊かな厚みを作るためのオシレーター群（アナログシンセ的な手法）
    const body = ctx.createOscillator();
    const tone = ctx.createOscillator();
    const air = ctx.createOscillator();
    const bite = ctx.createOscillator();

    const synthFilter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    body.type = 'triangle';
    tone.type = 'sine';
    air.type = 'sine';
    bite.type = 'triangle';

    // デチューンによるコーラス効果（広がりのあるピアノ音）
    body.frequency.setValueAtTime(frequency, startAt);
    tone.frequency.setValueAtTime(frequency * 1.996, startAt); // わずかにフラットな2倍音
    air.frequency.setValueAtTime(frequency * 3.003, startAt);  // わずかにシャープな3倍音
    bite.frequency.setValueAtTime(frequency * 4.0, startAt);   // アタックを付ける4倍音

    // ローパスフィルターで丸みのある音にする
    synthFilter.type = 'lowpass';
    synthFilter.frequency.setValueAtTime(lowpassHz, startAt);
    // 音が伸びるにつれてフィルターを閉じていき、徐々にこもった音にする（アコースティックな挙動）
    synthFilter.frequency.exponentialRampToValueAtTime(Math.max(lowpassHz * 0.25, 100), startAt + duration * 0.5);
    synthFilter.Q.value = 0.5;

    const attack = 0.04;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + attack);
    
    // 長いサスティンとリリース（ルバートした演奏に隙間を作らせない）
    gain.gain.exponentialRampToValueAtTime(volume * 0.25, startAt + attack + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(volume * 0.05, startAt + attack + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    // バランス調整（倍音ほど音量を下げる）
    const bodyGain = ctx.createGain(); bodyGain.gain.value = 0.6;
    const toneGain = ctx.createGain(); toneGain.gain.value = 0.25;
    const airGain = ctx.createGain(); airGain.gain.value = 0.1;
    const biteGain = ctx.createGain(); biteGain.gain.value = 0.05;

    body.connect(bodyGain); bodyGain.connect(synthFilter);
    tone.connect(toneGain); toneGain.connect(synthFilter);
    air.connect(airGain); airGain.connect(synthFilter);
    bite.connect(biteGain); biteGain.connect(synthFilter);

    synthFilter.connect(gain);
    gain.connect(destination);

    body.start(startAt); tone.start(startAt); air.start(startAt); bite.start(startAt);
    const stopAt = startAt + duration + 0.2;
    body.stop(stopAt); tone.stop(stopAt); air.stop(stopAt); bite.stop(stopAt);
};

const schedulePhrase = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    // 楽譜に沿って進行
    const phrase = SCORE[state.harmonicStep % SCORE.length];
    state.harmonicStep++;

    const now = state.ctx.currentTime;
    
    // 息継ぎのわずかな隙間と、ゆっくりとしたフレーズの開始
    const phraseStart = now + rand(0.5, 1.5);
    const sustainDur = 18.0; // ペダルを踏んだような長いサスティン

    // 1. 深いベース（ルートと5度を非常に広い音域で鳴らす）
    const bassVol = 0.035; 
    createLushPianoVoice(state.ctx, state.mixGain, midiToFreq(phrase.bass[0]), phraseStart, sustainDur, bassVol, 600);
    createLushPianoVoice(state.ctx, state.mixGain, midiToFreq(phrase.bass[1]), phraseStart + rand(0.1, 0.3), sustainDur * 0.9, bassVol * 0.8, 800);

    // 2. アルペジオ（中音域〜高音域へ這い上がる）
    let arpTime = phraseStart + rand(0.8, 1.6);
    for (let i = 0; i < phrase.arp.length; i++) {
        createLushPianoVoice(state.ctx, state.mixGain, midiToFreq(phrase.arp[i]), arpTime, sustainDur * 0.7, 0.015 + rand(0.002, 0.005), 1400);
        arpTime += rand(0.3, 0.7); // ゆっくりとしたロール
    }

    // 3. ルバートを効かせたメロディ（高音域）
    let melodyTime = arpTime + rand(0.4, 1.5);
    for (let i = 0; i < phrase.melody.length; i++) {
        const noteDur = sustainDur * 0.6; 
        createLushPianoVoice(state.ctx, state.mixGain, midiToFreq(phrase.melody[i]), melodyTime, noteDur, 0.022 + rand(0.002, 0.008), 2400);
        
        // ルバート：メロディの音符同士の間隔を感覚的に揺らす（ためる）
        if (i < phrase.melody.length - 1) {
            melodyTime += rand(1.2, 3.8); // 非常にゆっくりとした旋律
        }
    }

    // 次のフレーズまでのインターバル
    // 現在のメロディが弾き終わってから、深呼吸する時間（4秒〜8秒）を設ける
    const breath = rand(4.0, 8.0);
    const nextPhraseIn = (melodyTime - now) + breath;

    state.phraseTimer = window.setTimeout(() => {
        schedulePhrase();
    }, Math.floor(nextPhraseIn * 1000));
};

const scheduleBreathing = () => {
    if (!state.isPlaying || !state.ctx || !state.mixGain) return;

    const now = state.ctx.currentTime;
    const duration = rand(6.0, 12.0);
    // ノイズ除去に伴い、マスターの呼吸（全体のうねり）を少しマイルドに
    const target = rand(0.85, 1.0);
    const attack = duration * rand(0.3, 0.5);
    const recover = duration * rand(0.5, 0.7);

    state.mixGain.gain.cancelScheduledValues(now);
    state.mixGain.gain.setValueAtTime(state.mixGain.gain.value, now);
    state.mixGain.gain.linearRampToValueAtTime(target, now + attack);
    state.mixGain.gain.linearRampToValueAtTime(rand(0.86, 0.95), now + recover);

    state.breathTimer = window.setTimeout(() => {
        scheduleBreathing();
    }, Math.floor((duration + rand(0.5, 1.5)) * 1000));
};

const initialize = (ctx: AudioContext, destination: AudioNode) => {
    if (state.initialized && state.ctx === ctx && state.destination === destination) return;
    state.ctx = ctx;
    state.destination = destination;

    const mixGain = ctx.createGain();
    mixGain.gain.value = 0.9;

    mixGain.connect(destination);

    state.mixGain = mixGain;
    state.initialized = true;
};

export const startDenshouoSeaBgm = ({ ctx, destination }: { ctx: AudioContext; destination: AudioNode }) => {
    if (state.isPlaying) return;

    initialize(ctx, destination);

    state.isPlaying = true;
    state.harmonicStep = 0; // 曲の最初から演奏スタート

    scheduleBreathing();
    
    // 完全な楽曲としてシーケンスを走らせる
    schedulePhrase();
};

export const stopDenshouoSeaBgm = () => {
    if (!state.isPlaying) return;
    state.isPlaying = false;

    state.breathTimer = clearTimer(state.breathTimer);
    state.phraseTimer = clearTimer(state.phraseTimer);

    if (state.mixGain && state.ctx) {
        const now = state.ctx.currentTime;
        state.mixGain.gain.cancelScheduledValues(now);
        state.mixGain.gain.setValueAtTime(state.mixGain.gain.value, now);
        state.mixGain.gain.linearRampToValueAtTime(0.0001, now + 0.22);
    }
};
