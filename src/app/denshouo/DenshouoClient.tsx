'use client'

import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { buildWorldStateQuery } from '@/lib/worldState';
import { DENSHOUO_COPY } from './denshouoCopy';
import { FishCursor, OceanBackdrop } from './DenshouoScene';
import { useDenshouoWorldState } from './useDenshouoWorldState';

const overviewFishSpecs = [
    { width: 84, duration: 18, src: '/clownfish.png', alt: 'clownfish' },
    { width: 92, duration: 22, src: '/ocean-sunfish.png', alt: 'ocean sunfish' },
    { width: 100, duration: 20, src: '/needlefish.png', alt: 'needlefish' },
    { width: 76, duration: 16, src: '/medaka.png', alt: 'medaka' },
    { width: 88, duration: 24, src: '/tuna.png', alt: 'tuna' },
    { width: 94, duration: 26, src: '/anglerfish.png', alt: 'anglerfish' },
    { width: 98, duration: 28, src: '/frilled-shark.png', alt: 'frilled shark' },
    { width: 102, duration: 27, src: '/hammerhead-shark.png', alt: 'hammerhead shark' },
];



export default function DenshouoClient() {
    const router = useRouter();
    const { lang, worldState, setActiveWork } = useDenshouoWorldState();
    const { weather: displayedWeather, season: displayedSeason, seasonEvent: displayedSeasonEvent } = worldState;

    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number; isHover: boolean; isRain: boolean }>>([]);
    const [rainDemoDrop, setRainDemoDrop] = useState(false);
    const rippleIdRef = useRef(0);
    const lastHoverRippleAtRef = useRef(0);
    const rainDemoTriggeredRef = useRef(false);
    const reducedMotion = useReducedMotion();
    // isFinePointer — hide native cursor only on mouse devices
    const [isFinePointer, setIsFinePointer] = useState(false);
    useEffect(() => { setIsFinePointer(window.matchMedia('(pointer: fine)').matches); }, []);

    useEffect(() => {
        const addRipple = (event: PointerEvent, isHover = false) => {
            if (event.pointerType !== 'mouse') return;

            if (isHover) {
                const now = window.performance.now();
                if (now - lastHoverRippleAtRef.current < 120) return;
                lastHoverRippleAtRef.current = now;
            }

            const id = rippleIdRef.current;
            rippleIdRef.current += 1;

            setRipples((current) => [
                ...current,
                {
                    id,
                    x: (event.clientX / window.innerWidth) * 100,
                    y: (event.clientY / window.innerHeight) * 100,
                    size: isHover ? 96 + Math.random() * 28 : 120 + Math.random() * 40,
                    isHover,
                    isRain: false,
                },
            ]);
        };
        const handlePointerMove = (event: PointerEvent) => addRipple(event, true);

        window.addEventListener('pointerdown', addRipple, { passive: true });
        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        return () => {
            window.removeEventListener('pointerdown', addRipple);
            window.removeEventListener('pointermove', handlePointerMove);
        };
    }, []);

    useEffect(() => {
        if (displayedWeather !== 'Rain') {
            rainDemoTriggeredRef.current = false;
            setRainDemoDrop(false);
            return;
        }
        if (rainDemoTriggeredRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        rainDemoTriggeredRef.current = true;
        const timer = window.setTimeout(() => setRainDemoDrop(true), 700);
        return () => {
            window.clearTimeout(timer);
            setRainDemoDrop(false);
        };
    }, [displayedWeather]);



    const t = DENSHOUO_COPY[lang];
    const [randomizedOverviewFishSpecs, setRandomizedOverviewFishSpecs] = useState(() =>
        overviewFishSpecs.map((fish, index) => {
            const fromLeft = index % 2 === 0;
            const isDeepSeaFish = fish.src === '/anglerfish.png' || fish.src === '/frilled-shark.png' || fish.src === '/hammerhead-shark.png';
            const top = isDeepSeaFish ? 70 + (index % 3) * 6 : 10 + (index % 6) * 8;
            return {
                ...fish,
                top: `${top.toFixed(1)}%`,
                start: fromLeft ? '-24%' : '112%',
                direction: fromLeft ? 1 : -1,
                delay: index * 0.25,
            };
        })
    );

    useEffect(() => {
        setRandomizedOverviewFishSpecs(
            overviewFishSpecs.map((fish) => {
                const fromLeft = Math.random() < 0.5;
                const isDeepSeaFish = fish.src === '/anglerfish.png' || fish.src === '/frilled-shark.png' || fish.src === '/hammerhead-shark.png';
                const top = isDeepSeaFish ? 70 + Math.random() * 20 : 8 + Math.random() * 44;
                return {
                    ...fish,
                    top: `${top.toFixed(1)}%`,
                    start: fromLeft ? '-24%' : '112%',
                    direction: fromLeft ? 1 : -1,
                    delay: Math.random() * 3,
                };
            })
        );
    }, []);

    const handleReturn = () => {
        setActiveWork(null);
        router.push(`/?${buildWorldStateQuery({ weather: displayedWeather, season: displayedSeason, seasonEvent: displayedSeasonEvent }, lang)}`);
    };

    return (
        <>
        <FishCursor />
        <main
            className="relative min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.12),transparent_35%),#041116] text-white overflow-x-hidden"
            style={{ cursor: isFinePointer ? 'none' : 'auto' }}
        >
            <OceanBackdrop weather={displayedWeather} />

            <div className="pointer-events-none fixed inset-0 z-4 overflow-hidden" aria-hidden="true">
                {rainDemoDrop && reducedMotion !== true && (
                    <motion.span
                        data-testid="rain-demo-drop"
                        className="absolute left-[52%] top-[10%] h-4 w-0.5 rounded-full bg-sky-100/80"
                        initial={{ y: '-10vh', opacity: 0 }}
                        animate={{ y: '24vh', opacity: [0, 0.9, 0.95] }}
                        transition={{ duration: 0.7, ease: 'easeIn' }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(125, 211, 252, 0.65))' }}
                        onAnimationComplete={() => {
                            setRainDemoDrop(false);
                            const id = rippleIdRef.current;
                            rippleIdRef.current += 1;
                            setRipples((current) => [
                                ...current,
                                {
                                    id,
                                    x: 52,
                                    y: 34,
                                    size: 96,
                                    isHover: false,
                                    isRain: true,
                                },
                            ]);
                        }}
                    />
                )}
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        data-testid={ripple.isRain ? 'rain-ripple' : undefined}
                        className={`absolute rounded-full border ${ripple.isRain ? 'border-sky-200/35 bg-sky-100/[0.03]' : 'border-cyan-100/55 bg-cyan-50/5'}`}
                        style={{
                            left: `${ripple.x}%`,
                            top: `${ripple.y}%`,
                            width: ripple.size,
                            height: ripple.size,
                            x: '-50%',
                            y: '-50%',
                            boxShadow: ripple.isRain
                                ? '0 0 0 1px rgba(125, 211, 252, 0.10), 0 0 16px rgba(56, 189, 248, 0.08)'
                                : ripple.isHover
                                ? '0 0 0 1px rgba(167, 243, 208, 0.14), 0 0 22px rgba(45, 212, 191, 0.12)'
                                : '0 0 0 1px rgba(167, 243, 208, 0.18), 0 0 34px rgba(45, 212, 191, 0.18)',
                        }}
                        initial={{ scale: ripple.isRain ? 0.1 : ripple.isHover ? 0.18 : 0.15, opacity: ripple.isRain ? 0.22 : ripple.isHover ? 0.32 : 0.5 }}
                        animate={{ scale: ripple.isRain ? 1.55 : ripple.isHover ? 1.45 : 1.9, opacity: 0 }}
                        transition={{ duration: ripple.isRain ? 1.35 : ripple.isHover ? 0.85 : 1.1, ease: 'easeOut' }}
                        onAnimationComplete={() => {
                            setRipples((current) => current.filter((item) => item.id !== ripple.id));
                        }}
                    />
                ))}
            </div>

            <div className="pointer-events-none fixed inset-0 z-3 opacity-55" aria-hidden="true">
                {randomizedOverviewFishSpecs.map((fish, index) => (
                    <motion.div
                        key={`overview-fish-${index}`}
                        className="fixed"
                        style={{ top: fish.top, left: fish.start, width: fish.width }}
                        animate={{
                            x: fish.direction === 1 ? [0, 1500] : [0, -1500],
                            opacity: [0, 0.28, 0.28, 0],
                        }}
                        transition={{
                            duration: fish.duration,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: fish.delay,
                        }}
                    >
                        <Image
                            src={fish.src}
                            alt={fish.alt}
                            width={320}
                            height={200}
                            className="h-auto w-full"
                            style={{ transform: fish.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)' }}
                        />
                    </motion.div>
                ))}
            </div>

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#ecfeff] hover:text-teal-200 transition-colors group">
                    <span className="w-6 h-px bg-[#ecfeff] group-hover:bg-teal-200 transition-colors" />
                    {t.returnToOrbit}
                </button>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
                <div className="text-center mb-20">
                    <span className="inline-block border border-teal-300/30 bg-teal-300/10 text-teal-200 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8">
                        REACT / SUPABASE
                    </span>
                    <Image
                        src="/denshouo-logo.png"
                        alt="でんしょうお ロゴ"
                        width={640}
                        height={220}
                        sizes="(max-width: 768px) 80vw, 448px"
                        priority
                        className="w-full max-w-xs md:max-w-md mx-auto"
                    />
                    <p className="mt-6 text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        {t.lead}
                    </p>
                    <a
                        data-testid="open-app-hero"
                        href="https://oikomi-front.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center rounded-full border border-teal-300/50 bg-teal-300/10 px-8 py-4 font-mono text-sm text-teal-200 transition-colors hover:bg-teal-300/20"
                    >
                        OPEN APP
                    </a>
                </div>

                <div className="space-y-10">
                    <section className="relative overflow-hidden bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="relative z-10 text-xs font-mono tracking-widest text-teal-200 mb-6 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            01 / OVERVIEW
                        </h2>
                        <p className="relative z-10 text-gray-200 leading-relaxed text-base md:text-lg">
                            {t.overview}
                        </p>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            02 / CONCEPT
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">SMALL HAPPINESS</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.smallHappiness}
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">LIGHT AND SHADOW</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.lightShadow}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            03 / TECHNICAL NOTES
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">FRONTEND</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.frontend}
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">BACKEND / DB</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.backend}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">React</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vite</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Supabase</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vercel</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            04 / DEVELOPMENT CONTEXT
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            {t.context}
                        </p>
                    </section>

                    <div className="mt-16 pt-10 border-t border-teal-100/10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://oikomi-front.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-teal-300/50 text-teal-200 font-mono text-sm bg-teal-300/10 hover:bg-teal-300/20 transition-colors"
                        >
                            OPEN APP
                        </a>
                        <a
                            href="https://x.com/geek_pjt/status/1954474531743232383?t=03zVZf-zya95vP3PMc1VOQ&s=19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-white/15 text-gray-300 font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            RELATED LINK
                        </a>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}
