import type { WorldState } from '@/lib/worldStateTypes';
import CardScene from './CardScene';
import WeatherEffectsVisual from '@/components/dom/WeatherEffectsVisual';

export type LivingCardProps = {
    world: WorldState;
    activityLevel: number;
    title: string;
    previewLabel?: string;
};

// The renderer receives a complete snapshot. It must not fetch weather or
// derive state from the portfolio's global store, URL, or clock.
export default function LivingCard({
    world,
    activityLevel,
    title,
    previewLabel = 'LIVE PREVIEW',
}: LivingCardProps) {
    const { weather } = world;
    // Preserve the existing capture palette for Clear.
    const visualWeather = weather === 'Clear' ? 'Morning' : weather;
    const visualWorld: WorldState = { ...world, weather: visualWeather };

    return (
        <main
            data-world-weather={visualWeather}
            data-preview-weather={weather}
            data-world-season={world.season}
            data-world-season-event={world.seasonEvent}
            className="card-capture-page relative flex h-[400px] w-[800px] select-none items-center justify-center overflow-hidden rounded-xl border border-cyan-100/10 bg-[#050505] text-white shadow-2xl"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_48%),linear-gradient(180deg,#050505_0%,#020204_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:linear-gradient(rgba(125,211,252,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.25)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-blue-300/40 to-transparent" />

            <div className="absolute inset-0 z-0">
                <CardScene world={visualWorld} activityLevel={activityLevel} showBackgroundStars={false} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10">
                <WeatherEffectsVisual world={visualWorld} includeRain includeGeshiSun={false} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_44%,rgba(0,0,0,0.3)_78%,rgba(0,0,0,0.62)_100%)]" />

            <div className="absolute bottom-5 left-6 z-30 font-mono text-xs tracking-[0.18em] text-cyan-100/70">
                <p className="mb-1 text-sm font-bold tracking-[0.2em] text-white">{title}</p>
                <p>STATUS: ACTIVE // WEATHER: {weather.toUpperCase()}</p>
            </div>

            <div className="absolute right-6 top-5 z-30 font-mono text-[10px] tracking-[0.24em] text-cyan-100/45">
                {previewLabel}
            </div>
        </main>
    );
}
