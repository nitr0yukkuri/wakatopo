'use client';

import type { WeatherType } from '@/lib/worldStateTypes';
import { useWorldState } from '@/components/WorldStateProvider';
import WeatherVisual from './WeatherVisual';

export default function Weather({ weatherOverride }: { weatherOverride?: WeatherType } = {}) {
    const world = useWorldState();
    return <WeatherVisual weather={weatherOverride ?? world.weather} />;
}
