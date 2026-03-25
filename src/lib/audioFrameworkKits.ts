export type AudioFrameworkKit = {
    id: 'native-web-audio' | 'tone-js' | 'howler-js' | 'three-positional';
    title: string;
    packageName: string;
    strengths: string[];
    underwaterPreset: {
        lowpassHz: number;
        wetMix: number;
        compressorRatio: number;
        noteLengthSec: number;
        bpmHint: number;
    };
    installCommand: string;
};

// Research-backed options for underwater storytelling sound design.
export const AUDIO_FRAMEWORK_KITS: AudioFrameworkKit[] = [
    {
        id: 'native-web-audio',
        title: 'Web Audio API (native)',
        packageName: 'built-in',
        strengths: [
            'No dependency and maximum control over node graph',
            'Convolver, filters, panner, compressor available by default',
            'Best for procedural BGM/SFX synthesis',
        ],
        underwaterPreset: {
            lowpassHz: 1700,
            wetMix: 0.56,
            compressorRatio: 2.1,
            noteLengthSec: 2.1,
            bpmHint: 64,
        },
        installCommand: 'none',
    },
    {
        id: 'tone-js',
        title: 'Tone.js',
        packageName: 'tone',
        strengths: [
            'DAW-like transport and musical scheduling',
            'Large set of synths/effects with routing primitives',
            'Strong fit for melodic ambient loops',
        ],
        underwaterPreset: {
            lowpassHz: 1600,
            wetMix: 0.5,
            compressorRatio: 2,
            noteLengthSec: 2.4,
            bpmHint: 62,
        },
        installCommand: 'npm install tone',
    },
    {
        id: 'howler-js',
        title: 'howler.js',
        packageName: 'howler',
        strengths: [
            'Simple API and excellent browser compatibility',
            'Good for sample-based ambient beds and sprites',
            'Spatial/stereo plugin available with minimal setup',
        ],
        underwaterPreset: {
            lowpassHz: 1900,
            wetMix: 0.42,
            compressorRatio: 1.8,
            noteLengthSec: 2.6,
            bpmHint: 60,
        },
        installCommand: 'npm install howler',
    },
    {
        id: 'three-positional',
        title: 'three.js PositionalAudio',
        packageName: 'three',
        strengths: [
            '3D positional immersion with listener/source model',
            'Natural fit for scene-based ocean ambience',
            'Integrates with existing r3f/three worlds',
        ],
        underwaterPreset: {
            lowpassHz: 1500,
            wetMix: 0.62,
            compressorRatio: 2,
            noteLengthSec: 2.8,
            bpmHint: 58,
        },
        installCommand: 'npm install three',
    },
];

export const getAudioFrameworkKit = (id: AudioFrameworkKit['id']) => {
    return AUDIO_FRAMEWORK_KITS.find((kit) => kit.id === id) ?? AUDIO_FRAMEWORK_KITS[0];
};
