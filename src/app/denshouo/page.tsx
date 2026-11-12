import { Suspense } from 'react';
import DenshouoClient from './DenshouoClient';
import SeoJsonLd from '@/components/SeoJsonLd';
import ProjectLinks from '@/components/ProjectLinks';
import { getLang, getPageMetadata, type SeoPageProps } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: SeoPageProps) {
    return getPageMetadata('denshouo', searchParams);
}

export default async function Page({ searchParams }: SeoPageProps) {
    const lang = getLang(await searchParams);
    return <>
        <SeoJsonLd page="denshouo" lang={lang} />
        <Suspense fallback={null}><DenshouoClient /></Suspense>
        <ProjectLinks page="denshouo" lang={lang} />
    </>;
}
