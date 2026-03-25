import type { WeatherType } from '@/store';

export type LofiBgmProfile = {
    notes: number[];
    highRatio: number;
    pulseRatio: number;
    waveform: OscillatorType;
    accentWaveform: OscillatorType;
    accentRatio: number;
    accentVolume: number;
    accentAt: number;
    tickMs: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getLofiBgmProfile = (weather: WeatherType, activity: number, activeWorkId: string | null): LofiBgmProfile => {
    const level = clamp(activity, 0, 1);
    const tempoOffset = (1 - level) * 320;

    // Original lo-fi motifs inspired by bright/chill mood, not copied from any specific song.
    switch (activeWorkId) {
        case '01':
            return {
                notes: [196.0, 246.94, 293.66, 246.94],
                highRatio: 1.5,
                pulseRatio: 1.25,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.5,
                accentVolume: 0.013,
                accentAt: 0.28,
                tickMs: 2980 + tempoOffset,
            };
        case '02':
            return {
                notes: [220.0, 261.63, 329.63, 392.0],
                highRatio: 1.5,
                pulseRatio: 1.25,
                waveform: 'sine',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.014,
                accentAt: 0.34,
                tickMs: 3120 + tempoOffset,
            };
        case '03':
            return {
                notes: [174.61, 220.0, 261.63, 329.63],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 2,
                accentVolume: 0.012,
                accentAt: 0.36,
                tickMs: 3060 + tempoOffset,
            };
        case '04':
            return {
                notes: [196.0, 246.94, 277.18, 329.63],
                highRatio: 1.5,
                pulseRatio: 1.33,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.5,
                accentVolume: 0.013,
                accentAt: 0.3,
                tickMs: 2860 + tempoOffset,
            };
        case '05':
            return {
                notes: [164.81, 196.0, 246.94, 293.66],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'sine',
                accentWaveform: 'triangle',
                accentRatio: 1.5,
                accentVolume: 0.012,
                accentAt: 0.36,
                tickMs: 3200 + tempoOffset,
            };
        default:
            break;
    }

    switch (weather) {
        case 'Night':
            return {
                notes: [164.81, 196.0, 246.94, 220.0],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'sine',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.38,
                tickMs: 3180 + tempoOffset,
            };
        case 'Rain':
            return {
                notes: [174.61, 220.0, 261.63, 220.0],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.36,
                tickMs: 3060 + tempoOffset,
            };
        case 'Clouds':
            return {
                notes: [196.0, 220.0, 261.63, 220.0],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.34,
                tickMs: 2980 + tempoOffset,
            };
        case 'Snow':
            return {
                notes: [196.0, 246.94, 293.66, 261.63],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'sine',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.36,
                tickMs: 3020 + tempoOffset,
            };
        case 'Thunder':
            return {
                notes: [146.83, 174.61, 220.0, 196.0],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.012,
                accentAt: 0.34,
                tickMs: 3120 + tempoOffset,
            };
        case 'Clear':
        case 'Morning':
        default:
            return {
                notes: [196.0, 246.94, 293.66, 246.94],
                highRatio: 1.5,
                pulseRatio: 1.2,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.34,
                tickMs: 2920 + tempoOffset,
            };
    }
};
