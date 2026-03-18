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
    | 'moonrise';

const MUTE_KEY = 'lp-audio-muted';

type BgmProfile = {
    notes: number[];
    highRatio: number;
    pulseRatio: number;
    waveform: OscillatorType;
    tickMs: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getBgmProfile = (weather: WeatherType, activity: number): BgmProfile => {
    const level = clamp(activity, 0, 1);
    const tempoOffset = (1 - level) * 240;

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
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
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
            master.gain.value = 0.22;
            master.connect(ctx.destination);

            audioContextRef.current = ctx;
            masterGainRef.current = master;
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
                playSweep(146.83, 587.33, 0.34, 'triangle', 0.14);
                playTone(220.0, 0.24, 0.065, 'triangle', 0.04);
                playTone(293.66, 0.2, 0.055, 'sine', 0.1);
                break;
            case 'flash':
                playNoiseBurst(0.12, 0.06, 0.0, 1700);
                playSweep(392.0, 82.41, 0.24, 'triangle', 0.1);
                playTone(123.47, 0.18, 0.045, 'sine', 0.06);
                break;
            case 'rain':
                playNoiseBurst(0.17, 0.032, 0.0, 2300);
                playTone(138.59, 0.18, 0.052, 'triangle', 0.02);
                playTone(116.54, 0.2, 0.046, 'sine', 0.1);
                break;
            case 'snow':
                playTone(392.0, 0.22, 0.062, 'sine');
                playTone(523.25, 0.2, 0.046, 'triangle', 0.06);
                break;
            case 'heavy-cloud':
                playSweep(220.0, 110.0, 0.44, 'triangle', 0.105);
                playTone(146.83, 0.2, 0.04, 'sine', 0.08);
                playNoiseBurst(0.1, 0.016, 0.11, 950);
                break;
            case 'sunburst':
                playTone(220.0, 0.19, 0.072, 'triangle');
                playTone(293.66, 0.2, 0.066, 'triangle', 0.07);
                playTone(349.23, 0.19, 0.054, 'sine', 0.13);
                break;
            case 'moonrise':
                playTone(196.0, 0.28, 0.05, 'sine');
                playTone(246.94, 0.26, 0.044, 'triangle', 0.1);
                break;
            case 'freeze':
                playTone(523.25, 0.15, 0.052, 'triangle');
                playTone(784.0, 0.2, 0.044, 'sine', 0.08);
                break;
            case 'wave':
                playSweep(220.0, 349.23, 0.24, 'sine', 0.075);
                playSweep(349.23, 246.94, 0.3, 'sine', 0.062);
                break;
            case 'cloud':
                playSweep(261.63, 174.61, 0.3, 'triangle', 0.075);
                playTone(220.0, 0.16, 0.036, 'sine', 0.08);
                break;
            case 'none':
            default:
                break;
        }
    };

    const startBgm = () => {
        if (bgmTimerRef.current !== null) return;

        const profile = getBgmProfile(weather, githubActivityLevel);
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
    }, [weather, githubActivityLevel]);

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
