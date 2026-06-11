'use client'

import { type SeasonEventType, type SeasonType, type WeatherType } from '@/store';
import { useMemo } from 'react';

const seasonalValue = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
    return value - Math.floor(value);
};

export default function OtenkiSeasonEffects({
    season,
    seasonEvent,
    weather,
}: {
    season: SeasonType;
    seasonEvent: SeasonEventType;
    weather: WeatherType;
}) {
    const springPetals = useMemo(
        () => Array.from({ length: 16 }, (_, index) => ({
            left: seasonalValue(index, 1) * 100,
            delay: seasonalValue(index, 2) * 8,
            duration: 13 + seasonalValue(index, 3) * 7,
            size: 8 + seasonalValue(index, 4) * 7,
            drift: -36 + seasonalValue(index, 5) * 72,
            rotate: seasonalValue(index, 6) * 360,
        })),
        []
    );
    const autumnLeaves = useMemo(
        () => Array.from({ length: 14 }, (_, index) => ({
            left: seasonalValue(index, 11) * 100,
            delay: seasonalValue(index, 12) * 8,
            duration: 12 + seasonalValue(index, 13) * 8,
            size: 9 + seasonalValue(index, 14) * 8,
            drift: -42 + seasonalValue(index, 15) * 84,
            rotate: seasonalValue(index, 16) * 360,
            tone: seasonalValue(index, 17),
        })),
        []
    );
    const isClear = weather === 'Clear' || weather === 'Morning';
    const showSpring = season === 'spring' && isClear;
    const showGeshi = season === 'summer' && seasonEvent === 'geshi' && isClear;
    const showAutumn = season === 'autumn';
    const showWinter = season === 'winter';

    if (!showSpring && !showGeshi && !showAutumn && !showWinter) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
            {showGeshi && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: [
                            'radial-gradient(circle at 82% 12%, rgba(255,236,154,0.26) 0%, rgba(255,219,112,0.10) 26%, transparent 48%)',
                            'linear-gradient(to bottom, rgba(255,246,203,0.16) 0%, rgba(255,244,196,0.06) 38%, transparent 72%)',
                        ].join(', '),
                    }}
                />
            )}

            {showWinter && (
                <div
                    className="absolute inset-x-0 bottom-0 h-[34vh]"
                    style={{
                        background: 'linear-gradient(to top, rgba(255,255,255,0.74) 0%, rgba(240,248,252,0.48) 34%, rgba(232,244,250,0.16) 68%, transparent 100%)',
                    }}
                />
            )}

            {showSpring && springPetals.map((petal, index) => (
                <div
                    key={`otenki-sakura-${index}`}
                    className="absolute rounded-[70%_30%_70%_30%]"
                    style={{
                        left: `${petal.left}%`,
                        top: '-8%',
                        width: petal.size,
                        height: petal.size * 0.58,
                        background: 'linear-gradient(135deg, rgba(255,238,244,0.92), rgba(255,176,203,0.58))',
                        transform: `rotate(${petal.rotate}deg)`,
                        opacity: 0.62,
                        animation: `otenki-season-fall ${petal.duration}s linear ${petal.delay}s infinite`,
                        ['--season-drift' as string]: `${petal.drift}px`,
                    }}
                />
            ))}

            {showAutumn && autumnLeaves.map((leaf, index) => (
                <div
                    key={`otenki-momiji-${index}`}
                    className="absolute"
                    style={{
                        left: `${leaf.left}%`,
                        top: '-8%',
                        width: leaf.size,
                        height: leaf.size * 0.72,
                        borderRadius: '70% 30% 70% 30%',
                        background: leaf.tone > 0.6
                            ? 'linear-gradient(135deg, rgba(220,121,48,0.82), rgba(150,76,31,0.52))'
                            : 'linear-gradient(135deg, rgba(236,178,67,0.78), rgba(184,104,38,0.50))',
                        transform: `rotate(${leaf.rotate}deg)`,
                        opacity: 0.54,
                        animation: `otenki-season-fall ${leaf.duration}s linear ${leaf.delay}s infinite`,
                        ['--season-drift' as string]: `${leaf.drift}px`,
                    }}
                />
            ))}

            <style>{`
                @keyframes otenki-season-fall {
                    0% {
                        transform: translate3d(0, -10vh, 0) rotate(0deg);
                        opacity: 0;
                    }
                    12% {
                        opacity: 0.62;
                    }
                    100% {
                        transform: translate3d(var(--season-drift), 112vh, 0) rotate(460deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
