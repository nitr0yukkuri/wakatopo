import { Suspense } from 'react';
import RecaptchaGameClient from './RecaptchaGameClient';

export const dynamic = 'force-dynamic';

export default function RecaptchaGamePage() {
    return (
        <Suspense fallback={null}>
            <RecaptchaGameClient />
        </Suspense>
    );
}
