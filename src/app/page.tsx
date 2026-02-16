import Scene from '@/components/canvas/Scene';
import { fetchPlanetData } from '@/lib/actions';
import ClientInitializer from '@/components/ClientInitializer';

export default async function Home() {
  const data = await fetchPlanetData();

  return (
    <main className="relative w-full h-screen overflow-hidden text-white font-mono">
      <ClientInitializer
        initialWeather={data.weather as any}
        initialActivity={data.activityLevel}
      />
      <Scene />
      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter mb-2">
              LIVING PLANET
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-sm text-gray-400">System Status: ONLINE</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 border border-gray-800 p-2 rounded bg-black/50 backdrop-blur-md">
            <p>LOCATION: OSAKA, JP</p>
            <p>WEATHER: {data.weather.toUpperCase()}</p>
            <p>GITHUB CONTR: {data.contributions}</p>
          </div>
        </header>
        <footer className="pointer-events-auto">
          <p className="max-w-md text-sm text-gray-300 leading-relaxed bg-black/30 p-4 rounded backdrop-blur-sm border-l-2 border-blue-500">
            "Code breathes with the atmosphere."<br />
            This planet evolves based on my GitHub contributions and the real-world weather in Osaka.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            [ Drag to Rotate ]
          </div>
        </footer>
      </div>
    </main>
  );
}