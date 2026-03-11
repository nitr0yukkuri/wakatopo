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

    let bgGradient = "from-[#aee1f9] to-[#e0f4fc]"; // Default (Clear / Night)
    let cardText = "text-gray-700";

    if (weather === 'Clouds') {
        bgGradient = "from-[#b5c2ca] to-[#d8e1e8] bg-gradient-to-b";
    } else if (weather === 'Rain') {
        bgGradient = "from-[#60a5fa] to-[#bfdbfe] bg-gradient-to-t"; // Original Rain Gradient
    } else if (weather === 'Snow') {
        bgGradient = "from-[#d1e6eb] to-[#f4fbfc] bg-gradient-to-b";
    }

    return (
        <main className={`relative w-full min-h-[120dvh] ${weather !== 'Rain' ? 'bg-gradient-to-b' : ''} ${bgGradient} text-gray-700 overflow-hidden font-sans pb-32 transition-colors duration-1000`}>

            {/* Background Parallax Clouds Layer (Hidden in Rain to emphasize rain, but kept in snow for blizzard feel) */}
            <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${weather === 'Rain' ? 'opacity-10' : 'opacity-100'}`}>
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
                                        あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。大阪で雨が降ればゲームの中も雨が降り、夜になればキャラクターも眠りにつきます。
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
            {weather === 'Rain' && (
                <div className="fixed inset-0 pointer-events-none z-0">
                    <RainParticles />
                </div>
            )}
            {weather === 'Snow' && (
                <div className="fixed inset-0 pointer-events-none z-0 opacity-60">
                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay animate-[fall_10s_linear_infinite]" />
                </div>
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
