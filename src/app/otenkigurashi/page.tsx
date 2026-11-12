import { Suspense } from 'react';
import OtenkiGurashiClient from './OtenkiGurashiClient';
import SeoJsonLd from '@/components/SeoJsonLd';
import ProjectLinks from '@/components/ProjectLinks';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('otenkigurashi', searchParams);
}

export default async function Page({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    return <>
        <SeoJsonLd page="otenkigurashi" lang={lang} />
        <Suspense fallback={null}><OtenkiGurashiClient /></Suspense>
        <ProjectLinks page="otenkigurashi" lang={lang} />
    </>;
}
