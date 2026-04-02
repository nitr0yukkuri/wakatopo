'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

const Scene = dynamic(() => import('./Scene'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
});

export default function SceneClient() {
    const [isSceneReady, setIsSceneReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showLoader, setShowLoader] = useState(true);

    const handleSceneReady = useCallback(() => {
        setIsSceneReady(true);
    }, []);

    useEffect(() => {
        if (!showLoader) return;

        const interval = window.setInterval(() => {
            setProgress((prev) => {
                if (isSceneReady) {
                    return prev >= 100 ? 100 : prev + Math.max(1, Math.ceil((100 - prev) * 0.28));
                }

                // Keep moving while loading but stop short of complete until the scene is actually ready.
                return prev >= 92 ? 92 : prev + Math.max(1, Math.ceil((92 - prev) * 0.12));
            });
        }, 36);

        return () => {
            window.clearInterval(interval);
        };
    }, [isSceneReady, showLoader]);

    useEffect(() => {
        if (!isSceneReady || progress < 100) return;

        const timeout = window.setTimeout(() => {
            setShowLoader(false);
        }, 120);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [isSceneReady, progress]);

    return (
        <>
            <Scene onSceneReady={handleSceneReady} />
            <div
                className={`absolute inset-0 z-20 flex items-center justify-center bg-black transition-opacity duration-300 ${showLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                aria-hidden={!showLoader}
            >
                <div className="w-[min(76vw,520px)] px-6">
                    <div className="mb-3 flex items-baseline justify-between font-mono tracking-[0.18em] text-[10px] text-gray-400">
                        <span>INITIALIZING PLANET</span>
                        <span>{String(progress).padStart(3, '0')}%</span>
                    </div>
                    <div className="h-0.5 w-full overflow-hidden bg-white/15">
                        <div
                            className="h-full bg-cyan-300 transition-[width] duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
