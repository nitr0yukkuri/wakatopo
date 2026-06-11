import { Suspense } from 'react';
import DenshouoClient from './DenshouoClient';

export const dynamic = 'force-dynamic';

export default function DenshouoPage() {
    return (
        <Suspense fallback={null}>
            <DenshouoClient />
        </Suspense>
    );
}
