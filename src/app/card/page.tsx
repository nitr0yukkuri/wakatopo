import type { Metadata } from 'next';
import ClientInitializer from '@/components/ClientInitializer';
import { fetchPlanetData } from '@/lib/actions';
import type { SeasonEventType, SeasonType, WeatherType } from '@/store';
import { parseWorldStateRecord, resolveWorldState } from '@/lib/worldState';
import LivingCard from '@/components/living-card/LivingCard';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'WAKATO | Live Preview Capture', robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };

type SearchParams = {
    weather?: string | string[];
    season?: string | string[];
    seasonEvent?: string | string[];
};

export default async function CardPage({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const data = await fetchPlanetData();
    const routeState = parseWorldStateRecord((await searchParams) ?? {});
    const resolvedState = resolveWorldState(routeState, {
        weather: data.weather as WeatherType,
        season: data.season as SeasonType,
        seasonEvent: data.seasonEvent as SeasonEventType,
    });
    const weather = resolvedState.weather;
    const visualWeather = weather === 'Clear' ? 'Morning' : weather;

    return (
        <>
            {/* Preserve the surrounding portfolio runtime's initialization;
                the card itself never reads this store. */}
            <ClientInitializer
                initialWeather={visualWeather}
                initialSeason={resolvedState.season}
                initialSeasonEvent={resolvedState.seasonEvent}
                initialActivity={data.activityLevel}
            />
            <LivingCard
                world={resolvedState}
                activityLevel={data.activityLevel}
                title="WAKATO | LIVING PLANET"
            />
        </>
    );
}
