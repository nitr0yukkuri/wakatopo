'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { useEffect, useRef, useState } from 'react';
import TenchanCompanion from '@/components/TenchanCompanion';

// A simple CSS cloud decoration component
function CloudDecoration({ className }: { className: string }) {
    return (
        <div className={`absolute pointer-events-none opacity-80 ${className}`}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
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
    const { setActiveWork } = useStore();

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

    return (
        // Bright sky blue gradient background
        <main className="relative w-full min-h-[120vh] bg-gradient-to-b from-[#aee1f9] to-[#e0f4fc] text-gray-700 overflow-x-hidden font-sans pb-32">

            {/* Background Decorations */}
            <CloudDecoration className="top-10 left-[-5%] w-64" />
            <CloudDecoration className="top-40 right-[-10%] w-80 transform -scale-x-100" />
            <CloudDecoration className="bottom-20 left-10 w-48" />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center animate-fade-in-up">

                {/* Pop Title Logo */}
                <div id="hero" ref={heroRef} className="mb-10 text-center scroll-mt-24 w-full flex justify-center">
                    <img
                        src="/otenkigurashi-logo.png"
                        alt="OTENKI GURASHI Logo"
                        className="w-full max-w-sm md:max-w-md drop-shadow-md"
                    />
                </div>

                {/* Fluffy White Content Card */}
                <div className="bg-white/95 backdrop-blur-sm border-4 border-white p-8 md:p-14 rounded-[3rem] w-full shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]">

                    <p className="text-xl md:text-2xl font-bold text-gray-600 mb-12 leading-relaxed text-center">
                        天気予報を見ないあなたの、<br className="md:hidden" />いちばん優しいおまもり。<br />
                        <span className="text-[#ffb03a] text-2xl md:text-3xl inline-block mt-2">おてんきぐらし</span> は、<br className="md:hidden" />現実の天気と連動するシミュレーションです。
                    </p>

                    <div className="space-y-12">
                        {/* THE CONCEPT */}
                        <div
                            id="concept"
                            ref={conceptRef}
                            onClick={() => handleInteract("ゲームみたいに天気を楽しめるんだ！", "happy")}
                            className="bg-[#f8fcfd] rounded-3xl p-8 border-2 border-[#e0f4fc] scroll-mt-32 cursor-pointer hover:border-[#ffb03a] hover:shadow-lg transition-all"
                        >
                            <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-4 flex items-center gap-3">
                                <span className="text-[#ffb03a]">01</span> CONCEPT
                            </h2>
                            <p className="text-gray-600 leading-relaxed max-w-3xl font-medium">
                                天気予報の確認は面倒だけど、急な雨や気圧の変化はつらい… そんな方々のために生まれました。
                                ゲーム性のある優しい世界を通して、面倒だった天気確認を「雨だから、ゲーム内で特別なことができるかも？」という、ポジティブな体験へと変えていきます。
                            </p>
                        </div>

                        {/* FEATURES */}
                        <div id="features" ref={featuresRef} className="scroll-mt-32">
                            <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                <span className="text-[#ffb03a]">02</span> FEATURES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div
                                    onClick={() => handleInteract("大阪で雨なら、ゲームでも雨だよ！", "talking")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">☀ REALTIME WEATHER SYNC</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。大阪で雨が降ればゲームの中も雨が降り、夜になればキャラクターも眠りにつきます。
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract("おさんぽで色んなアイテムを集めよう！", "happy")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">🚶 Osanpo (Walking)</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                        キャラクターを「おさんぽ」に出すことができます。おさんぽ先の景色や、手に入るアイテムは天気によって変化。コレクションする楽しみが待っています。
                                    </p>
                                </div>
                                <div
                                    onClick={() => handleInteract("思い出がたくさん記録されるよ！", "surprised")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1 md:col-span-2"
                                >
                                    <h3 className="text-[#ffb03a] font-bold text-lg mb-3">✨ COLLECTION & ACHIEVEMENTS</h3>
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
                            <div className="flex flex-wrap gap-3">
                                {['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenWeatherMap API', 'PWA'].map((tech) => (
                                    <span key={tech} className="px-5 py-2.5 bg-white border-2 border-[#a0e1fa] rounded-full text-sm font-bold text-[#7ab8cc] shadow-sm">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pop Buttons */}
                    <div id="bottom" ref={bottomRef} className="mt-16 pt-10 border-t-2 border-[#e0f4fc] flex flex-col sm:flex-row items-center justify-center gap-6 scroll-mt-32">
                        <a
                            href="https://weather-live-ochre.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#ffb03a] text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#e69a2e] hover:translate-y-[2px] hover:shadow-[0_4px_0_#e69a2e] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <span>アプリをひらく</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>

                        <a
                            href="https://github.com/nitr0yukkuri/otenkigurashi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-[#7ab8cc] border-2 border-[#a0e1fa] px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#a0e1fa] hover:translate-y-[2px] hover:shadow-[0_4px_0_#a0e1fa] active:translate-y-[6px] active:shadow-none transition-all"
                        >
                            GitHubをみる
                        </a>

                        <button
                            onClick={handleReturn}
                            className="text-[#98adc2] font-bold text-sm hover:text-[#7ab8cc] transition-colors underline underline-offset-4 ml-0 sm:ml-4 mt-6 sm:mt-0"
                        >
                            ホームにもどる
                        </button>
                    </div>
                </div>
            </div>

            {/* Ten-chan Companion */}
            <TenchanCompanion
                section={activeSection}
                overrideDialog={overrideDialog}
                onClick={handleTenchanClick}
            />
        </main>
    );
}
