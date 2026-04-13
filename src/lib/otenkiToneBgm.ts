import * as Tone from 'tone';
import type { WeatherType } from '@/store';

let initialized = false;
let isPlaying = false;

// Instruments
let lofiSynth: Tone.PolySynth | null = null;
let arpSynth: Tone.PolySynth | null = null;
let kickSynth: Tone.MembraneSynth | null = null;
let snareSynth: Tone.NoiseSynth | null = null;
let hatSynth: Tone.MetalSynth | null = null;
let bassSynth: Tone.Synth | null = null;

// Noises
let vinylNoise: Tone.Noise | null = null;
let rainNoise: Tone.Noise | null = null;

// Loops
let chordLoop: Tone.Loop | null = null;
let arpLoop: Tone.Loop | null = null;
let drumLoop: Tone.Loop | null = null;

// FX
let crusher: Tone.BitCrusher | null = null;
let filter: Tone.Filter | null = null;
let vibrato: Tone.Vibrato | null = null;
let delay: Tone.FeedbackDelay | null = null;
let vol: Tone.Volume | null = null;
let limiter: Tone.Limiter | null = null;
let drumMix: Tone.Gain | null = null;

export const startOtenkiBgm = async (weather: WeatherType) => {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clears transport events
    
    // 🔥 FIX: Release any currently playing synths IMMEDIATELY!
    // If a user clicks weather icons while a chord is playing, the transport stops but the note 
    // sustains forever, creating a deafening continuous drone on earphones!
    lofiSynth?.releaseAll();
    arpSynth?.releaseAll();
    kickSynth?.triggerRelease();
    bassSynth?.triggerRelease();
    
    // 🔥 FIX: Clean up old loops to absolutely prevent multiple playing loops (which multiplies audio and causes severe clipping!)
    if (drumLoop) { drumLoop.dispose(); drumLoop = null; }
    if (chordLoop) { chordLoop.dispose(); chordLoop = null; }
    if (arpLoop) { arpLoop.dispose(); arpLoop = null; }
    
    // Initialize components if not already
    if (!initialized) {
        // Output mixer & Limiter to prevent clipping. 
        // We boost final volume here safely after safely reducing synth outputs.
        vol = new Tone.Volume(0).toDestination(); 
        limiter = new Tone.Limiter(-1).connect(vol);
        
        // Lofi Effects
        crusher = new Tone.BitCrusher({ bits: 12 });
        // Hip-hop lowpass to muffle everything slightly
        filter = new Tone.Filter({ frequency: 1800, type: 'lowpass', rolloff: -24 });
        vibrato = new Tone.Vibrato({ frequency: 1.5, depth: 0.15 }); 
        delay = new Tone.FeedbackDelay("4n.", 0.25);
        
        // --- 1. Chords ---
        lofiSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.05, decay: 1.2, sustain: 0.4, release: 2 }
        });
        
        // --- 2. Melody / Arp ---
        arpSynth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 2.5,
            modulationIndex: 1.2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 2 }
        });

        // --- 3. Drums (Lofi Hip Hop Boom-Bap) ---
        kickSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1 }
        });
        
        snareSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        });
        
        hatSynth = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        });
        hatSynth.frequency.value = 300;

        // --- 4. Sub Bass ---
        bassSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.8, release: 1 }
        });
        
        // --- 5. Noises ---
        vinylNoise = new Tone.Noise('pink');
        vinylNoise.volume.value = -42; // Subliminal vinyl texture (much softer)

        rainNoise = new Tone.Noise('brown');
        const rainFilter = new Tone.Filter({ frequency: 600, type: 'lowpass' });
        rainNoise.chain(rainFilter, limiter); // Route rain directly to limiter
        rainNoise.volume.value = -28; // Gentle rain ambience
        
        // FX Routing - Create a clean Master Lofi Bus to prevent recursive feedback loops!
        // 🔥 FIX: Tone.js BitCrusher uses a WaveShaperNode that hard-clips amplitudes > 1.0.
        // We add a pre-limiter to gracefully compress the combined synths before they hit the crusher.
        // This permanently eliminates the screeching digital distortion noise you hear on earphones.
        const preLimiter = new Tone.Limiter(-1);
        const masterLofiMix = new Tone.Gain(1);
        masterLofiMix.chain(preLimiter, vibrato, crusher, delay, filter, limiter);

        kickSynth.connect(masterLofiMix);
        snareSynth.connect(masterLofiMix);
        hatSynth.connect(masterLofiMix);
        
        bassSynth.connect(masterLofiMix);
        lofiSynth.connect(masterLofiMix);
        arpSynth.connect(masterLofiMix);

        // Keep noises out of the crusher/delay path to keep them clean
        vinylNoise.connect(filter); // filter is already connected to limiter
        
        // 🔥 FIX: Thoroughly balanced Lofi Mix Levels
        lofiSynth.volume.value = -6;   // Muffle the aggressive chord output
        arpSynth.volume.value = -6;    // Sweet floating melody
        kickSynth.volume.value = -6;   // Punchy but not overloading
        bassSynth.volume.value = -8;   // Deep, warm sub bass
        snareSynth.volume.value = -16; // Soft, relaxed snare
        hatSynth.volume.value = -22;   // Gentle tape-like hi-hats 

        // 🔥 FIX: Prevent multiple-tab OS clipping by suspending audio context when tab is hidden
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                void (Tone.context as any).suspend();
            } else {
                if (isPlaying) {
                    void (Tone.context as any).resume();
                }
            }
        });

        initialized = true;
    }
    
    // Default config
    Tone.Transport.bpm.value = 72; // Classic Lofi Hip Hop tempo (70-80)
    let chords: string[][] = [];
    let arpPattern: number[] = [];
    let lofiVolume = -14; // Global master volume - lowered for a comfortable web BGM experience

    // Define jazzy, beautiful lofi chord progressions
    switch (weather) {
        case 'Rain':
            chords = [
                ['F3', 'Ab3', 'C4', 'Eb4', 'G4'],   // Fm9
                ['C3', 'Eb3', 'G3', 'Bb3', 'D4'],   // Cm9
                ['Db3', 'F3', 'Ab3', 'C4', 'Eb4'],  // Dbmaj9
                ['C3', 'E3', 'G3', 'Bb3', 'Db4']    // C7b9
            ];
            arpPattern = [0, 2, 4];
            Tone.Transport.bpm.value = 68;
            filter!.frequency.value = 1200; // Muffled
            break;
        case 'Clouds':
            chords = [
                ['E3', 'G3', 'B3', 'D4', 'Gb4'],    // Em9
                ['A2', 'C3', 'E3', 'G3', 'B3'],     // Am9
                ['D3', 'Gb3', 'A3', 'C4', 'E4'],    // D9
                ['G2', 'B2', 'D3', 'Gb3', 'A3']     // Gmaj9
            ];
            arpPattern = [0, 3, 1, 4];
            Tone.Transport.bpm.value = 72;
            filter!.frequency.value = 1400;
            break;
        case 'Snow':
            chords = [
                ['C3', 'E3', 'G3', 'B3', 'D4'],     // Cmaj9
                ['A2', 'C3', 'E3', 'G3', 'B3'],     // Am9
                ['F2', 'A2', 'C3', 'E3', 'G3'],     // Fmaj9
                ['G2', 'B2', 'F3', 'A3', 'C4']      // G13
            ];
            arpPattern = [0, 4, 2];
            Tone.Transport.bpm.value = 65;
            filter!.frequency.value = 1600;
            break;
        case 'Thunder':
            chords = [
                ['Eb3', 'Gb3', 'Bb3', 'Db4', 'F4'], // Ebm9
                ['Db3', 'F3', 'Ab3', 'C4', 'Eb4'],  // Dbmaj9
                ['B2', 'Eb3', 'Gb3', 'Bb3', 'Db4'], // Bmaj9
                ['Bb2', 'D3', 'F3', 'Ab3', 'B3']    // Bb7b9
            ];
            arpPattern = []; // No arps
            Tone.Transport.bpm.value = 64;
            filter!.frequency.value = 1000; // Dark
            lofiVolume = -12; // Boost slightly relative to default -14 for dark track
            break;
        case 'Night':
            chords = [
                ['D3', 'F3', 'A3', 'C4', 'E4'],     // Dm9
                ['G2', 'B2', 'F3', 'A3', 'C4'],     // G13
                ['C3', 'E3', 'G3', 'B3', 'D4'],     // Cmaj9
                ['A2', 'C3', 'E3', 'G3', 'B3']      // Am9
            ];
            arpPattern = [0, 4, 3, 2];
            Tone.Transport.bpm.value = 65;
            filter!.frequency.value = 1300;
            break;
        case 'Clear':
        case 'Morning':
        default:
            chords = [
                ['Eb3', 'G3', 'Bb3', 'D4', 'F4'],   // Ebmaj9
                ['C3', 'Eb3', 'G3', 'Bb3', 'D4'],   // Cm9
                ['F3', 'Ab3', 'C4', 'Eb4', 'G4'],   // Fm9
                ['Bb2', 'D3', 'Ab3', 'C4', 'Eb4']   // Bb13
            ];
            arpPattern = [0, 4, 1];
            Tone.Transport.bpm.value = 75;
            filter!.frequency.value = 2200; // Bright
            break;
    }
    
    vol!.volume.value = lofiVolume;

    // --- Core Boom-bap Beat ---
    let beatStep = 0;
    drumLoop = new Tone.Loop((time) => {
        // Kick: On beats 1 (0) and 2.5 (10)
        if (beatStep === 0 || beatStep === 10) {
            kickSynth?.triggerAttackRelease('C1', '8n', time, 0.8);
        }
        
        // Snare: On beats 2 (4) and 4 (12)
        if (beatStep === 4 || beatStep === 12) {
            snareSynth?.triggerAttackRelease('16n', time, 0.5);
        }
        
        // Hat: 8th notes (0,2,4,6...) with swing
        if (beatStep % 2 === 0) {
            const delayTime = (beatStep % 4 === 2) ? 0.05 : 0;
            const velocity = 0.4 + Math.random() * 0.3; 
            hatSynth?.triggerAttackRelease('32n', time + delayTime, velocity);
        }
        
        beatStep = (beatStep + 1) % 16;
    }, '16n');


    // --- Generative Chords & Bass ---
    let barStep = 0;
    chordLoop = new Tone.Loop((time) => {
        const chord = chords[barStep % chords.length];
        
        const velocity = 0.15 + Math.random() * 0.05;
        lofiSynth?.triggerAttackRelease(chord, '2n', time, velocity);
        
        const rootNote = chord[0];
        const bassNote = Tone.Frequency(rootNote).transpose(-12).toNote();
        
        bassSynth?.triggerAttackRelease(bassNote, '4n', time, 0.7);
        if (Math.random() > 0.5) {
            bassSynth?.triggerAttackRelease(bassNote, '8n', time + Tone.Time('4n.').toSeconds(), 0.5);
        }

        barStep++;
    }, '1m');

    // --- Playful Bell Arpeggios ---
    let arpStep = 0;
    arpLoop = new Tone.Loop((time) => {
        if (arpPattern.length > 0) {
            const currentChord = chords[barStep % chords.length]; 
            if (Math.random() > 0.6) {
                const noteIndex = arpPattern[arpStep % arpPattern.length];
                const tryNote = currentChord[noteIndex % currentChord.length];
                if (tryNote) {
                    const transposed = Tone.Frequency(tryNote).transpose(12).toNote();
                    arpSynth?.triggerAttackRelease(transposed, '16n', time, 0.12);
                }
            }
        }
        arpStep++;
    }, '8n');

    // Start playback (ensure we stop first so Tone.Noise doesn't layer instances if clicked rapidly)
    vinylNoise?.stop();
    vinylNoise?.start();
    
    // Rain weather mutes the internal track rain noise
    rainNoise?.stop();
    if (weather !== 'Rain') {
        rainNoise?.start();
    }

    drumLoop.start(0);
    chordLoop.start(0);
    arpLoop.start(0);
    
    Tone.Transport.start();
    isPlaying = true;
};

export const stopOtenkiBgm = () => {
    if (isPlaying) {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        vinylNoise?.stop();
        rainNoise?.stop();
        
        lofiSynth?.releaseAll();
        arpSynth?.releaseAll();
        kickSynth?.triggerRelease();
        bassSynth?.triggerRelease();
        
        if (drumLoop) { drumLoop.dispose(); drumLoop = null; }
        if (chordLoop) { chordLoop.dispose(); chordLoop = null; }
        if (arpLoop) { arpLoop.dispose(); arpLoop = null; }

        isPlaying = false;
    }
};
