'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import TenchanCompanion from '@/components/TenchanCompanion';
import { Canvas } from '@react-three/fiber';
import { RainParticles } from '@/components/canvas/RainTransitionCanvas';

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

export default function OtenkiGurashiPage() {
    const router = useRouter();
    const { setActiveWork, weather } = useStore();

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

    const handleInteract = (text: string, mood: DialogType['mood']) => {
        setOverrideDialog({ text, mood });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOverrideDialog(null);
        }, 4000); // 4秒後に元のセリフに戻る
    };

    const handleTenchanClick = () => {
        const reactions: DialogType[] = [
            { text: "えへへ！", mood: "happy" },
            { text: "おさんぽ行く？", mood: "looking" },
            { text: "ふわああ…", mood: "sleepy" },
            { text: "なになに？", mood: "surprised" },
            { text: "今日もいいお天気！", mood: "talking" }
        ];
        const random = reactions[Math.floor(Math.random() * reactions.length)];
        handleInteract(random.text, random.mood);
    };

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

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push('/');
    };

    let bgGradient = "from-[#aee1f9] to-[#e0f4fc]"; // Default (Clear)
    let cardText = "text-gray-700";

    if (weather === 'Clouds') {
        bgGradient = "from-[#6b7a8d] via-[#8fa0b0] to-[#b5c2ca]";
    } else if (weather === 'Rain') {
        bgGradient = "from-[#60a5fa] to-[#bfdbfe] bg-gradient-to-t"; // Original Rain Gradient
    } else if (weather === 'Snow') {
        bgGradient = "from-[#dbeeff] via-[#eef5fc] to-[#f4fbfc]";
    } else if (weather === 'Thunder') {
        bgGradient = "from-[#1a1a2e] via-[#16213e] to-[#0f3460]";
        cardText = "text-gray-200";
    } else if (weather === 'Night') {
        bgGradient = "from-[#030915] via-[#071428] to-[#0b1f36]";
        cardText = "text-gray-200";
    }

    return (
        <main className={`relative w-full min-h-[120dvh] ${weather !== 'Rain' ? 'bg-gradient-to-b' : ''} ${bgGradient} ${weather === 'Thunder' || weather === 'Night' ? 'text-gray-200' : 'text-gray-700'} overflow-hidden font-sans pb-32 transition-colors duration-1000`}>

            {/* Background Parallax Clouds Layer */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${weather === 'Rain' ? 'opacity-8' : weather === 'Thunder' ? 'opacity-35' : weather === 'Snow' ? 'opacity-70' : weather === 'Clouds' ? 'opacity-100' : weather === 'Night' ? 'opacity-45' : 'opacity-30'}`}>
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
                    <img
                        src="/otenkigurashi-logo.png"
                        alt="OTENKI GURASHI Logo"
                        className="w-full max-w-[16rem] md:max-w-md drop-shadow-md"
                    />
                </div>

                {/* Fluffy White Content Card */}
                <div className="bg-white/95 backdrop-blur-sm border-4 border-white px-6 py-10 md:p-14 rounded-[2.5rem] md:rounded-[3rem] w-full shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]">

                    <p className="text-lg md:text-2xl font-bold text-gray-600 mb-10 md:mb-12 leading-relaxed text-center">
                        天気予報を見ないあなたの、<br className="md:hidden" />いちばん優しいおまもり。<br />
                        <span className="text-[#ffb03a] text-xl md:text-3xl inline-block mt-2 font-black">おてんきぐらし</span> は、<br className="md:hidden" />現実の天気と連動するシミュレーションです。
                    </p>

                    <div className="space-y-12">
                        {/* Section 1: Concept */}
                        <section id="concept" ref={conceptRef} className="mb-32 animate-fade-in-up scroll-mt-32" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-4 mb-8">
                                <span className="text-4xl font-bold text-[#ffb03a]">01</span>
                                <h2 className="text-2xl font-bold tracking-widest text-[#7ab8cc]">コンセプト</h2>
                            </div>
                            <div
                                onClick={() => handleInteract("ゲームみたいに天気を楽しめるんだ！", "happy")}
                                className="bg-white/90 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border-4 border-white shadow-xl max-w-3xl cursor-pointer hover:border-[#ffb03a] hover:shadow-lg transition-all"
                            >
                                <p className="text-base md:text-xl leading-relaxed text-gray-700 font-medium">
                                    天気予報の確認は面倒だけど、急な雨や気圧の変化はつらい… そんな方々のために生まれました。
                                    ゲーム性のある優しい世界を通して、面倒だった天気確認を「雨だから、ゲーム内で特別なことができるかも？」という、ポジティブな体験へと変えていきます。
                                </p>
                            </div>
                        </section>
                        <div id="features" ref={featuresRef} className="scroll-mt-32">
                            <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                <span className="text-[#ffb03a]">02</span> FEATURES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => handleInteract("大阪で雨なら、ゲームでも雨だよ！", "talking")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">☀ リアルタイム天気連動</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。雨は雨粒、雷はフラッシュ、雪は降雪モーションとして画面に現れ、夜になればキャラクターも眠りにつきます。
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract("おさんぽで色んなアイテムを集めよう！", "happy")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">🚶 おさんぽ (Walking)</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        キャラクターを「おさんぽ」に出すことができます。おさんぽ先の景色や、手に入るアイテムは天気によって変化。コレクションする楽しみが待っています。
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract("思い出がたくさん記録されるよ！", "surprised")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1 md:col-span-2"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">✨ コレクション＆実績</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        レベルアップのようなノルマはありません。「おさんぽ」で集めたアイテムを眺める「ずかん」や、「はじめて雨の日におさんぽした」といったキャラクターとの思い出を記録する「実績」が、あなたの毎日を彩ります。
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
                                onClick={() => handleInteract("Next.jsで作られてるよ！", "surprised")}
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
                    <div id="bottom" ref={bottomRef} className="mt-16 pt-10 border-t-2 border-[#e0f4fc] flex flex-col sm:flex-row items-center justify-center gap-6 scroll-mt-32">
                        <a
                            href="https://otenki-gurashi.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#ffb03a] text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#e69a2e] hover:translate-y-[2px] hover:shadow-[0_4px_0_#e69a2e] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <span>アプリをひらく</span> ↗
                        </a>

                        <a
                            href="https://github.com/nitr0yukkuri/otenkigurashi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-[#7ab8cc] border-2 border-[#e0f4fc] px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#d1effa] hover:translate-y-[2px] hover:border-[#7ab8cc] hover:shadow-[0_4px_0_#a0e1fa] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <span>GitHubをみる</span> ↗
                        </a>
                    </div>

                    <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                        <Link href="/" className="inline-block border-2 border-[#7ab8cc] text-[#7ab8cc] hover:bg-[#7ab8cc] hover:text-white font-bold py-4 px-12 rounded-full transition-colors">
                            ホームにもどる
                        </Link>
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
            {weather === 'Rain' && (
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
                <div className="fixed inset-0 pointer-events-none z-0 opacity-70">
                    {/* Snow flakes as CSS dots */}
                    <div className="w-full h-full" style={{
                        backgroundImage: 'radial-gradient(ellipse 2px 3px at 50% 50%, rgba(255,255,255,0.85) 0%, transparent 100%)',
                        backgroundSize: '80px 80px',
                        animation: 'snowfall 8s linear infinite',
                    }} />
                    <div className="w-full h-full absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0 1.5px, transparent 2px)',
                        backgroundSize: '120px 120px',
                        animation: 'snowfall-slow 13s linear infinite',
                    }} />
                    <style>{`
                        @keyframes snowfall {
                            from { background-position: 0 -80px; }
                            to { background-position: 40px 80px; }
                        }
                        @keyframes snowfall-slow {
                            from { background-position: 0 -120px; }
                            to { background-position: -36px 120px; }
                        }
                    `}</style>
                </div>
            )}
            {weather === 'Clouds' && (
                <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                    <div className="w-full h-full" style={{
                        background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(100,120,140,0.4), transparent)',
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
                    {/* 雨のライン */}
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-40" style={{
                        backgroundImage: 'repeating-linear-gradient(175deg, transparent, transparent 2px, rgba(140,160,210,0.4) 2px, rgba(140,160,210,0.4) 4px)',
                        backgroundSize: '4px 60px',
                        animation: 'thunder-rain 0.25s linear infinite',
                    }} />
                    <div className="fixed inset-0 pointer-events-none z-0" style={{
                        background: 'radial-gradient(ellipse 50% 28% at 52% 18%, rgba(170,195,255,0.18), rgba(170,195,255,0.0) 72%)',
                    }} />
                    <div className="fixed inset-0 pointer-events-none z-0" style={{
                        backgroundImage: 'linear-gradient(108deg, transparent 0%, transparent 46%, rgba(230,240,255,0.9) 48%, rgba(200,220,255,0.0) 52%, transparent 54%), linear-gradient(79deg, transparent 0%, transparent 62%, rgba(230,240,255,0.65) 64%, rgba(200,220,255,0.0) 67%, transparent 70%)',
                        opacity: 0,
                        animation: 'thunder-bolt 4.8s infinite',
                    }} />
                    <div className="fixed inset-0 pointer-events-none z-0 bg-[#dbe9ff]" style={{ opacity: 0, animation: 'thunder-flash 4.8s infinite' }} />
                    <style>{`
                        @keyframes thunder-rain {
                            from { background-position: 0 0; }
                            to { background-position: 4px 60px; }
                        }
                        @keyframes thunder-flash {
                            0%, 39%, 42%, 100% { opacity: 0; }
                            40% { opacity: 0.16; }
                            41% { opacity: 0.05; }
                        }
                        @keyframes thunder-bolt {
                            0%, 39%, 42%, 100% { opacity: 0; }
                            40% { opacity: 0.52; }
                            41% { opacity: 0.15; }
                        }
                    `}</style>
                </>
            )}

            {/* Ten-chan Companion */}
            <TenchanCompanion
                section={activeSection}
                overrideDialog={overrideDialog}
                onClick={handleTenchanClick}
            />
        </main>
    );
}
