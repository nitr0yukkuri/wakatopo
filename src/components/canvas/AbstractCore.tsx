'use client';

import { useStore } from '@/store';
import { useWorldState } from '@/components/WorldStateProvider';
import type { WeatherType } from '@/lib/worldStateTypes';
import AbstractCoreVisual from './AbstractCoreVisual';

// Portfolio adapter: capture renderers pass their own snapshot directly.
export default function AbstractCore({
    weatherOverride,
    activityOverride,
}: {
    weatherOverride?: WeatherType;
    activityOverride?: number;
} = {}) {
    const activityLevel = useStore((state) => state.githubActivityLevel);
    const world = useWorldState();
    return <AbstractCoreVisual
        world={{ ...world, weather: weatherOverride ?? world.weather }}
        activityLevel={activityOverride ?? activityLevel}
    />;
}
