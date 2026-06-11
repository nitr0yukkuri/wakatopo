import { Suspense } from 'react';
import OtenkiGurashiClient from './OtenkiGurashiClient';

export const dynamic = 'force-dynamic';

export default function OtenkiGurashiPage() {
    return (
        <Suspense fallback={null}>
            <OtenkiGurashiClient />
        </Suspense>
    );
}
