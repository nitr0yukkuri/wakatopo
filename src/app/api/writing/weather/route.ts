import { getWritingWeather } from '@/lib/writing/weather';

export async function GET() {
    const weather = await getWritingWeather();
    return Response.json(
        { weather },
        { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' } },
    );
}
