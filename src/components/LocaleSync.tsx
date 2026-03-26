'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LocaleSync() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
        document.documentElement.lang = lang;
        document.documentElement.dataset.lang = lang;
    }, [searchParams]);

    return null;
}
