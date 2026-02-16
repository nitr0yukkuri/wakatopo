'use server'

export async function fetchPlanetData() {
    // シミュレーション用データ
    const hours = new Date().getHours();
    const isNight = hours < 6 || hours > 18;

    return {
        weather: isNight ? 'Night' : 'Rain', // テスト用に「雨」か「夜」を返す
        contributions: 1240, // 年間コミット数
        activityLevel: 0.8, // シェーダーに渡す「強さ」
    };
}