'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore, WeatherType } from '@/store';

type TransitionType =
    | 'none'
    | 'warp'
    | 'cloud'
    | 'freeze'
    | 'rain'
    | 'snow'
    | 'sunburst'
    | 'flash'
    | 'heavy-cloud'
    | 'wave'
    | 'moonrise'
    | 'captcha-lock';

const MUTE_KEY = 'lp-audio-muted';

type BgmProfile = {
    notes: number[];
    highRatio: number;
    pulseRatio: number;
    waveform: OscillatorType;
    tickMs: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getBgmProfile = (weather: WeatherType, activity: number, activeWorkId: string | null): BgmProfile => {
    const level = clamp(activity, 0, 1);
    const tempoOffset = (1 - level) * 240;

    // Prioritize per-work motifs after entering each project page.
    switch (activeWorkId) {
        case '01':
            // GitHub Planet: cosmic and uplifting.
            return {
                notes: [73.42, 98.0, 146.83, 196.0],
                highRatio: 2,
                pulseRatio: 1.5,
                waveform: 'sine',
                tickMs: 1700 + tempoOffset,
            };
        case '02':
            // Otenkigurashi: gentle weather ambience.
            return {
                notes: [164.81, 196.0, 220.0, 246.94],
                highRatio: 1.5,
                pulseRatio: 1.25,
                waveform: 'triangle',
                tickMs: 1860 + tempoOffset,
            };
        case '03':
            // Coldkeep: geometric and mysterious.
            return {
                notes: [92.5, 138.59, 207.65, 155.56],
                highRatio: 2,
                pulseRatio: 1.4,
                waveform: 'sawtooth',
                tickMs: 1780 + tempoOffset,
            };
        case '04':
            // reCAPTCHA game: arcadey loop.
            return {
                notes: [220.0, 277.18, 329.63, 440.0],
                highRatio: 2,
                pulseRatio: 2,
                waveform: 'square',
                tickMs: 1320 + tempoOffset,
            };
        case '05':
            // Denshouo: soft and airy.
            return {
                notes: [146.83, 174.61, 196.0, 220.0],
                highRatio: 1.5,
                pulseRatio: 1.33,
                waveform: 'sine',
                tickMs: 1920 + tempoOffset,
            };
        default:
            break;
    }

    switch (weather) {
        case 'Night':
            return {
                notes: [98.0, 123.47, 146.83, 130.81],
                highRatio: 2,
                pulseRatio: 1.5,
                waveform: 'sine',
                tickMs: 2100 + tempoOffset,
            };
        case 'Rain':
            return {
                notes: [103.83, 123.47, 138.59, 116.54],
                highRatio: 2,
                pulseRatio: 1.33,
                waveform: 'triangle',
                tickMs: 1820 + tempoOffset,
            };
        case 'Clouds':
            return {
                notes: [110.0, 130.81, 146.83, 123.47],
                highRatio: 2,
                pulseRatio: 1.25,
                waveform: 'triangle',
                tickMs: 1760 + tempoOffset,
            };
        case 'Snow':
            return {
                notes: [130.81, 174.61, 196.0, 164.81],
                highRatio: 2,
                pulseRatio: 1.5,
                waveform: 'sine',
                tickMs: 1650 + tempoOffset,
            };
        case 'Thunder':
            return {
                notes: [82.41, 98.0, 123.47, 92.5],
                highRatio: 2,
                pulseRatio: 1.2,
                waveform: 'sawtooth',
                tickMs: 1960 + tempoOffset,
            };
        case 'Clear':
        case 'Morning':
        default:
            return {
                notes: [110.0, 146.83, 174.61, 130.81],
                highRatio: 2,
                pulseRatio: 1.5,
                waveform: 'triangle',
                tickMs: 1580 + tempoOffset,
            };
    }
};

export default function SoundDirector() {
    const transitionType = useStore((state) => state.transitionType);
    const weather = useStore((state) => state.weather);
    const githubActivityLevel = useStore((state) => state.githubActivityLevel);
    const activeWorkId = useStore((state) => state.activeWorkId);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const outputCompressorRef = useRef<DynamicsCompressorNode | null>(null);
    const bgmTimerRef = useRef<number | null>(null);
    const previousTransitionRef = useRef<TransitionType>('none');
    const isMutedRef = useRef(false);
    const bgmStepRef = useRef(0);
    const [isMuted, setIsMuted] = useState(false);

    const ensureAudioGraph = async () => {
        if (typeof window === 'undefined') return false;

        if (!audioContextRef.current) {
            const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Ctx) return false;

            const ctx = new Ctx();
            const master = ctx.createGain();
            const outputCompressor = ctx.createDynamicsCompressor();

            // Keep transients controlled and raise perceived loudness on speakers.
            outputCompressor.threshold.value = -28;
            outputCompressor.knee.value = 24;
            outputCompressor.ratio.value = 3;
            outputCompressor.attack.value = 0.01;
            outputCompressor.release.value = 0.22;

            master.gain.value = 1.1;
            master.connect(outputCompressor);
            outputCompressor.connect(ctx.destination);

            audioContextRef.current = ctx;
            masterGainRef.current = master;
            outputCompressorRef.current = outputCompressor;
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        return true;
    };

    const createVoice = (
        type: OscillatorType,
        freq: number,
        at: number,
        duration: number,
        volume: number,
        filterType: BiquadFilterType = 'lowpass',
        q = 0.9,
    ) => {
        const ctx = audioContextRef.current;
        const master = masterGainRef.current;
        if (!ctx || !master || isMutedRef.current) return;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(Math.max(freq, 24), ctx.currentTime + at);

        filter.type = filterType;
        filter.frequency.setValueAtTime(Math.min(Math.max(freq * 4, 120), 6200), ctx.currentTime + at);
        filter.Q.value = q;

        gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + at + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(ctx.currentTime + at);
        osc.stop(ctx.currentTime + at + duration + 0.03);
    };

    const playTone = (freq: number, duration: number, volume = 0.25, type: OscillatorType = 'sine', at = 0) => {
        createVoice(type, freq, at, duration, volume, 'lowpass', 0.8);
    };

    const playNoiseBurst = (duration: number, volume: number, at = 0, highpass = 500) => {
        const ctx = audioContextRef.current;
        const master = masterGainRef.current;
        if (!ctx || !master || isMutedRef.current) return;

        const frameCount = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < frameCount; i += 1) {
            output[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
        }

        const source = ctx.createBufferSource();
        const hp = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        source.buffer = buffer;

        hp.type = 'highpass';
        hp.frequency.setValueAtTime(highpass, ctx.currentTime + at);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + duration);

        source.connect(hp);
        hp.connect(gain);
        gain.connect(master);

        source.start(ctx.currentTime + at);
        source.stop(ctx.currentTime + at + duration + 0.01);
    };

    const playSweep = (from: number, to: number, duration: number, type: OscillatorType = 'sawtooth', volume = 0.22) => {
        const ctx = audioContextRef.current;
        const master = masterGainRef.current;
        if (!ctx || !master || isMutedRef.current) return;

        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(from, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(to, 25), ctx.currentTime + duration);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(Math.min(Math.max(from * 2.3, 140), 4600), ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(Math.min(Math.max(to * 2.6, 140), 4600), ctx.currentTime + duration);
        filter.Q.value = 1.1;

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
    };

    const playTransitionSfx = (type: TransitionType) => {
        switch (type) {
            case 'warp':
                // GitHub Planet: space-like launch + sparkling overtones.
                playSweep(98.0, 739.99, 0.52, 'sine', 0.13);
                playTone(196.0, 0.28, 0.05, 'triangle', 0.02);
                playTone(493.88, 0.22, 0.042, 'sine', 0.18);
                playTone(659.25, 0.18, 0.03, 'sine', 0.29);
                break;
            case 'flash':
                // Otenkigurashi (thunder route): soft weather chime, not harsh.
                playNoiseBurst(0.08, 0.02, 0.0, 2100);
                playTone(293.66, 0.16, 0.045, 'sine', 0.0);
                playTone(349.23, 0.2, 0.038, 'triangle', 0.07);
                playTone(261.63, 0.22, 0.032, 'sine', 0.16);
                break;
            case 'rain':
                playNoiseBurst(0.14, 0.018, 0.0, 2600);
                playTone(220.0, 0.16, 0.034, 'sine', 0.02);
                playTone(246.94, 0.18, 0.03, 'triangle', 0.09);
                break;
            case 'snow':
                playTone(329.63, 0.22, 0.04, 'sine');
                playTone(392.0, 0.18, 0.032, 'triangle', 0.08);
                playTone(493.88, 0.16, 0.026, 'sine', 0.15);
                break;
            case 'heavy-cloud':
                playSweep(246.94, 196.0, 0.34, 'sine', 0.05);
                playTone(220.0, 0.2, 0.034, 'triangle', 0.05);
                playNoiseBurst(0.1, 0.01, 0.09, 1600);
                break;
            case 'sunburst':
                playTone(261.63, 0.16, 0.042, 'sine');
                playTone(329.63, 0.18, 0.036, 'triangle', 0.07);
                playTone(392.0, 0.16, 0.03, 'sine', 0.13);
                break;
            case 'moonrise':
                playTone(174.61, 0.3, 0.032, 'sine');
                playTone(220.0, 0.26, 0.028, 'triangle', 0.09);
                playTone(261.63, 0.2, 0.024, 'sine', 0.17);
                break;
            case 'freeze':
                // Coldkeep: geometric / mysterious metallic interval stack.
                playTone(233.08, 0.26, 0.055, 'triangle');
                playTone(329.63, 0.24, 0.046, 'sine', 0.06);
                playTone(466.16, 0.22, 0.04, 'triangle', 0.13);
                playNoiseBurst(0.06, 0.008, 0.16, 3000);
                break;
            case 'wave':
                // Denshouo: gentle airy movement.
                playSweep(196.0, 246.94, 0.3, 'sine', 0.05);
                playSweep(246.94, 220.0, 0.34, 'sine', 0.042);
                playTone(293.66, 0.18, 0.026, 'triangle', 0.12);
                break;
            case 'cloud':
                playSweep(293.66, 220.0, 0.28, 'sine', 0.044);
                playTone(246.94, 0.18, 0.028, 'triangle', 0.09);
                break;
            case 'captcha-lock':
                // reCAPTCHA game: arcade-style confirmation + level-up blip.
                playTone(523.25, 0.07, 0.07, 'square');
                playTone(659.25, 0.07, 0.07, 'square', 0.08);
                playTone(783.99, 0.09, 0.08, 'square', 0.16);
                playTone(987.77, 0.12, 0.06, 'triangle', 0.24);
                playNoiseBurst(0.05, 0.01, 0.12, 2800);
                break;
            case 'none':
            default:
                break;
        }
    };

    const startBgm = () => {
        if (bgmTimerRef.current !== null) return;

        const profile = getBgmProfile(weather, githubActivityLevel, activeWorkId);
        bgmStepRef.current = 0;

        const tick = () => {
            if (isMutedRef.current) return;
            const index = bgmStepRef.current % profile.notes.length;
            const base = profile.notes[index];
            const sway = 1 + Math.sin(bgmStepRef.current * 0.7) * 0.018;
            const top = base * profile.highRatio;
            const pulse = base * profile.pulseRatio;

            playTone(base * sway, 1.65, 0.028, profile.waveform);
            playTone(top * sway, 0.86, 0.013, 'sine', 0.04);
            playTone(pulse, 0.22, 0.01, 'triangle', 0.18);

            if (weather === 'Rain' || weather === 'Clouds') {
                playNoiseBurst(0.08, 0.007, 0.24, 1800);
            }

            bgmStepRef.current += 1;
        };

        tick();
        bgmTimerRef.current = window.setInterval(tick, profile.tickMs);
    };

    const stopBgm = () => {
        if (bgmTimerRef.current !== null) {
            window.clearInterval(bgmTimerRef.current);
            bgmTimerRef.current = null;
        }
    };

    const setMutedState = async (nextMuted: boolean) => {
        isMutedRef.current = nextMuted;
        setIsMuted(nextMuted);
        window.localStorage.setItem(MUTE_KEY, nextMuted ? '1' : '0');

        const ok = await ensureAudioGraph();
        if (!ok) return;

        if (nextMuted) {
            stopBgm();
            return;
        }

        startBgm();
        playTone(523.25, 0.12, 0.08, 'triangle');
    };

    const handleToggleMute = async () => {
        await setMutedState(!isMutedRef.current);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedMuted = window.localStorage.getItem(MUTE_KEY);
        isMutedRef.current = savedMuted === '1';
        setIsMuted(isMutedRef.current);

        const unlockAudio = async () => {
            const ok = await ensureAudioGraph();
            if (!ok) return;
            if (!isMutedRef.current) {
                startBgm();
                playTone(659.25, 0.08, 0.05, 'triangle');
            }
        };

        const toggleMute = async (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'm') return;

            event.preventDefault();
            await handleToggleMute();
        };

        window.addEventListener('pointerdown', unlockAudio, { once: true });
        window.addEventListener('keydown', unlockAudio, { once: true });
        window.addEventListener('keydown', toggleMute);

        return () => {
            window.removeEventListener('keydown', toggleMute);
            stopBgm();

            if (audioContextRef.current) {
                void audioContextRef.current.close();
            }

            audioContextRef.current = null;
            masterGainRef.current = null;
            outputCompressorRef.current = null;
        };
    }, []);

    useEffect(() => {
        const previous = previousTransitionRef.current;
        previousTransitionRef.current = transitionType;

        if (transitionType === 'none' || transitionType === previous) {
            return;
        }

        void ensureAudioGraph().then((ok) => {
            if (!ok) return;
            playTransitionSfx(transitionType);
        });
    }, [transitionType]);

    useEffect(() => {
        if (isMutedRef.current) return;
        if (bgmTimerRef.current === null) return;

        stopBgm();
        startBgm();
    }, [weather, githubActivityLevel, activeWorkId]);

    return (
        <div className="fixed bottom-6 right-6 z-70 pointer-events-auto">
            <button
                type="button"
                onClick={() => {
                    void handleToggleMute();
                }}
                aria-pressed={!isMuted}
                aria-label={isMuted ? 'Enable sound' : 'Disable sound'}
                className="group inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-[#05080d]/80 px-3 py-2 text-[10px] font-mono tracking-[0.22em] text-cyan-200/90 backdrop-blur transition-colors hover:border-cyan-300 hover:text-white"
            >
                <span className={`h-1.5 w-1.5 rounded-full ${isMuted ? 'bg-gray-500' : 'bg-cyan-300 animate-pulse'}`} />
                <span>{isMuted ? 'SOUND OFF' : 'SOUND ON'}</span>
            </button>
        </div>
    );
}
