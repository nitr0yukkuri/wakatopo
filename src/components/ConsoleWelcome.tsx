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
            'font-size: 13px; line-height: 1.05; font-weight: 900; color: #7dd3fc; text-shadow: 0 0 8px rgba(56, 189, 248, 0.55);',
        );
        console.log(
            '%c----------------------------------------',
            'font-size: 12px; color: #475569;',
        );
        console.log(
            '%c\u{1F680} Built with Next.js, React, Three.js & WebGL.',
            'font-size: 14px; color: #94a3b8;',
        );
        console.log(
            '%cLooking for bugs? Nice.',
            'font-size: 13px; color: #7dd3fc;',
        );
        console.log(
            '%cThanks for visiting! GitHub \u2192 https://github.com/nitr0yukkuri/wakatopo',
            'font-size: 12px; color: #64748b;',
        );
    }, []);

    return null;
}
