'use server'

export async function fetchPlanetData() {
    // サーバーのタイムゾーンに依存せず、常に日本時間(JST)で時刻を取得
    const jstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const hours = jstDate.getHours();

    const isNight = hours < 6 || hours > 18;

    return {
        weather: isNight ? 'Night' : 'Rain', // テスト用に「雨」か「夜」を返す
        contributions: 1240, // 年間コミット数
        activityLevel: 0.8, // シェーダーに渡す「強さ」
    };
}