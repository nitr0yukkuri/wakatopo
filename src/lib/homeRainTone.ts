import * as Tone from 'tone';
import type { WeatherType } from '@/store';

let initialized = false;
let isPlaying = false;
let rainNoise: Tone.Noise | null = null;
let rainFilter: Tone.Filter | null = null;
let rainVol: Tone.Volume | null = null;

let thunderNoise: Tone.NoiseSynth | null = null;
let thunderMembrane: Tone.MembraneSynth | null = null;
let thunderVol: Tone.Volume | null = null;
let thunderInterval: number | null = null;
let currentWeather: WeatherType | null = null;

const playThunder = () => {
    if (!isPlaying || currentWeather !== 'Thunder') return;
    
    const now = Tone.now();
    // High frequency crackle
    thunderNoise?.triggerAttackRelease(2.0, now, 0.12);
    // Deep heavy rumble initial strike
    thunderMembrane?.triggerAttackRelease('C1', 2.5, now, 0.42);
    // Long lingering secondary rumble for realism (overlapping)
    thunderMembrane?.triggerAttackRelease('C0', 4.0, now + 0.15, 0.34);
    // Final distant rumble
    thunderMembrane?.triggerAttackRelease('E0', 3.0, now + 0.4, 0.24);
    
    // Schedule next majestic random thunder between 6 and 14 seconds
    const nextMs = 6000 + Math.random() * 8000;
    thunderInterval = window.setTimeout(playThunder, nextMs);
};

export const startHomeRain = async (weather: WeatherType) => {
    currentWeather = weather;
    await Tone.start();
    
    if (!initialized) {
        rainVol = new Tone.Volume(-14).toDestination();
        rainFilter = new Tone.Filter({ frequency: 400, type: 'lowpass' }).connect(rainVol);
        rainNoise = new Tone.Noise('brown').connect(rainFilter);
        rainNoise.volume.value = -20;

        thunderVol = new Tone.Volume(-10).toDestination();
        const thunderFilter = new Tone.Filter({ frequency: 600, type: 'lowpass' }).connect(thunderVol);
        
        thunderNoise = new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.05, decay: 2.0, sustain: 0, release: 0.1 }
        }).connect(thunderFilter);
        
        thunderMembrane = new Tone.MembraneSynth({
            pitchDecay: 0.15,
            octaves: 3,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 4.0, sustain: 0, release: 0.1 }
        }).connect(thunderFilter);
        
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                if (isPlaying) void (Tone.context as any).suspend();
            } else {
                if (isPlaying) void (Tone.context as any).resume();
            }
        });
        
        initialized = true;
    }
    
    if (!isPlaying) {
        rainNoise?.start();
        isPlaying = true;
        
        if (weather === 'Thunder') {
            playThunder();
        }
    } else {
        // If already playing but weather changed to Thunder dynamically
        if (weather === 'Thunder' && thunderInterval === null) {
            playThunder();
        } else if (weather !== 'Thunder' && thunderInterval !== null) {
            window.clearTimeout(thunderInterval);
            thunderInterval = null;
        }
    }
};

export const stopHomeRain = () => {
    if (isPlaying) {
        rainNoise?.stop();
        if (thunderInterval !== null) {
            window.clearTimeout(thunderInterval);
            thunderInterval = null;
        }
        isPlaying = false;
    }
};
