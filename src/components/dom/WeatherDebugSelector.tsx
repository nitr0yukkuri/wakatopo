'use client';

import { useStore, WeatherType } from '@/store';

const WEATHERS: WeatherType[] = ['Morning', 'Clouds', 'Rain', 'Thunder', 'Snow', 'Night'];

const COLOR: Record<WeatherType, string> = {
    Clear: 'text-orange-400  border-orange-400/60',
    Morning: 'text-yellow-300  border-yellow-300/60',
    Clouds: 'text-gray-400    border-gray-400/60',
    Rain: 'text-blue-400    border-blue-400/60',
    Thunder: 'text-purple-400  border-purple-400/60',
    Snow: 'text-cyan-200    border-cyan-200/60',
    Night: 'text-indigo-400  border-indigo-400/60',
};

export default function WeatherDebugSelector() {
    const { weather, setWeather } = useStore();

    return (
        <div className="flex flex-col gap-1 mt-2 border-l border-gray-800 pl-4">
            <span className="text-gray-600 text-[10px] tracking-widest">DEBUG / WTHR</span>
            <div className="flex flex-wrap gap-1">
                {WEATHERS.map((w) => (
                    <button
                        key={w}
                        onClick={() => setWeather(w)}
                        className={`text-[10px] font-mono tracking-wider px-1.5 py-0.5 border rounded-sm transition-all ${weather === w
                            ? `${COLOR[w]} bg-white/10`
                            : 'text-gray-600 border-gray-700 hover:text-gray-400 hover:border-gray-500'
                            }`}
                    >
                        {w.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}
