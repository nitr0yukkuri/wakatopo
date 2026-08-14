import type { SeasonEventType, SeasonType } from '@/store';

export type ResolvedSeasonState = {
    season: SeasonType;
    seasonEvent: SeasonEventType;
};

type JapanDateParts = {
    month: number;
    day: number;
};

function getJapanDateParts(date: Date): JapanDateParts {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);

    return {
        month: Number(parts.find((part) => part.type === 'month')?.value ?? 1),
        day: Number(parts.find((part) => part.type === 'day')?.value ?? 1),
    };
}

function resolveSeason(month: number): SeasonType {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

function resolveSeasonEvent(month: number, day: number): SeasonEventType {
    // 夏至は梅雨の雰囲気より優先して、専用の演出を選ぶ。
    if (month === 6 && day === 21) return 'geshi';

    // 梅雨は日本の季節感に合わせた固定期間で表現する。
    if ((month === 6 && day >= 7) || (month === 7 && day <= 20)) return 'tsuyu';

    return 'none';
}

export function resolveSeasonState(date = new Date()): ResolvedSeasonState {
    const { month, day } = getJapanDateParts(date);
    return {
        season: resolveSeason(month),
        seasonEvent: resolveSeasonEvent(month, day),
    };
}
