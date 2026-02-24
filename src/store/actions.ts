// src/lib/actions.ts
'use server'

export async function fetchPlanetData() {
    // 実際にはここで GitHub GraphQL API と OpenWeather API を叩く
    // const weatherRes = await fetch(...);

    // シミュレーション用データ
    const hours = new Date().getHours();
    const isNight = hours < 6 || hours > 18;

    return {
        weather: isNight ? 'Night' : 'Rain', // テスト用に「雨」か「夜」を返す
        contributions: 1240, // 年間コミット数
        activityLevel: 0.8, // シェーダーに渡す「強さ」
    };
}