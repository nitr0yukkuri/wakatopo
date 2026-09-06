'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
    formatWritingTime,
    getWritingTheme,
    getWritingTimeBand,
    getWritingWeatherLabel,
    getWritingWeatherWash,
    type WritingTimeBand,
    type WritingWeather,
} from '@/lib/writing/theme';

type Props = {
    initialTimeBand: WritingTimeBand;
    initialWeather: WritingWeather;
    lockTimeBand?: boolean;
    lockWeather?: boolean;
    children: ReactNode;
};

function getThemeStyle(timeBand: WritingTimeBand, weather: WritingWeather) {
    const theme = getWritingTheme(timeBand);
    return {
        '--writing-bg': theme.background,
        '--writing-surface': theme.surface,
        '--writing-text': theme.text,
        '--writing-secondary': theme.secondary,
        '--writing-border': theme.border,
        '--writing-accent': theme.accent,
        '--writing-weather-wash': getWritingWeatherWash(weather),
    } as CSSProperties;
}

export default function WritingShell({
    initialTimeBand,
    initialWeather,
    lockTimeBand = false,
    lockWeather = false,
    children,
}: Props) {
    const [timeBand, setTimeBand] = useState(initialTimeBand);
    const [weather, setWeather] = useState(initialWeather);
    const [timeLabel, setTimeLabel] = useState(() => formatWritingTime(new Date()));

    useEffect(() => {
        let disposed = false;
        const updateTime = () => {
            const now = new Date();
            setTimeLabel(formatWritingTime(now));
            if (!lockTimeBand) setTimeBand(getWritingTimeBand(now));
        };

        updateTime();
        const timeTimer = lockTimeBand ? undefined : window.setInterval(updateTime, 60000);

        if (!lockWeather) {
            fetch('/api/writing/weather')
                .then((response) => response.ok ? response.json() : Promise.reject(new Error('weather request failed')))
                .then((payload: { weather?: WritingWeather }) => {
                    if (!disposed && payload.weather) setWeather(payload.weather);
                })
                .catch(() => {
                    if (!disposed) setWeather('unavailable');
                });
        }

        return () => {
            disposed = true;
            if (timeTimer) window.clearInterval(timeTimer);
        };
    }, [lockTimeBand, lockWeather]);

    return (
        <div
            className={'writing-site writing-time-' + timeBand + ' writing-weather-' + weather}
            data-writing-time={timeBand}
            data-writing-weather={weather}
            style={getThemeStyle(timeBand, weather)}
        >
            <div className="writing-ambient" aria-hidden="true" />
            <div className="writing-site-inner">
                <div className="writing-environment" aria-label="現在の環境情報">
                    <span>JST {timeLabel}</span>
                    <span aria-hidden="true">/</span>
                    <span>{getWritingWeatherLabel(weather)}</span>
                </div>
                {children}
            </div>
        </div>
    );
}
