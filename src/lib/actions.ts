'use server'

type WeatherType = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';

// Open-Meteo WMO weather code → WeatherType
function mapWeatherCode(code: number): WeatherType {
    if (code === 0 || code === 1) return 'Clear';
    if (code === 2 || code === 3) return 'Clouds';
    if (code >= 45 && code <= 48) return 'Clouds';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain';
    if (code >= 85 && code <= 86) return 'Snow';
    if (code >= 95) return 'Thunder';
    return 'Clear';
}

export async function fetchPlanetData() {
    // サーバーのタイムゾーンに依存せず、常に日本時間(JST)で時刻を取得
    const jstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const hours = jstDate.getHours();

    let weather: WeatherType;

    if (hours < 5 || hours >= 22) {
        // 深夜〜早朝は無条件でNight
        weather = 'Night';
    } else {
        try {
            // Open-Meteo: 大阪 (lat=34.6937, lon=135.5023) / APIキー不要 / 30分キャッシュ
            const res = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=34.6937&longitude=135.5023&current=weather_code',
                { next: { revalidate: 1800 } }
            );
            if (!res.ok) throw new Error(`open-meteo ${res.status}`);
            const data = await res.json();
            const code: number = data.current.weather_code;
            const base = mapWeatherCode(code);
            // 5〜9時は晴れでも Morning に
            weather = base === 'Clear' && hours < 9 ? 'Morning' : base;
        } catch {
            // API失敗時は時間帯で fallback
            weather = hours < 9 ? 'Morning' : 'Clear';
        }
    }

    return {
        weather,
        contributions: 1240, // 年間コミット数
        activityLevel: 0.8,  // シェーダーに渡す「強さ」
    };
}