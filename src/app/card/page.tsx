import ClientInitializer from '@/components/ClientInitializer';
import { fetchPlanetData } from '@/lib/actions';
import type { WeatherType } from '@/store';
import CardScene from './CardScene';

export const dynamic = 'force-dynamic';

export default async function CardPage() {
    const data = await fetchPlanetData();

    return (
        <main className="relative flex h-[400px] w-[800px] select-none items-center justify-center overflow-hidden rounded-xl border border-cyan-100/10 bg-[#070911] text-white shadow-2xl">
            <ClientInitializer
                initialWeather={data.weather as WeatherType}
                initialActivity={data.activityLevel}
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_48%),linear-gradient(180deg,#070911_0%,#04060c_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:linear-gradient(rgba(125,211,252,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.25)_1px,transparent_1px)] [background-size:40px_40px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-blue-300/40 to-transparent" />

            <div className="absolute inset-0">
                <CardScene />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,transparent_44%,rgba(0,0,0,0.3)_78%,rgba(0,0,0,0.62)_100%)]" />

            <div className="absolute bottom-5 left-6 z-10 font-mono text-xs tracking-[0.18em] text-cyan-100/70">
                <p className="mb-1 text-sm font-bold tracking-[0.2em] text-white">WAKATO | LIVING PLANET</p>
                <p>STATUS: ACTIVE // WEATHER: {data.weather.toUpperCase()}</p>
            </div>

            <div className="absolute right-6 top-5 z-10 font-mono text-[10px] tracking-[0.24em] text-cyan-100/45">
                LIVE PREVIEW
            </div>
        </main>
    );
}
