'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
});

export default function SceneClient() {
    return <Scene />;
}
