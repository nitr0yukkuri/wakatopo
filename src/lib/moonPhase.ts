const SYNODIC_MONTH_DAYS = 29.530588853;
const DAY_MS = 24 * 60 * 60 * 1000;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);
const DECORATIVE_FULL_MOON_THRESHOLD = 0.08;

const normalizePhase = (phase: number) => ((phase % 1) + 1) % 1;

/** Avoids a visually broken sliver by using a simple round moon near new moon. */
export const getDisplayMoonPhase = (phase: number) => {
    const normalized = normalizePhase(phase);
    const distanceFromNew = Math.min(normalized, 1 - normalized);
    return distanceFromNew <= DECORATIVE_FULL_MOON_THRESHOLD ? 0.5 : normalized;
};

/** Returns the lunar phase in the range [0, 1): new moon = 0, full moon = 0.5. */
export const getMoonPhase = (date = new Date()) => {
    const elapsedDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS;
    return normalizePhase(elapsedDays / SYNODIC_MONTH_DAYS);
};

/** Builds the illuminated portion of a moon as an SVG path. */
export const getMoonPhasePath = (phase: number, radius = 50) => {
    const normalized = normalizePhase(phase);
    if (normalized < 0.0001 || normalized > 0.9999) return '';
    if (Math.abs(normalized - 0.5) < 0.0001) {
        return `M 0 ${-radius} A ${radius} ${radius} 0 1 1 0 ${radius} A ${radius} ${radius} 0 1 1 0 ${-radius} Z`;
    }

    const terminatorRadius = Math.max(radius * 0.16, Math.abs(Math.cos(normalized * Math.PI * 2)) * radius);
    if (normalized < 0.5) {
        const terminatorSweep = normalized < 0.25 ? 0 : 1;
        return `M 0 ${-radius} A ${radius} ${radius} 0 0 1 0 ${radius} A ${terminatorRadius} ${radius} 0 0 ${terminatorSweep} 0 ${-radius} Z`;
    }

    const terminatorSweep = normalized < 0.75 ? 0 : 1;
    return `M 0 ${-radius} A ${radius} ${radius} 0 0 0 0 ${radius} A ${terminatorRadius} ${radius} 0 0 ${terminatorSweep} 0 ${-radius} Z`;
};

/** Returns the soft terminator position and illuminated side for the SVG mask. */
export const getMoonPhaseMask = (phase: number) => {
    const normalized = normalizePhase(phase);
    return {
        boundaryPercent: normalized <= 0.5 ? 100 - normalized * 200 : (1 - normalized) * 200,
        illuminatedSide: normalized <= 0.5 ? 'right' as const : 'left' as const,
        isNew: normalized < 0.0001 || normalized > 0.9999,
        isFull: Math.abs(normalized - 0.5) < 0.0001,
    };
};

/** Parses the optional preview query value without affecting normal URLs. */
export const parseMoonPhaseOverride = (value: string | null) => {
    if (value === null || value.trim() === '') return null;
    const phase = Number(value);
    return Number.isFinite(phase) ? normalizePhase(phase) : null;
};
