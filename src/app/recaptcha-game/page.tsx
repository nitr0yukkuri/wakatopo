import { Suspense } from 'react';
import RecaptchaGameClient from './RecaptchaGameClient';
import SeoJsonLd from '@/components/SeoJsonLd';
import ProjectLinks from '@/components/ProjectLinks';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('recaptcha-game', searchParams);
}

export default async function Page({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    return <>
        <SeoJsonLd page="recaptcha-game" lang={lang} />
        <Suspense fallback={null}><RecaptchaGameClient /></Suspense>
        <ProjectLinks page="recaptcha-game" lang={lang} />
    </>;
}
