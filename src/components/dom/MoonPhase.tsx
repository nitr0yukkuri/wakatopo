'use client';

import { useEffect, useId, useState, type CSSProperties } from 'react';
import { getMoonPhase, getMoonPhaseMask } from '@/lib/moonPhase';

type MoonPhaseProps = {
    phaseOverride?: number | null;
    className?: string;
    style?: CSSProperties;
};

export default function MoonPhase({ phaseOverride, className = '', style }: MoonPhaseProps) {
    const [livePhase, setLivePhase] = useState(() => getMoonPhase());
    const idSuffix = useId().replace(/:/g, '');
    const gradientId = `moon-gradient-${idSuffix}`;
    const maskId = `moon-mask-${idSuffix}`;
    const maskGradientId = `moon-mask-gradient-${idSuffix}`;
    const circleClipId = `moon-circle-${idSuffix}`;

    useEffect(() => {
        if (phaseOverride !== undefined && phaseOverride !== null) {
            return;
        }

        const updatePhase = () => setLivePhase(getMoonPhase());
        const timer = window.setInterval(updatePhase, 60 * 60 * 1000);
        return () => window.clearInterval(timer);
    }, [phaseOverride]);

    const phase = phaseOverride ?? livePhase;
    const moonMask = getMoonPhaseMask(phase);
    const fadeWidth = 8;
    const fadeStart = Math.max(0, moonMask.boundaryPercent - fadeWidth);
    const fadeEnd = Math.min(100, moonMask.boundaryPercent + fadeWidth);
    const moonVisible = !moonMask.isNew;

    return (
        <div
            className={`pointer-events-none ${className}`}
            style={style}
            aria-hidden="true"
        >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                <defs>
                    <radialGradient id={gradientId} cx="35%" cy="35%" r="70%">
                        <stop offset="0%" stopColor="#f3f7ff" />
                        <stop offset="54%" stopColor="#d6e1f4" />
                        <stop offset="100%" stopColor="#b4c5df" />
                    </radialGradient>
                    <linearGradient id={maskGradientId} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
                        {moonMask.isFull ? (
                            <stop offset="0%" stopColor="white" />
                        ) : moonMask.illuminatedSide === 'right' ? (
                            <>
                                <stop offset={`${fadeStart}%`} stopColor="black" />
                                <stop offset={`${fadeEnd}%`} stopColor="white" />
                            </>
                        ) : (
                            <>
                                <stop offset={`${fadeStart}%`} stopColor="white" />
                                <stop offset={`${fadeEnd}%`} stopColor="black" />
                            </>
                        )}
                    </linearGradient>
                    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                        <rect width="100" height="100" fill={`url(#${maskGradientId})`} />
                    </mask>
                    <clipPath id={circleClipId}>
                        <circle cx="50" cy="50" r="50" />
                    </clipPath>
                </defs>
                {moonVisible && (
                    <>
                        <circle
                            cx="50"
                            cy="50"
                            r="50"
                            fill={`url(#${gradientId})`}
                            mask={`url(#${maskId})`}
                        />
                        <g mask={`url(#${maskId})`} clipPath={`url(#${circleClipId})`} opacity="0.14">
                            <circle cx="29" cy="33" r="7" fill="#8798b6" />
                            <circle cx="62" cy="57" r="5" fill="#90a1bd" />
                            <circle cx="46" cy="73" r="3.5" fill="#8193b1" />
                            <circle cx="72" cy="27" r="2.5" fill="#8b9bb8" />
                        </g>
                    </>
                )}
            </svg>
        </div>
    );
}
