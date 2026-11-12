import { Suspense } from 'react';
import ColdKeepClient from './ColdKeepClient';
import SeoJsonLd from '@/components/SeoJsonLd';
import ProjectLinks from '@/components/ProjectLinks';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('coldkeep', searchParams);
}

export default async function Page({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    return <>
        <SeoJsonLd page="coldkeep" lang={lang} />
        <Suspense fallback={null}><ColdKeepClient /></Suspense>
        <ProjectLinks page="coldkeep" lang={lang} />
    </>;
}
