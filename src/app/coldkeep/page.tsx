import { Suspense } from 'react';
import ColdKeepClient from './ColdKeepClient';

export const dynamic = 'force-dynamic';

export default function ColdKeepPage() {
    return (
        <Suspense fallback={null}>
            <ColdKeepClient />
        </Suspense>
    );
}
