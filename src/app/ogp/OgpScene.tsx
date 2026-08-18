'use client';

import { useEffect, useState } from 'react';
import ClientInitializer from '@/components/ClientInitializer';
import { SeasonalTransitionAtmosphere } from '@/components/GlobalTransitionOverlay';
import WeatherEffectsOverlay from '@/components/dom/WeatherEffectsOverlay';
import CardScene from '@/app/card/CardScene';
import { useStore } from '@/store';
import type { SeasonEventType, SeasonType, WeatherType } from '@/store';

type OgpStage = {
    id: string;
    label: string;
    weather: WeatherType;
    season: SeasonType;
    seasonEvent: SeasonEventType;
};

const OGP_STAGE_DURATION_MS = 950;
const OGP_ACTIVITY_LEVEL = 0.8;

const OGP_STAGES: OgpStage[] = [
    { id: 'spring-clear', label: 'SPRING / CLEAR', weather: 'Clear', season: 'spring', seasonEvent: 'none' },
    { id: 'summer-clouds', label: 'SUMMER / CLOUDS', weather: 'Clouds', season: 'summer', seasonEvent: 'none' },
    { id: 'summer-tsuyu', label: 'TSUYU / RAIN', weather: 'Rain', season: 'summer', seasonEvent: 'tsuyu' },
    { id: 'winter-snow', label: 'WINTER / SNOW', weather: 'Snow', season: 'winter', seasonEvent: 'none' },
];

export default function OgpScene() {
    const [stageIndex, setStageIndex] = useState(0);
    const setWorldState = useStore((state) => state.setWorldState);
    const stage = OGP_STAGES[stageIndex];

    useEffect(() => {
        setWorldState({
            weather: stage.weather,
            season: stage.season,
            seasonEvent: stage.seasonEvent,
        });
    }, [setWorldState, stage]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setStageIndex((current) => (current + 1) % OGP_STAGES.length);
        }, OGP_STAGE_DURATION_MS);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <main
            data-ogp-ready="true"
            data-ogp-stage={stage.id}
            className="relative flex h-[630px] w-[1200px] select-none items-center justify-center overflow-hidden bg-[#050505] text-white"
        >
            <ClientInitializer
                initialWeather={stage.weather}
                initialSeason={stage.season}
                initialSeasonEvent={stage.seasonEvent}
                initialActivity={OGP_ACTIVITY_LEVEL}
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_48%),linear-gradient(180deg,#050505_0%,#020204_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:linear-gradient(rgba(125,211,252,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.25)_1px,transparent_1px)] [background-size:40px_40px]" />

            <div className="absolute inset-0 z-0">
                <CardScene weather={stage.weather} activityLevel={OGP_ACTIVITY_LEVEL} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10">
                <WeatherEffectsOverlay weatherOverride={stage.weather} includeRain />
            </div>

            <SeasonalTransitionAtmosphere
                season={stage.season}
                seasonEvent={stage.seasonEvent}
                weather={stage.weather}
            />

            <div className="pointer-events-none absolute inset-0 z-[10001] bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_44%,rgba(0,0,0,0.3)_78%,rgba(0,0,0,0.62)_100%)]" />

            <div className="pointer-events-none absolute bottom-10 left-12 z-[10002] font-mono tracking-[0.18em] text-cyan-100/75">
                <p className="mb-2 text-2xl font-bold tracking-[0.2em] text-white">WAKATO | LIVING PLANET</p>
                <p className="text-sm">A PORTFOLIO THAT BREATHES WITH THE WORLD // {stage.label}</p>
            </div>

            <div className="pointer-events-none absolute right-12 top-10 z-[10002] font-mono text-xs tracking-[0.24em] text-cyan-100/45">
                LIVING SYSTEM / 01
            </div>
        </main>
    );
}
