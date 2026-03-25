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
    const tempoOffset = (1 - level) * 560;

    // Original lo-fi motifs inspired by bright/chill mood, not copied from any specific song.
    switch (activeWorkId) {
        case '01':
            return {
                notes: [98.0, 110.0, 146.83, 130.81],
                highRatio: 1.25,
                pulseRatio: 1.12,
                waveform: 'sine',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.01,
                accentAt: 0.42,
                tickMs: 4980 + tempoOffset,
            };
        case '02':
            return {
                notes: [110.0, 130.81, 164.81, 146.83],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'sine',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.011,
                accentAt: 0.46,
                tickMs: 5260 + tempoOffset,
            };
        case '03':
            return {
                notes: [92.5, 116.54, 138.59, 123.47],
                highRatio: 1.25,
                pulseRatio: 1.15,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.5,
                accentVolume: 0.009,
                accentAt: 0.44,
                tickMs: 5180 + tempoOffset,
            };
        case '04':
            return {
                notes: [103.83, 123.47, 155.56, 138.59],
                highRatio: 1.25,
                pulseRatio: 1.15,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.01,
                accentAt: 0.4,
                tickMs: 4820 + tempoOffset,
            };
        case '05':
            return {
                notes: [82.41, 98.0, 123.47, 110.0],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.5,
                accentVolume: 0.011,
                accentAt: 0.5,
                tickMs: 5480 + tempoOffset,
            };
        default:
            break;
    }

    switch (weather) {
        case 'Night':
            return {
                notes: [87.31, 103.83, 130.81, 116.54],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'sine',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.5,
                tickMs: 5560 + tempoOffset,
            };
        case 'Rain':
            return {
                notes: [92.5, 110.0, 138.59, 123.47],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.46,
                tickMs: 5280 + tempoOffset,
            };
        case 'Clouds':
            return {
                notes: [98.0, 110.0, 130.81, 116.54],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.44,
                tickMs: 5160 + tempoOffset,
            };
        case 'Snow':
            return {
                notes: [103.83, 123.47, 146.83, 130.81],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'sine',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.46,
                tickMs: 5220 + tempoOffset,
            };
        case 'Thunder':
            return {
                notes: [77.78, 92.5, 116.54, 103.83],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'triangle',
                accentWaveform: 'triangle',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.44,
                tickMs: 5380 + tempoOffset,
            };
        case 'Clear':
        case 'Morning':
        default:
            return {
                notes: [110.0, 130.81, 164.81, 146.83],
                highRatio: 1.25,
                pulseRatio: 1.1,
                waveform: 'triangle',
                accentWaveform: 'sine',
                accentRatio: 1.25,
                accentVolume: 0.009,
                accentAt: 0.44,
                tickMs: 5060 + tempoOffset,
            };
    }
};
