import { Suspense } from 'react';
import GitHubPlanetClient from './GitHubPlanetClient';
import SeoJsonLd from '@/components/SeoJsonLd';
import ProjectLinks from '@/components/ProjectLinks';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('github-planet', searchParams);
}

export default async function Page({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    return <>
        <SeoJsonLd page="github-planet" lang={lang} />
        <Suspense fallback={null}><GitHubPlanetClient /></Suspense>
        <ProjectLinks page="github-planet" lang={lang} />
    </>;
}
