import type { CSSProperties } from 'react';

export const AUTUMN_BACKGROUND_GRADIENT =
    'linear-gradient(180deg, #c7ded9 0%, #f1e6ce 50%, #e4b36f 100%)';

export const WINTER_BACKGROUND_GRADIENT =
    'linear-gradient(180deg, #aebdcb 0%, #d8e4ec 48%, #ffffff 100%)';

export const AUTUMN_LEAF_CLIP_PATH =
    // Medium-length lobes preserve a maple silhouette without reading as a star.
    'polygon(47% 4%, 53% 4%, 58% 29%, 73% 22%, 77% 26%, 67% 46%, 88% 48%, 91% 53%, 68% 62%, 69% 82%, 63% 86%, 50% 71%, 37% 86%, 31% 82%, 32% 62%, 9% 53%, 12% 48%, 33% 46%, 23% 26%, 27% 22%, 42% 29%)';

export const AUTUMN_LEAF_FILTER = 'drop-shadow(0 2px 3px rgba(105,55,29,0.18))';
export const AUTUMN_LEAF_OPACITY = 0.86;
export const AUTUMN_LEAF_ANIMATION_NAME = 'otenki-momiji-fall';

const seasonalValue = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
    return value - Math.floor(value);
};

export type AutumnLeafSpec = {
    left: number;
    duration: number;
    delay: number;
    size: number;
    drift: number;
    rotate: number;
    tone: number;
};

// Both the final page and the route transition consume this same deterministic
// dataset so leaves keep the same size, speed, color, and drift across the boundary.
export const AUTUMN_LEAF_SPECS: AutumnLeafSpec[] = Array.from({ length: 20 }, (_, index) => {
    const duration = 9 + seasonalValue(index, 13) * 7;

    return {
        left: seasonalValue(index, 11) * 100,
        duration,
        delay: -(seasonalValue(index, 12) * duration),
        size: 13 + seasonalValue(index, 14) * 11,
        drift: -42 + seasonalValue(index, 15) * 84,
        rotate: seasonalValue(index, 16) * 360,
        tone: seasonalValue(index, 17),
    };
});

export const autumnLeafBackground = (tone: number) => tone > 0.6
    ? 'linear-gradient(135deg, rgba(224,96,40,0.90), rgba(143,48,28,0.72))'
    : tone > 0.28
        ? 'linear-gradient(135deg, rgba(238,156,39,0.88), rgba(181,81,30,0.68))'
        : 'linear-gradient(135deg, rgba(247,191,54,0.86), rgba(194,105,30,0.64))';

export const autumnLeafStyle = (leaf: AutumnLeafSpec): CSSProperties => ({
    left: `${leaf.left}%`,
    top: '-8%',
    width: leaf.size,
    height: leaf.size * 0.92,
    display: 'block',
    clipPath: AUTUMN_LEAF_CLIP_PATH,
    background: autumnLeafBackground(leaf.tone),
    filter: AUTUMN_LEAF_FILTER,
    transform: `rotate(${leaf.rotate}deg)`,
    opacity: AUTUMN_LEAF_OPACITY,
    animation: `${AUTUMN_LEAF_ANIMATION_NAME} ${leaf.duration}s linear ${leaf.delay}s infinite`,
    ['--autumn-drift' as string]: `${leaf.drift}px`,
});
