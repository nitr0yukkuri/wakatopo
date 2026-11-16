const STATE_ATTRIBUTES = [
    ['weather', 'data-preview-weather'],
    ['visualWeather', 'data-world-weather'],
    ['season', 'data-world-season'],
    ['seasonEvent', 'data-world-season-event'],
];

export function parseWeatherPreviewState(html, sourceRevision) {
    if (typeof html !== 'string') {
        throw new TypeError('Weather preview HTML must be a string.');
    }

    if (typeof sourceRevision !== 'string' || sourceRevision.length === 0) {
        throw new TypeError('Weather preview source revision must be a non-empty string.');
    }

    const mainTag = html.match(/<main\b[^>]*>/i)?.[0];
    if (!mainTag) {
        throw new Error('Weather preview HTML does not contain its main element.');
    }

    const values = Object.fromEntries(STATE_ATTRIBUTES.map(([key, attribute]) => {
        const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const value = mainTag.match(new RegExp(`(?:^|\\s)${escapedAttribute}="([^"]+)"`, 'i'))?.[1];
        if (!value) {
            throw new Error(`Weather preview HTML is missing ${attribute}.`);
        }
        return [key, value];
    }));

    return {
        version: 1,
        sourceRevision,
        ...values,
    };
}

export function isSameWeatherPreviewState(current, previous) {
    if (!current || !previous || current.version !== previous.version) {
        return false;
    }

    return ['sourceRevision', 'weather', 'visualWeather', 'season', 'seasonEvent']
        .every((key) => current[key] === previous[key]);
}

export function serializeWeatherPreviewState(state) {
    return `${JSON.stringify(state, null, 2)}\n`;
}
