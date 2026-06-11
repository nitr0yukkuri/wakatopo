import { Suspense } from 'react';
import GitHubPlanetClient from './GitHubPlanetClient';

export const dynamic = 'force-dynamic';

export default function GitHubPlanetPage() {
    return (
        <Suspense fallback={null}>
            <GitHubPlanetClient />
        </Suspense>
    );
}
