import type { Metadata } from 'next';
import OgpScene from './OgpScene';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'WAKATO | Living Planet OGP Capture',
    robots: {
        index: false,
        follow: false,
    },
};

export default function OgpPage() {
    return <OgpScene />;
}
