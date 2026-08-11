'use client';

import { useEffect } from 'react';

// Keep the source ASCII-only so the console art survives every repository encoding.
const WAKATO_ASCII = `
##   ##   ###   ##  ##   ###   ######   ####
##   ##  ## ##  ## ##   ## ##    ##    ##  ##
## # ## ##   ## ####   ##   ##   ##    ##  ##
####### ####### ## ##  #######   ##    ##  ##
## # ## ##   ## ##  ## ##   ##   ##    ##  ##
##   ## ##   ## ##  ## ##   ##   ##    ##  ##
##   ## ##   ## ##  ## ##   ## ######   ####
`;

export default function ConsoleWelcome() {
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;

        console.log(
            '%cWAKATO | Living Planet',
            'font-size: 28px; font-weight: 900; color: #7dd3fc; text-shadow: 3px 3px 0 #1e3a8a;',
        );
        console.log(
            `%c${WAKATO_ASCII}`,
            'font-size: 13px; line-height: 1.05; font-weight: 900; color: #86efac; text-shadow: 0 0 8px rgba(74, 222, 128, 0.55);',
        );
        console.log(
            '%c\u{1F30D} The world changes with weather, time, and you.',
            'font-size: 14px; color: #94a3b8;',
        );
        console.log(
            '%c\u{1F440} Looking for bugs? Nice. GitHub \u2192 https://github.com/nitr0yukkuri/wakatopo',
            'font-size: 12px; color: #64748b;',
        );
    }, []);

    return null;
}
