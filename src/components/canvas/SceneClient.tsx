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
    const ringSize = 620;
    const ringCenter = ringSize / 2;
    const ringRadius = 280;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringDashOffset = ringCircumference * (1 - progress / 100);

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
            <div className={`transition-opacity duration-200 ${showLoader ? 'opacity-0' : 'opacity-100'}`}>
                <Scene onSceneReady={handleSceneReady} />
            </div>
            <div
                className={`absolute inset-0 z-20 flex items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(22,61,84,0.2)_0%,rgba(0,0,0,0.985)_62%,rgba(0,0,0,1)_100%)] transition-opacity duration-300 ${showLoader ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                aria-hidden={!showLoader}
            >
                <div
                    className="relative flex items-center justify-center"
                    style={{ height: 'min(88vw, 88vh, 620px)', width: 'min(88vw, 88vh, 620px)' }}
                >
                    <svg
                        viewBox={`0 0 ${ringSize} ${ringSize}`}
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        aria-hidden="true"
                    >
                        <circle
                            cx={ringCenter}
                            cy={ringCenter}
                            r={ringRadius}
                            fill="none"
                            stroke="rgba(130, 181, 208, 0.16)"
                            strokeWidth="1.2"
                        />
                        <circle
                            cx={ringCenter}
                            cy={ringCenter}
                            r={ringRadius}
                            fill="none"
                            stroke="rgba(153, 241, 255, 0.95)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={ringCircumference}
                            strokeDashoffset={ringDashOffset}
                            style={{ transition: 'stroke-dashoffset 90ms linear' }}
                        />
                    </svg>

                    <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                        <div className="-translate-y-4 sm:-translate-y-6 flex items-center gap-2 font-mono text-base sm:text-lg tracking-[0.26em] text-cyan-100/95">
                            <span>{String(progress).padStart(3, '0')}</span>
                            <span>%</span>
                        </div>
                    </div>
                    <div className="pointer-events-none absolute -bottom-1 left-1/2 h-px w-28 -translate-x-1/2 bg-linear-to-r from-transparent via-cyan-200/70 to-transparent" />
                    <div className="pointer-events-none absolute -bottom-4 left-1/2 h-12 -translate-x-1/2 rounded-[999px] bg-cyan-200/15 blur-2xl" style={{ width: '38%' }} />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10" style={{ height: '90%', width: '90%' }} />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/5" style={{ height: '112%', width: '112%' }} />
                </div>

                <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-size-[52px_52px]" />
                <div className="pointer-events-none hidden sm:block absolute bottom-8 right-8 font-mono text-[10px] tracking-[0.2em] text-cyan-100/60">
                    <div className="mb-1">SYSTEM BOOTSTRAP</div>
                    <div className="h-px w-24 bg-cyan-100/30" />
                </div>
                <div className="pointer-events-none hidden sm:block absolute bottom-8 left-8 font-mono text-[10px] tracking-[0.2em] text-cyan-100/60">
                    <div className="mb-1">PLANET CORE LINK</div>
                    <div className="h-px w-24 bg-cyan-100/30" />
                </div>
            </div>
        </>
    );
}
