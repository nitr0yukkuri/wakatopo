'use client';

import BirthdayFireworksCanvas from '@/components/canvas/BirthdayFireworksCanvas';
import { useWorldState } from '@/components/WorldStateProvider';

export default function BirthdayHomeOverlay() {
    const { seasonEvent } = useWorldState();

    if (seasonEvent !== 'birthday') return null;

    return <BirthdayFireworksCanvas />;
}
