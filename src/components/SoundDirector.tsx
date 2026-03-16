'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

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

export default function SoundDirector() {
    const transitionType = useStore((state) => state.transitionType);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const bgmTimerRef = useRef<number | null>(null);
    const previousTransitionRef = useRef<TransitionType>('none');
    const isMutedRef = useRef(false);

    const ensureAudioGraph = async () => {
        if (typeof window === 'undefined') return false;

        if (!audioContextRef.current) {
            const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Ctx) return false;

            const ctx = new Ctx();
            const master = ctx.createGain();
            master.gain.value = 0.055;
            master.connect(ctx.destination);

            audioContextRef.current = ctx;
            masterGainRef.current = master;
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        return true;
    };

    const playTone = (freq: number, duration: number, volume = 0.25, type: OscillatorType = 'sine', at = 0) => {
        const ctx = audioContextRef.current;
        const master = masterGainRef.current;
        if (!ctx || !master || isMutedRef.current) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + at);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start(ctx.currentTime + at);
        osc.stop(ctx.currentTime + at + duration + 0.03);
    };

    const playSweep = (from: number, to: number, duration: number, type: OscillatorType = 'sawtooth', volume = 0.22) => {
        const ctx = audioContextRef.current;
        const master = masterGainRef.current;
        if (!ctx || !master || isMutedRef.current) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(from, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(to, 25), ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(master);

        osc.start();
        osc.stop(ctx.currentTime + duration + 0.05);
    };

    const playTransitionSfx = (type: TransitionType) => {
        switch (type) {
            case 'warp':
                playSweep(150, 820, 0.32, 'sawtooth', 0.24);
                playTone(420, 0.22, 0.14, 'triangle', 0.06);
                break;
            case 'flash':
                playSweep(980, 140, 0.22, 'square', 0.16);
                playTone(1200, 0.08, 0.1, 'sawtooth', 0.02);
                break;
            case 'rain':
                playTone(290, 0.16, 0.11, 'triangle');
                playTone(250, 0.18, 0.1, 'triangle', 0.08);
                playTone(220, 0.2, 0.08, 'triangle', 0.16);
                break;
            case 'snow':
                playTone(620, 0.2, 0.1, 'sine');
                playTone(780, 0.24, 0.07, 'sine', 0.1);
                break;
            case 'heavy-cloud':
                playSweep(180, 65, 0.46, 'triangle', 0.18);
                break;
            case 'sunburst':
                playTone(392, 0.18, 0.12, 'triangle');
                playTone(523.25, 0.2, 0.12, 'triangle', 0.08);
                playTone(659.25, 0.24, 0.11, 'triangle', 0.16);
                break;
            case 'moonrise':
                playTone(329.63, 0.25, 0.08, 'sine');
                playTone(493.88, 0.28, 0.07, 'sine', 0.1);
                break;
            case 'freeze':
                playTone(880, 0.16, 0.08, 'triangle');
                playTone(1174.66, 0.22, 0.07, 'triangle', 0.09);
                break;
            case 'wave':
                playSweep(240, 480, 0.24, 'sine', 0.12);
                playSweep(480, 210, 0.3, 'sine', 0.09);
                break;
            case 'cloud':
                playSweep(320, 210, 0.28, 'triangle', 0.12);
                break;
            case 'none':
            default:
                break;
        }
    };

    const startBgm = () => {
        if (bgmTimerRef.current !== null) return;
        const notes = [110, 138.59, 164.81, 123.47];
        let i = 0;

        const tick = () => {
            if (isMutedRef.current) return;
            const base = notes[i % notes.length];
            playTone(base, 1.8, 0.038, 'sine');
            playTone(base * 2, 1.15, 0.018, 'triangle', 0.06);
            i += 1;
        };

        tick();
        bgmTimerRef.current = window.setInterval(tick, 1900);
    };

    const stopBgm = () => {
        if (bgmTimerRef.current !== null) {
            window.clearInterval(bgmTimerRef.current);
            bgmTimerRef.current = null;
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const savedMuted = window.localStorage.getItem(MUTE_KEY);
        isMutedRef.current = savedMuted === '1';

        const unlockAudio = async () => {
            const ok = await ensureAudioGraph();
            if (!ok) return;
            if (!isMutedRef.current) startBgm();
        };

        const toggleMute = async (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== 'm') return;

            event.preventDefault();
            isMutedRef.current = !isMutedRef.current;
            window.localStorage.setItem(MUTE_KEY, isMutedRef.current ? '1' : '0');

            const ok = await ensureAudioGraph();
            if (!ok) return;

            if (isMutedRef.current) {
                stopBgm();
            } else {
                startBgm();
                playTone(523.25, 0.12, 0.09, 'triangle');
            }
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

    return null;
}
