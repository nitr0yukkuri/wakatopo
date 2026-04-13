import * as Tone from 'tone';
import type { WeatherType } from '@/store';

let initialized = false;
let isPlaying = false;
let lofiSynth: Tone.PolySynth | null = null;
let arpSynth: Tone.PolySynth | null = null;
let noiseGenerator: Tone.Noise | null = null;
let loop: Tone.Loop | null = null;
let arpLoop: Tone.Loop | null = null;

let crusher: Tone.BitCrusher | null = null;
let filter: Tone.Filter | null = null;
let vibrato: Tone.Vibrato | null = null;
let vol: Tone.Volume | null = null;
let delay: Tone.FeedbackDelay | null = null;

export const startOtenkiBgm = async (weather: WeatherType) => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    // Initialize components if not already
    if (!initialized) {
        // Output mixer & Limiter to prevent clipping
        vol = new Tone.Volume(-6).toDestination(); 
        const limiter = new Tone.Limiter(-2).connect(vol);
        
        // Lofi Effects
        crusher = new Tone.BitCrusher({ bits: 12 });
        filter = new Tone.Filter({ frequency: 1800, type: 'lowpass', rolloff: -24 });
        vibrato = new Tone.Vibrato({ frequency: 2, depth: 0.15 }); // tape wow & flutter
        delay = new Tone.FeedbackDelay("4n.", 0.3);
        
        // Main synth (chords)
        lofiSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.1, decay: 1.2, sustain: 0.3, release: 3 }
        });
        
        // Arpeggios/Melody synth (bells/electric piano ish)
        arpSynth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 2,
            modulationIndex: 1.5,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.5, sustain: 0.1, release: 2 }
        });
        
        // Vinyl/Tape noise
        noiseGenerator = new Tone.Noise('pink');
        noiseGenerator.volume.value = -35; // Very subtle
        
        // FX Routing
        lofiSynth.chain(vibrato, crusher, delay, filter, limiter);
        arpSynth.chain(vibrato, delay, filter, limiter); // No bitcrush for arps to keep them slightly cleaner
        noiseGenerator.chain(filter, limiter);
        
        initialized = true;
    }
    
    // Default config
    Tone.Transport.bpm.value = 75; 
    let chords: string[][] = [];
    let arpPattern: number[] = [];
    let lofiVolume = -6;

    switch (weather) {
        case 'Rain':
            chords = [['G3', 'Bb3', 'D4', 'F4'], ['C3', 'Eb3', 'G3', 'Bb3']]; // Fm9, Cm7
            arpPattern = [0, 2, 3];
            Tone.Transport.bpm.value = 68;
            filter!.frequency.value = 1000; // More muffled for rain
            break;
        case 'Clouds':
            chords = [['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4']]; // Am7, Fmaj7
            arpPattern = [0, 3, 1, 3];
            Tone.Transport.bpm.value = 72;
            filter!.frequency.value = 1200;
            break;
        case 'Snow':
            chords = [['E3', 'G3', 'B3', 'D4'], ['C3', 'E3', 'G3', 'B3'], ['A2', 'C3', 'E3', 'G3']]; // Em7, Cmaj7, Am7
            arpPattern = [0, 3, 2];
            Tone.Transport.bpm.value = 65;
            filter!.frequency.value = 1500;
            break;
        case 'Thunder':
            chords = [['E2', 'G2', 'B2', 'D3'], ['C2', 'E2', 'G2', 'B2']]; // Darker, lower
            arpPattern = []; // No arps, just dark chords
            Tone.Transport.bpm.value = 60;
            filter!.frequency.value = 800; // Very muted
            lofiVolume = -4; // Compensate for low frequency
            break;
        case 'Night':
            chords = [['D3', 'F3', 'A3', 'C4'], ['Bb2', 'D3', 'F3', 'A3', 'C4']]; // Dm7, Bbmaj9
            arpPattern = [0, 1, 3, 2];
            Tone.Transport.bpm.value = 64;
            filter!.frequency.value = 1400;
            break;
        case 'Clear':
        case 'Morning':
        default:
            chords = [['C4', 'E4', 'G4', 'B4'], ['A3', 'C4', 'E4', 'G4'], ['F3', 'A3', 'C4', 'E4']]; // Cmaj7, Am7, Fmaj7
            arpPattern = [0, 2, 1];
            Tone.Transport.bpm.value = 80;
            filter!.frequency.value = 2000; // Brighter
            break;
    }
    
    vol!.volume.value = lofiVolume;

    // Build the Generative Loops
    let step = 0;
    
    // 1. Chords
    loop = new Tone.Loop((time) => {
        const chord = chords[step % chords.length];
        
        // Slightly randomize velocity, keeping it low to prevent clipping
        const velocity = 0.15 + Math.random() * 0.08;
        lofiSynth?.triggerAttackRelease(chord, '2n', time, velocity);
        
        step++;
    }, '1m');

    // 2. Playful Arpeggios (like water drops / wind chimes)
    let arpStep = 0;
    arpLoop = new Tone.Loop((time) => {
        if (arpPattern.length > 0) {
            const currentChord = chords[step % chords.length]; 
            // Randomly skip notes to make it feel sporadic/lofi generative
            if (Math.random() > 0.3) {
                const noteIndex = arpPattern[arpStep % arpPattern.length];
                const tryNote = currentChord[noteIndex % currentChord.length];
                if (tryNote) {
                    // Transpose up an octave for bells
                    const transposed = Tone.Frequency(tryNote).transpose(12).toNote();
                    arpSynth?.triggerAttackRelease(transposed, '16n', time, 0.12);
                }
            }
        }
        arpStep++;
    }, '8n');

    noiseGenerator?.start();
    loop.start(0);
    arpLoop.start(0);
    
    Tone.Transport.start();
    isPlaying = true;
};

export const stopOtenkiBgm = () => {
    if (isPlaying) {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        noiseGenerator?.stop();
        // Cut synths from ringing out immediately
        lofiSynth?.releaseAll();
        arpSynth?.releaseAll();
        isPlaying = false;
    }
};
