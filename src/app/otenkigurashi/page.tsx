'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore, WeatherType } from '@/store';
import { useEffect, useRef, useState } from 'react';
import dynamicImport from 'next/dynamic';
import Image from 'next/image';

const TenchanCompanion = dynamicImport(() => import('@/components/TenchanCompanion'), { ssr: false });
const RainParticles = dynamicImport(
    () => import('@/components/canvas/RainTransitionCanvas').then((m) => m.RainParticles),
    { ssr: false },
);
const SnowCanvas = dynamicImport(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });

export const dynamic = 'force-dynamic';

// A simple CSS cloud decoration component
function CloudDecoration({ className, style, flip }: { className: string, style?: React.CSSProperties, flip?: boolean }) {
    return (
        <div className={`absolute pointer-events-none flex items-center justify-center ${className}`} style={style}>
            <svg viewBox="0 0 200 100" className={`w-full h-full drop-shadow-md ${flip ? 'transform -scale-x-100' : ''}`}>
                <path
                    fill="#ffffff"
                    stroke="#98adc2"
                    strokeWidth="3"
                    d="M 50 80 Q 20 80 20 55 Q 20 30 50 30 Q 60 10 90 10 Q 120 10 130 30 Q 170 30 170 55 Q 170 80 140 80 Z"
                />
            </svg>
        </div>
    );
}

// ── Animated cloud cursor ─────────────────────────────────────────────────
// Uses the same quadratic-curve path as CloudDecoration (viewBox 0 0 200 100).
// Bobs gently when hovering, squishes/leans when moving fast.
function CloudCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef  = useRef({
        x:    -300, y:    -300,
        rawX: -300, rawY: -300,
        vx: 0, vy: 0,
        bobPhase: 0,
        squishX: 1.0, squishY: 1.0,
        lean: 0,
        raf:  0,
    });

    // ── Mouse tracking ───────────────────────────────────────────────────
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const s = stateRef.current;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.rawX = e.clientX;
            s.rawY = e.clientY;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    // ── Canvas animation loop ───────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const s = stateRef.current;

        const resize = () => {
            canvas.width  = window.innerWidth  * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width  = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio;

        // ── Cloud drawing ────────────────────────────────────────────────
        // Same quadratic-curve path as <CloudDecoration> SVG (viewBox 0 0 200 100).
        // k = 0.30 → cloud is ~45px wide, ~21px tall (slightly smaller than before).
        const drawCloud = (squishX: number, squishY: number, lean: number, bobY: number) => {
            const k  = 0.30;
            const CX = 95 * k;   // horizontal cloud center in path coords
            const CY = 52 * k;   // vertical   cloud center in path coords

            ctx.save();
            ctx.translate(0, bobY);
            ctx.scale(squishX, squishY);
            ctx.rotate(lean);
            ctx.translate(-CX, -CY);

            // Soft drop shadow
            ctx.shadowBlur    = 10;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor   = 'rgba(120,160,200,0.28)';

            // Cloud outline path (identical to CloudDecoration SVG)
            ctx.beginPath();
            ctx.moveTo(50*k, 80*k);
            ctx.quadraticCurveTo(20*k, 80*k, 20*k, 55*k);
            ctx.quadraticCurveTo(20*k, 30*k, 50*k, 30*k);
            ctx.quadraticCurveTo(60*k, 10*k, 90*k, 10*k);
            ctx.quadraticCurveTo(120*k, 10*k, 130*k, 30*k);
            ctx.quadraticCurveTo(170*k, 30*k, 170*k, 55*k);
            ctx.quadraticCurveTo(170*k, 80*k, 140*k, 80*k);
            ctx.closePath();

            // Fill: white→light-blue gradient (top to bottom)
            const grad = ctx.createLinearGradient(20*k, 10*k, 20*k, 80*k);
            grad.addColorStop(0, 'rgba(255,255,255,0.98)');
            grad.addColorStop(1, 'rgba(230,243,252,0.96)');
            ctx.fillStyle = grad;
            ctx.fill();

            // Stroke: same #98adc2 blue-gray as CloudDecoration border
            ctx.shadowBlur    = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle   = '#98adc2';
            ctx.lineWidth     = 3 * k;
            ctx.stroke();

            ctx.restore();
        };

        // ── Animation loop ──────────────────────────────────────────────────
        let last = performance.now();
        const LERP_POS  = 0.18;   // how quickly cursor follows raw position
        const VEL_DECAY = 0.88;   // velocity smoothing

        const loop = (now: number) => {
            s.raf = requestAnimationFrame(loop);
            const dt = Math.min((now - last) / 16.67, 4); // normalised to 60 fps
            last = now;

            // Smooth position toward raw mouse
            const prevX = s.x, prevY = s.y;
            s.x += (s.rawX - s.x) * LERP_POS * dt;
            s.y += (s.rawY - s.y) * LERP_POS * dt;

            // Velocity (exponential moving average)
            s.vx = s.vx * VEL_DECAY + (s.x - prevX) * (1 - VEL_DECAY);
            s.vy = s.vy * VEL_DECAY + (s.y - prevY) * (1 - VEL_DECAY);
            const speed = Math.hypot(s.vx, s.vy);

            // Bob: gentle when hovering (large amp), quieter when moving fast
            s.bobPhase += 0.038 * dt;
            const bobAmp = Math.max(1.2, 4.5 - speed * 0.5);
            const bobY   = Math.sin(s.bobPhase * 1.6) * bobAmp;

            // Squish: cloud stretches horizontally like a puff of wind
            const tSqX = 1 + Math.min(speed * 0.013, 0.22);
            const tSqY = 1 / tSqX; // preserve area
            s.squishX += (tSqX - s.squishX) * 0.14 * dt;
            s.squishY += (tSqY - s.squishY) * 0.14 * dt;

            // Lean: subtle tilt toward movement direction (max ±13°)
            const tLean = Math.max(-0.23, Math.min(0.23, s.vx * 0.055));
            s.lean += (tLean - s.lean) * 0.10 * dt;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.translate(s.x, s.y);
            drawCloud(s.squishX, s.squishY, s.lean, bobY);
            ctx.restore();
        };

        s.raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(s.raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[9999] pointer-events-none"
            aria-hidden="true"
        />
    );
}

export default function OtenkiGurashiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork, setWeather, weather } = useStore();
    const weatherParam = searchParams.get('weather');

    const copy = {
        ja: {
            react1: 'えへへ！',
            react2: 'おさんぽ行く？',
            react3: 'ふわああ…',
            react4: 'なになに？',
            react5: '今日もいいお天気！',
            lead: '天気予報を見ないあなたの、',
            lead2: 'いちばん優しいおまもり。',
            lead3: 'おてんきぐらし',
            lead4: 'は、',
            lead5: '現実の天気と連動するシミュレーションです。',
            conceptTitle: 'コンセプト',
            conceptClick: 'ゲームみたいに天気を楽しめるんだ！',
            conceptText: '天気予報の確認は面倒だけど、急な雨や気圧の変化はつらい… そんな方々のために生まれました。ゲーム性のある優しい世界を通して、面倒だった天気確認を「雨だから、ゲーム内で特別なことができるかも？」という、ポジティブな体験へと変えていきます。',
            f1Click: '大阪で雨なら、ゲームでも雨だよ！',
            f1Title: '☀ リアルタイム天気連動',
            f1Text: 'あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。雨は雨粒、雷はフラッシュ、雪は降雪モーションとして画面に現れ、夜になればキャラクターも眠りにつきます。',
            f2Click: 'おさんぽで色んなアイテムを集めよう！',
            f2Title: '🚶 おさんぽ (Walking)',
            f2Text: 'キャラクターを「おさんぽ」に出すことができます。おさんぽ先の景色や、手に入るアイテムは天気によって変化。コレクションする楽しみが待っています。',
            f3Click: '思い出がたくさん記録されるよ！',
            f3Title: '✨ コレクション＆実績',
            f3Text: 'レベルアップのようなノルマはありません。「おさんぽ」で集めたアイテムを眺める「ずかん」や、「はじめて雨の日におさんぽした」といったキャラクターとの思い出を記録する「実績」が、あなたの毎日を彩ります。',
            techClick: 'Next.jsで作られてるよ！',
            openApp: 'アプリをひらく',
            viewGithub: 'GitHubをみる',
            backHome: 'おうちにもどる',
            logoAlt: 'OTENKI GURASHI Logo',
        },
        en: {
            react1: 'Hehe!',
            react2: 'Want to go for a walk?',
            react3: 'Yaaawn...',
            react4: 'What is it?',
            react5: 'Nice weather today too!',
            lead: 'For you who never checks the forecast,',
            lead2: 'the kindest little charm.',
            lead3: 'Otenkigurashi',
            lead4: 'is',
            lead5: 'a simulation linked to real-world weather.',
            conceptTitle: 'CONCEPT',
            conceptClick: 'You can enjoy weather like a game!',
            conceptText: 'Checking weather forecasts can be a hassle, and sudden rain or pressure changes can be tough. This app was born for that. Through a gentle game-like world, it turns weather checks from a chore into a positive experience: “It is raining, maybe I can do something special in-game.”',
            f1Click: 'If it rains in Osaka, it rains in the game too!',
            f1Title: '☀ Real-Time Weather Sync',
            f1Text: 'The “now” of your location is directly reflected in the character world. Rain appears as droplets, thunder as flashes, snow as falling motion, and at night the character goes to sleep.',
            f2Click: 'Let us collect items on a walk!',
            f2Title: '🚶 Walk Mode',
            f2Text: 'You can send your character on a walk. Scenery and obtainable items change with the weather, giving you a fun collection loop.',
            f3Click: 'So many memories get recorded!',
            f3Title: '✨ Collection & Achievements',
            f3Text: 'There are no level-up quotas. A “zukan” lets you look back at collected walk items, and achievements record memories with your character, like your first rainy-day walk.',
            techClick: 'It is built with Next.js!',
            openApp: 'Open App',
            viewGithub: 'View GitHub',
            backHome: 'Back Home',
            logoAlt: 'OTENKIGURASHI Logo',
        },
    } as const;
    const t = copy[lang];

    // スクロール検知用の状態とRef
    const [activeSection, setActiveSection] = useState<'hero' | 'concept' | 'features' | 'tech' | 'bottom'>('hero');
    const heroRef = useRef<HTMLDivElement>(null);
    const conceptRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const techRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // インタラクション（クリック）時のオーバーライド用状態
    type DialogType = { text: string; mood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking" };
    const [overrideDialog, setOverrideDialog] = useState<DialogType | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showHeavyEffects, setShowHeavyEffects] = useState(false);
    // Hide native cursor on fine-pointer (mouse) devices — CloudCursor replaces it
    const [isFinePointer, setIsFinePointer] = useState(false);
    useEffect(() => { setIsFinePointer(window.matchMedia('(pointer: fine)').matches); }, []);

    const handleInteract = (text: string, mood: DialogType['mood']) => {
        setOverrideDialog({ text, mood });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOverrideDialog(null);
        }, 4000); // 4秒後に元のセリフに戻る
    };

    const handleTenchanClick = () => {
        const reactions: DialogType[] = [
            { text: t.react1, mood: "happy" },
            { text: t.react2, mood: "looking" },
            { text: t.react3, mood: "sleepy" },
            { text: t.react4, mood: "surprised" },
            { text: t.react5, mood: "talking" }
        ];
        const random = reactions[Math.floor(Math.random() * reactions.length)];
        handleInteract(random.text, random.mood);
    };

    useEffect(() => {
        const weatherByParam = weatherParam as WeatherType | null;
        const validWeather: WeatherType[] = ['Clear', 'Rain', 'Clouds', 'Snow', 'Night', 'Morning', 'Thunder'];
        if (weatherByParam && validWeather.includes(weatherByParam)) {
            setWeather(weatherByParam);
        }
    }, [setWeather, weatherParam]);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -40% 0px', // 画面の中央付近で検知する
            threshold: 0
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id as 'hero' | 'concept' | 'features' | 'tech' | 'bottom';
                    setActiveSection(id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (heroRef.current) observer.observe(heroRef.current);
        if (conceptRef.current) observer.observe(conceptRef.current);
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (techRef.current) observer.observe(techRef.current);
        if (bottomRef.current) observer.observe(bottomRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const reveal = () => {
            setShowHeavyEffects(true);
        };

        window.addEventListener('pointerdown', reveal, { once: true, passive: true });
        window.addEventListener('keydown', reveal, { once: true });
        window.addEventListener('scroll', reveal, { once: true, passive: true });
        const timer = window.setTimeout(reveal, 15000);

        return () => {
            window.removeEventListener('pointerdown', reveal);
            window.removeEventListener('keydown', reveal);
            window.removeEventListener('scroll', reveal);
            window.clearTimeout(timer);
        };
    }, []);

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push(`/?lang=${lang}`);
    };

    let bgGradient = "from-[#aee1f9] to-[#e0f4fc]"; // Default (Clear)
    let cardText = "text-gray-700";

    if (weather === 'Clouds') {
        bgGradient = "from-[#6b7a8d] via-[#8fa0b0] to-[#b5c2ca]";
    } else if (weather === 'Rain') {
        bgGradient = "from-[#60a5fa] to-[#bfdbfe] bg-gradient-to-t"; // Original Rain Gradient
    } else if (weather === 'Snow') {
        bgGradient = "bg-[#eef7fd]";
    } else if (weather === 'Thunder') {
        bgGradient = "from-[#1a1a2e] via-[#16213e] to-[#0f3460]";
        cardText = "text-gray-200";
    } else if (weather === 'Night') {
        bgGradient = "from-[#030915] via-[#071428] to-[#0b1f36]";
        cardText = "text-gray-200";
    }

    return (
        <>
        <CloudCursor />
        <main className={`relative w-full min-h-[120dvh] ${weather !== 'Rain' && weather !== 'Snow' ? 'bg-gradient-to-b' : ''} ${bgGradient} ${weather === 'Thunder' || weather === 'Night' ? 'text-gray-200' : 'text-gray-700'} overflow-hidden font-sans pb-32 transition-colors duration-1000`} style={{ cursor: isFinePointer ? 'none' : 'auto' }}>

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10">
                <button
                    onClick={handleReturn}
                    className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-black/35 px-4 py-2 text-sm font-mono tracking-widest text-white backdrop-blur-sm hover:bg-black/50 transition-colors group"
                >
                    <span className="w-6 h-px bg-white/90 transition-colors" />
                    {t.backHome}
                </button>
            </nav>

            {/* Background Parallax Clouds Layer */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${weather === 'Rain' ? 'opacity-8' : weather === 'Thunder' ? 'opacity-35' : weather === 'Snow' ? 'opacity-0' : weather === 'Clouds' ? 'opacity-100' : weather === 'Night' ? 'opacity-45' : 'opacity-30'}`}>
                {/* --- 3. 奥のレイヤー（小さく、ゆっくり、薄い、左へ） --- */}
                <CloudDecoration className="opacity-20 w-32 top-[5%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-10s' }} />
                <CloudDecoration className="opacity-30 w-40 top-[40%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-40s' }} />
                <CloudDecoration className="opacity-20 w-28 top-[25%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-110s' }} />
                <CloudDecoration className="opacity-30 w-24 top-[70%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-80s' }} />
                <CloudDecoration className="opacity-20 w-36 top-[55%] animate-cloud-scroll-left-slow" flip style={{ animationDelay: '-130s' }} />
                <CloudDecoration className="opacity-20 w-36 top-[85%] animate-cloud-scroll-left-slow" flip style={{ animationDelay: '-20s' }} />

                {/* --- 2. 中間のレイヤー（普通サイズ、中速、少し薄め、右へ） --- */}
                <CloudDecoration className="opacity-60 w-52 top-[5%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-5s' }} />
                <CloudDecoration className="opacity-40 w-44 top-[20%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-35s' }} />
                <CloudDecoration className="opacity-50 w-64 top-[35%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-50s' }} />
                <CloudDecoration className="opacity-40 w-56 top-[50%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-15s' }} />
                <CloudDecoration className="opacity-50 w-48 top-[60%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-25s' }} />
                <CloudDecoration className="opacity-40 w-60 top-[75%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-60s' }} />
                <CloudDecoration className="opacity-60 w-56 bottom-[5%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-70s' }} />

                {/* --- 1. 手前のレイヤー（大きく、速く、不透明、左へ） --- */}
                <CloudDecoration className="opacity-90 w-72 top-[10%] animate-cloud-scroll-left-fast filter blur-[1px]" style={{ animationDelay: '-15s' }} />
                <CloudDecoration className="opacity-80 w-80 top-[30%] animate-cloud-scroll-left-fast filter blur-[1px]" flip style={{ animationDelay: '-45s' }} />
                <CloudDecoration className="opacity-80 w-80 top-[50%] animate-cloud-scroll-left-fast filter blur-[1px]" flip style={{ animationDelay: '-35s' }} />
                <CloudDecoration className="opacity-90 w-[22rem] top-[70%] animate-cloud-scroll-left-fast filter blur-[1px]" style={{ animationDelay: '-5s' }} />
                <CloudDecoration className="opacity-95 w-96 bottom-[10%] animate-cloud-scroll-left-fast filter blur-[2px]" style={{ animationDelay: '-55s' }} />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-32 flex flex-col items-center animate-fade-in-up">

                {/* Pop Title Logo */}
                <div id="hero" ref={heroRef} className="mb-8 md:mb-10 text-center scroll-mt-24 w-full flex justify-center">
                    <Image
                        src="/otenkigurashi-logo.png"
                        alt={t.logoAlt}
                        width={640}
                        height={220}
                        sizes="(max-width: 768px) 80vw, 448px"
                        priority
                        className="w-full max-w-xs md:max-w-md drop-shadow-md"
                    />
                </div>

                {/* Fluffy White Content Card */}
                <div className={`${weather === 'Snow' ? 'bg-white/92' : 'bg-white/95'} ${weather === 'Snow' ? '' : 'backdrop-blur-sm'} border-4 ${weather === 'Snow' ? 'border-transparent' : 'border-white'} px-6 py-10 md:p-14 rounded-[2.5rem] md:rounded-[3rem] w-full ${weather === 'Snow' ? 'shadow-none' : 'shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]'}`}>

                    <p className="text-lg md:text-2xl font-bold text-gray-600 mb-10 md:mb-12 leading-relaxed text-center">
                        {t.lead}<br className="md:hidden" />{t.lead2}<br />
                        <span className="text-[#ffb03a] text-xl md:text-3xl inline-block mt-2 font-black">{t.lead3}</span> {t.lead4}<br className="md:hidden" />{t.lead5}
                    </p>

                    <div className="space-y-12">
                        {/* Section 1: Concept */}
                        <section id="concept" ref={conceptRef} className="mb-32 animate-fade-in-up scroll-mt-32" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-4xl font-bold text-[#ffb03a]">01</span>
                                <h2 className="text-2xl font-bold tracking-widest text-[#7ab8cc]">{t.conceptTitle}</h2>
                            </div>
                            <div
                                onClick={() => handleInteract(t.conceptClick, "happy")}
                                className="bg-white/90 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border-4 border-white shadow-xl max-w-3xl cursor-pointer hover:border-[#ffb03a] hover:shadow-lg transition-all"
                            >
                                <p className="text-base md:text-xl leading-relaxed text-gray-700 font-medium">
                                    {t.conceptText}
                                </p>
                            </div>
                        </section>
                        <div id="features" ref={featuresRef} className="scroll-mt-32">
                            <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                <span className="text-[#ffb03a]">02</span> FEATURES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => handleInteract(t.f1Click, "talking")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f1Title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        {t.f1Text}
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract(t.f2Click, "happy")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f2Title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        {t.f2Text}
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract(t.f3Click, "surprised")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1 md:col-span-2"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f3Title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        {t.f3Text}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TECHNICAL STACK */}
                        <div id="tech" ref={techRef} className="scroll-mt-32">
                            <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                <span className="text-[#ffb03a]">03</span> TECH STACK
                            </h2>
                            <div
                                onClick={() => handleInteract(t.techClick, "surprised")}
                                className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all"
                            >
                                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 font-bold text-gray-700">
                                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />Next.js</li>
                                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />TypeScript</li>
                                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />Tailwind CSS</li>
                                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />OpenWeatherMap API</li>
                                    <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />PWA</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Pop Buttons */}
                    <div id="bottom" ref={bottomRef} className="mt-16 pt-10 border-t border-[#e0f4fc] flex flex-col sm:flex-row items-center justify-center gap-4 scroll-mt-32">
                        <a
                            href="https://otenki-gurashi.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#ffb03a] text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#e69a2e] hover:translate-y-[2px] hover:shadow-[0_4px_0_#e69a2e] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <span>{t.openApp}</span> ↗
                        </a>

                        <a
                            href="https://github.com/nitr0yukkuri/otenkigurashi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-[#7ab8cc] border-2 border-[#e0f4fc] px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#d1effa] hover:translate-y-[2px] hover:border-[#7ab8cc] hover:shadow-[0_4px_0_#a0e1fa] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <span>{t.viewGithub}</span> ↗
                        </a>
                    </div>
                </div>
            </div>

            {/* Additional Screen Effects based on Weather */}
            {(weather === 'Clear' || weather === 'Morning') && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div
                            className="absolute right-[8%] top-[9%] w-24 h-24 md:w-32 md:h-32 rounded-full"
                            style={{
                                background: 'radial-gradient(circle at 35% 35%, rgba(255,245,180,0.96) 0%, rgba(255,213,112,0.92) 38%, rgba(255,170,58,0.92) 100%)',
                                boxShadow: '0 0 45px rgba(255,205,110,0.55), 0 0 110px rgba(255,187,82,0.35)',
                                animation: 'sun-soft-pulse 4.6s ease-in-out infinite',
                            }}
                        />
                        <div
                            className="absolute right-[3%] top-[2%] w-44 h-44 md:w-64 md:h-64 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(255,220,150,0.36) 0%, rgba(255,220,150,0.08) 42%, rgba(255,220,150,0.0) 74%)',
                                animation: 'sun-aura-spin 16s linear infinite',
                            }}
                        />
                    </div>
                    <style>{`
                        @keyframes sun-soft-pulse {
                            0%, 100% { transform: scale(1); opacity: 0.94; }
                            50% { transform: scale(1.05); opacity: 1; }
                        }
                        @keyframes sun-aura-spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </>
            )}
            {showHeavyEffects && weather === 'Rain' && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <RainParticles />
                    </div>
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-45" style={{
                        background: 'linear-gradient(180deg, rgba(52,95,145,0.24) 0%, rgba(67,123,188,0.18) 35%, rgba(18,52,90,0.24) 100%)',
                    }} />
                </>
            )}
            {weather === 'Snow' && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-20">
                        <SnowCanvas density={1.45} />
                    </div>
                </>
            )}
            {weather === 'Clouds' && (
                <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                    <div className="w-full h-full" style={{
                        background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(100,120,140,0.4), rgba(100,120,140,0))',
                    }} />
                </div>
            )}
            {weather === 'Night' && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-0">
                        {/* 夜空の深み */}
                        <div className="absolute inset-0" style={{
                            background: 'radial-gradient(ellipse 75% 45% at 50% 8%, rgba(132,173,235,0.12), transparent 60%)',
                        }} />

                        {/* 右上の三日月 */}
                        <div className="absolute right-[10%] top-[10%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#dce8ff] opacity-90 shadow-[0_0_35px_rgba(167,196,245,0.38)]" />
                        <div className="absolute right-[7.7%] top-[8.6%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#081325] opacity-95" />

                        {/* 小さな星 */}
                        <div className="absolute inset-0 opacity-60" style={{
                            backgroundImage: 'radial-gradient(circle at 12% 18%, rgba(220,235,255,0.95) 0 1px, transparent 2px), radial-gradient(circle at 24% 34%, rgba(220,235,255,0.85) 0 1px, transparent 2px), radial-gradient(circle at 41% 12%, rgba(220,235,255,0.92) 0 1px, transparent 2px), radial-gradient(circle at 62% 22%, rgba(220,235,255,0.86) 0 1px, transparent 2px), radial-gradient(circle at 76% 30%, rgba(220,235,255,0.94) 0 1px, transparent 2px), radial-gradient(circle at 88% 14%, rgba(220,235,255,0.80) 0 1px, transparent 2px)',
                            animation: 'night-twinkle 5s ease-in-out infinite',
                        }} />
                    </div>
                    <style>{`
                        @keyframes night-twinkle {
                            0%, 100% { opacity: 0.45; }
                            50% { opacity: 0.9; }
                        }
                    `}</style>
                </>
            )}
            {weather === 'Thunder' && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-0" style={{
                        background: 'radial-gradient(ellipse 50% 28% at 52% 18%, rgba(170,195,255,0.18), rgba(170,195,255,0.0) 72%)',
                    }} />
                    <div className="fixed inset-0 pointer-events-none z-0 bg-[#dbe9ff]" style={{ opacity: 0, animation: 'thunder-flash 4.8s infinite' }} />
                    <style>{`
                        @keyframes thunder-flash {
                            0%, 39%, 42%, 100% { opacity: 0; }
                            40% { opacity: 0.16; }
                            41% { opacity: 0.05; }
                        }
                    `}</style>
                </>
            )}

            {/* Ten-chan Companion */}
            {showHeavyEffects && (
                <TenchanCompanion
                    lang={lang}
                    section={activeSection}
                    overrideDialog={overrideDialog}
                    onClick={handleTenchanClick}
                />
            )}
        </main>
        </>
    );
}
