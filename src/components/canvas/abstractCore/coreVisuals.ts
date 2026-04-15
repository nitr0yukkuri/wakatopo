import type { WeatherType } from '@/store';

export type CoreVisualProfile = {
    baseColor: string;
    hoverColor: string;
    activeColor: string;
    meshOpacity: number;
    wireOpacity: number;
    innerOpacity: number;
    ringPulse: number;
    orbitTilt: number;
    particleSize: number;
};

export const CORE_VISUALS: Record<WeatherType, CoreVisualProfile> = {
    Clear: {
        baseColor: '#00ecff',
        hoverColor: '#64f3ff',
        activeColor: '#d4fdff',
        meshOpacity: 0.18,
        wireOpacity: 0.14,
        innerOpacity: 0.08,
        ringPulse: 0.55,
        orbitTilt: 0.12,
        particleSize: 0.03,
    },
    Morning: {
        baseColor: '#ffb26b',
        hoverColor: '#ffd18f',
        activeColor: '#ffe7bf',
        meshOpacity: 0.16,
        wireOpacity: 0.12,
        innerOpacity: 0.06,
        ringPulse: 0.42,
        orbitTilt: 0.125,
        particleSize: 0.028,
    },
    Clouds: {
        baseColor: '#b8c2cc',
        hoverColor: '#e2e8ee',
        activeColor: '#f4f7fb',
        meshOpacity: 0.2,
        wireOpacity: 0.18,
        innerOpacity: 0.1,
        ringPulse: 0.68,
        orbitTilt: 0.118,
        particleSize: 0.032,
    },
    Rain: {
        baseColor: '#246dff',
        hoverColor: '#4da3ff',
        activeColor: '#93cfff',
        meshOpacity: 0.24,
        wireOpacity: 0.22,
        innerOpacity: 0.12,
        ringPulse: 0.86,
        orbitTilt: 0.123,
        particleSize: 0.036,
    },
    Thunder: {
        baseColor: '#7a39ff',
        hoverColor: '#b287ff',
        activeColor: '#dbc4ff',
        meshOpacity: 0.3,
        wireOpacity: 0.26,
        innerOpacity: 0.14,
        ringPulse: 1.08,
        orbitTilt: 0.126,
        particleSize: 0.041,
    },
    Snow: {
        baseColor: '#d9f4ff',
        hoverColor: '#f3fbff',
        activeColor: '#ffffff',
        meshOpacity: 0.17,
        wireOpacity: 0.14,
        innerOpacity: 0.07,
        ringPulse: 0.5,
        orbitTilt: 0.121,
        particleSize: 0.029,
    },
    Night: {
        baseColor: '#102b8f',
        hoverColor: '#365cc9',
        activeColor: '#7ca0ff',
        meshOpacity: 0.28,
        wireOpacity: 0.24,
        innerOpacity: 0.13,
        ringPulse: 0.96,
        orbitTilt: 0.124,
        particleSize: 0.039,
    },
};
