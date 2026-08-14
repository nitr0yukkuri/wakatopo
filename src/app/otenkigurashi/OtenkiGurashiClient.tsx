'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import {
    AUTUMN_BACKGROUND_GRADIENT,
    SPRING_FLOWER_CLOUDY_BACKGROUND_GRADIENT,
    TSUYU_CLEAR_BACKGROUND_GRADIENT,
    TSUYU_CLOUDS_BACKGROUND_GRADIENT,
    TSUYU_RAIN_BACKGROUND_GRADIENT,
    WINTER_BACKGROUND_GRADIENT,
} from '@/lib/otenkigurashiSeasonal';
import { parseMoonPhaseOverride } from '@/lib/moonPhase';
import { buildWorldStateQuery, canonicalizeWorldStateQuery } from '@/lib/worldState';
import { useWorldState } from '@/components/WorldStateProvider';
import { OTENKI_COPY } from './otenkigurashiCopy';
import WeatherCursor from './WeatherCursor';
import { useEffect, useRef, useState } from 'react';
import dynamicImport from 'next/dynamic';
import Image from 'next/image';

const TenchanCompanion = dynamicImport(() => import('@/components/TenchanCompanion'), { ssr: false });
const RainParticles = dynamicImport(
    () => import('@/components/canvas/RainTransitionCanvas').then((m) => m.RainParticles),
    { ssr: false },
);
const SnowCanvas = dynamicImport(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });
const ThunderCanvas = dynamicImport(() => import('@/components/canvas/ThunderTransitionCanvas'), { ssr: false });
const MoonPhase = dynamicImport(() => import('@/components/dom/MoonPhase'), { ssr: false });
const OtenkiSeasonEffects = dynamicImport(() => import('./OtenkiSeasonEffects'), { ssr: false });
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

export default function OtenkiGurashiClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork } = useStore();
    const displayedWorldState = useWorldState();
    const displayedWeather = displayedWorldState.weather;

    const t = OTENKI_COPY[lang];
    const displayedSeason = displayedWorldState.season;
    const displayedSeasonEvent = displayedWorldState.seasonEvent;
    const moonPhaseOverride = parseMoonPhaseOverride(searchParams.get('moonPhase'));

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
        const hasRouteWorldState = ['weather', 'season', 'seasonEvent'].some((key) => searchParams.has(key));
        if (!hasRouteWorldState) return;

        const canonicalQuery = canonicalizeWorldStateQuery(searchParams, displayedWorldState).toString();
        if (canonicalQuery !== searchParams.toString()) {
            router.replace(`/otenkigurashi?${canonicalQuery}`, { scroll: false });
        }
    }, [displayedWorldState, router, searchParams]);

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
        router.push(`/?${buildWorldStateQuery({ weather: displayedWeather, season: displayedSeason, seasonEvent: displayedSeasonEvent }, lang)}`);
    };

    let bgGradient = "from-[#aee1f9] to-[#e0f4fc]"; // Default (Clear)
    let cardText = "text-gray-700";

    if (displayedWeather === 'Clouds') {
        bgGradient = "from-[#6b7a8d] via-[#8fa0b0] to-[#b5c2ca]";
    } else if (displayedWeather === 'Rain') {
        bgGradient = "from-[#60a5fa] to-[#bfdbfe] bg-gradient-to-t"; // Original Rain Gradient
    } else if (displayedWeather === 'Snow') {
        bgGradient = "bg-[#eef7fd]";
    } else if (displayedWeather === 'Thunder') {
        bgGradient = "from-[#1a1a2e] via-[#16213e] to-[#0f3460]";
        cardText = "text-gray-200";
    } else if (displayedWeather === 'Night') {
        bgGradient = "from-[#030915] via-[#071428] to-[#0b1f36]";
        cardText = "text-gray-200";
    }

    if (displayedSeason === 'spring' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')) {
        bgGradient = "from-[#fcedf3] via-[#fff5f9] to-[#fffdfd]";
    }

    if (displayedSeason === 'spring' && displayedWeather === 'Clouds') {
        bgGradient = "from-[#c5d1d9] via-[#e6e9e7] to-[#f3e8ed]";
    }

    if (displayedSeason === 'autumn' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')) {
        bgGradient = "from-[#c7ded9] via-[#f1e6ce] to-[#e4b36f]";
    }

    if (displayedSeason === 'summer' && displayedSeasonEvent === 'geshi' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')) {
        bgGradient = "from-[#bddfeb] via-[#e0eef0] to-[#fff0cf]";
    }

    if (displayedSeasonEvent === 'tsuyu') {
        bgGradient = displayedWeather === 'Rain'
            ? TSUYU_RAIN_BACKGROUND_GRADIENT
            : displayedWeather === 'Clouds'
                ? TSUYU_CLOUDS_BACKGROUND_GRADIENT
                : displayedWeather === 'Clear' || displayedWeather === 'Morning'
                    ? TSUYU_CLEAR_BACKGROUND_GRADIENT
                    : bgGradient;
    }

    const springCardStyle = displayedSeason === 'spring' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')
        ? 'border-white shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]'
        : 'border-white shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]';
    const isSpringSun = displayedSeason === 'spring' && (displayedWeather === 'Clear' || displayedWeather === 'Morning');
    const isFlowerCloudy = displayedSeason === 'spring' && displayedWeather === 'Clouds';
    const isGeshiSun = displayedSeason === 'summer' && displayedSeasonEvent === 'geshi' && (displayedWeather === 'Clear' || displayedWeather === 'Morning');
    const isTsuyu = displayedSeason === 'summer' && displayedSeasonEvent === 'tsuyu';
    const isWinterSnowScene = displayedSeason === 'winter' && displayedWeather === 'Snow';

    return (
        <>
            <WeatherCursor weatherOverride={displayedWeather} seasonOverride={displayedSeason} />
            <main className={`relative w-full min-h-[120dvh] ${displayedWeather !== 'Rain' && displayedWeather !== 'Snow' ? 'bg-gradient-to-b' : ''} ${bgGradient} ${displayedWeather === 'Thunder' || displayedWeather === 'Night' ? 'text-gray-200' : 'text-gray-700'} overflow-hidden font-sans pb-32 transition-colors duration-1000`} style={{
                cursor: isFinePointer ? 'none' : 'auto',
                background: displayedSeason === 'autumn' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')
                    ? AUTUMN_BACKGROUND_GRADIENT
                    : isTsuyu && (displayedWeather === 'Clear' || displayedWeather === 'Morning')
                        ? TSUYU_CLEAR_BACKGROUND_GRADIENT
                    : isTsuyu && displayedWeather === 'Clouds'
                        ? TSUYU_CLOUDS_BACKGROUND_GRADIENT
                    : isTsuyu && displayedWeather === 'Rain'
                        ? TSUYU_RAIN_BACKGROUND_GRADIENT
                    : isFlowerCloudy
                        ? SPRING_FLOWER_CLOUDY_BACKGROUND_GRADIENT
                    : isWinterSnowScene
                        ? WINTER_BACKGROUND_GRADIENT
                    : undefined,
            }}>
                <OtenkiSeasonEffects season={displayedSeason} seasonEvent={displayedSeasonEvent} weather={displayedWeather} />

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
                <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${displayedWeather === 'Rain' ? 'opacity-8' : displayedWeather === 'Thunder' ? 'opacity-35' : displayedWeather === 'Snow' ? 'opacity-0' : displayedWeather === 'Clouds' ? 'opacity-100' : displayedWeather === 'Night' ? 'opacity-45' : 'opacity-30'}`}>
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
                    <div className={`${displayedWeather === 'Snow' ? 'bg-white/92' : 'bg-white/95'} ${displayedWeather === 'Snow' ? '' : 'backdrop-blur-sm'} border-4 ${displayedWeather === 'Snow' ? 'border-transparent' : springCardStyle} px-6 py-10 md:p-14 rounded-[2.5rem] md:rounded-[3rem] w-full ${displayedWeather === 'Snow' ? 'shadow-none' : ''}`}>

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
                                href="https://weather-live-ochre.vercel.app/"
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
                {(displayedWeather === 'Clear' || displayedWeather === 'Morning') && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-0">
                            <div
                                className="absolute right-[8%] top-[9%] w-24 h-24 md:w-32 md:h-32 rounded-full"
                                style={{
                                    background: isSpringSun
                                        ? 'radial-gradient(circle at 35% 35%, rgba(255,248,214,0.98) 0%, rgba(255,218,133,0.92) 38%, rgba(242,176,76,0.88) 100%)'
                                        : 'radial-gradient(circle at 35% 35%, rgba(255,245,180,0.96) 0%, rgba(255,213,112,0.92) 38%, rgba(255,170,58,0.92) 100%)',
                                    boxShadow: isSpringSun
                                        ? '0 0 45px rgba(247,190,101,0.28), 0 0 110px rgba(236,163,80,0.12)'
                                        : isGeshiSun
                                            ? '0 0 28px rgba(150,211,240,0.22), 0 0 72px rgba(124,190,226,0.09)'
                                        : '0 0 45px rgba(255,205,110,0.55), 0 0 110px rgba(255,187,82,0.35)',
                                    animation: isGeshiSun
                                        ? 'geshi-sun-soft-pulse 4.6s ease-in-out infinite'
                                        : 'sun-soft-pulse 4.6s ease-in-out infinite',
                                }}
                            />
                            <div
                                className="absolute right-[3%] top-[2%] w-44 h-44 md:w-64 md:h-64 rounded-full"
                                style={{
                                    background: isSpringSun
                                        ? 'radial-gradient(circle, rgba(255,224,157,0.20) 0%, rgba(245,183,97,0.06) 42%, rgba(245,183,97,0.0) 74%)'
                                        : isGeshiSun
                                            ? 'radial-gradient(circle, rgba(185,228,246,0.13) 0%, rgba(145,207,235,0.035) 42%, rgba(145,207,235,0.0) 74%)'
                                        : 'radial-gradient(circle, rgba(255,220,150,0.36) 0%, rgba(255,220,150,0.08) 42%, rgba(255,220,150,0.0) 74%)',
                                    animation: 'sun-aura-spin 16s linear infinite',
                                }}
                            />
                        </div>
                        <style>{`
                        @keyframes sun-soft-pulse {
                            0%, 100% { transform: scale(1); opacity: 0.94; }
                            50% { transform: scale(1.05); opacity: 1; }
                        }
                        @keyframes geshi-sun-soft-pulse {
                            0%, 100% { transform: scale(1); opacity: 0.84; }
                            50% { transform: scale(1.035); opacity: 0.9; }
                        }
                        @keyframes sun-aura-spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                    </>
                )}
                {(displayedWeather === 'Rain' || displayedWeather === 'Thunder') && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-20">
                            <RainParticles intensity="heavy" />
                        </div>
                        <div className="fixed inset-0 pointer-events-none z-20 opacity-45" style={{
                            background: 'linear-gradient(180deg, rgba(52,95,145,0.24) 0%, rgba(67,123,188,0.18) 35%, rgba(18,52,90,0.24) 100%)',
                        }} />
                    </>
                )}
                {displayedWeather === 'Snow' && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-20">
                            <SnowCanvas density={1.45} />
                        </div>
                    </>
                )}
                {displayedWeather === 'Clouds' && (
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                        <div className="w-full h-full" style={{
                            background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(100,120,140,0.4), rgba(100,120,140,0))',
                        }} />
                    </div>
                )}
                {displayedWeather === 'Night' && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-0">
                            {/* 夜空の深み */}
                            <div className="absolute inset-0" style={{
                                background: 'radial-gradient(ellipse 75% 45% at 50% 8%, rgba(132,173,235,0.12), transparent 60%)',
                            }} />

                            {/* 右上の三日月 */}
                            <MoonPhase
                                phaseOverride={moonPhaseOverride}
                                className="absolute right-[10%] top-[10%] w-24 h-24 md:w-32 md:h-32 opacity-90"
                            />

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
                {displayedWeather === 'Thunder' && (
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <ThunderCanvas continuous={true} />
                    </div>
                )}

                {/* Ten-chan Companion */}
                {showHeavyEffects && (
                    <TenchanCompanion
                        lang={lang}
                        section={activeSection}
                        weather={displayedWeather}
                        showUmbrella={false}
                        showSakura={isSpringSun || isFlowerCloudy}
                        showMomiji={displayedSeason === 'autumn' && (displayedWeather === 'Clear' || displayedWeather === 'Morning')}
                        showHydrangea={isTsuyu}
                        showSnowflake={displayedWeather === 'Snow'}
                        showRainDrop={displayedWeather === 'Rain' && !isTsuyu}
                        showLightning={displayedWeather === 'Thunder'}
                        showNightStar={displayedWeather === 'Night'}
                        overrideDialog={overrideDialog}
                        onClick={handleTenchanClick}
                    />
                )}
            </main>
        </>
    );
}
