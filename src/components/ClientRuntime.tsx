'use client';

import dynamic from 'next/dynamic';
import ConsoleWelcome from '@/components/ConsoleWelcome';
import WorldStateProvider from '@/components/WorldStateProvider';

const PwaRegister = dynamic(() => import('@/components/PwaRegister'), { ssr: false });
const SoundDirector = dynamic(() => import('@/components/SoundDirector'), { ssr: false });
const GlobalTransitionOverlay = dynamic(() => import('@/components/GlobalTransitionOverlay'), { ssr: false });

export default function ClientRuntime() {
    return (
        <>
            <PwaRegister />
            <ConsoleWelcome />
            <WorldStateProvider>
                <SoundDirector />
                <GlobalTransitionOverlay />
            </WorldStateProvider>
        </>
    );
}
