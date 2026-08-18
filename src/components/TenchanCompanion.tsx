'use client';

import { motion, AnimatePresence } from 'framer-motion';

type TenchanWeather = 'Clear' | 'Rain' | 'Clouds' | 'Snow' | 'Night' | 'Morning' | 'Thunder';

type CharacterFaceProps = {
    mood?: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking";
    petColor?: string;
    cheekColor?: string;
    isStatic?: boolean;
    showSakura?: boolean;
    showMomiji?: boolean;
    showHydrangea?: boolean;
    showSnowflake?: boolean;
    showRainDrop?: boolean;
    showLightning?: boolean;
    showNightStar?: boolean;
    showBirthday?: boolean;
};

export function CharacterFace({
    mood = "happy",
    petColor = "white",
    cheekColor = "#F8BBD0",
    isStatic = false,
    showSakura = false,
    showMomiji = false,
    showHydrangea = false,
    showSnowflake = false,
    showRainDrop = false,
    showLightning = false,
    showNightStar = false,
    showBirthday = false,
}: CharacterFaceProps) {

    const getMouthPath = () => {
        switch (mood) {
            case "happy":
                return "M 45 75 Q 60 90 75 75";
            case "talking":
                return "M 48 78 Q 60 88 72 78 M 55 82 Q 60 88 65 82"; // 小さい口を追加して喋っている感
            case "surprised":
                return "M 57 80 A 3 3 0 1 0 63 80 A 3 3 0 1 0 57 80"; // 小さく「おっ」という口
            case "neutral":
            case "looking":
                return "M 45 80 Q 60 85 75 80";
            case "sad":
                return "M 45 85 Q 60 75 75 85";
            case "scared":
                return "M 40 82 Q 45 77 50 82 Q 55 87 60 82 Q 65 77 70 82 Q 75 87 80 82";
            case "sleepy":
                return "M 55 80 Q 60 85 65 80 Q 60 75 55 80";
            default:
                return "M 45 75 Q 60 90 75 75";
        }
    };

    const isRainbow = petColor === 'rainbow';
    const safePetColor = petColor === 'white' ? '#ffffff' : petColor;

    const rainbowAnimation = {
        fill: [
            "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000"
        ],
        transition: { duration: 4, repeat: Infinity, ease: "linear" as const }
    };

    return (
        <motion.div
            style={{ width: '100%', height: '100%' }}
        >
            <motion.svg
                viewBox="0 0 120 120"
                width="100%"
                height="100%"
                animate={isStatic ? undefined : {
                    y: ["-3%", "3%"],
                    rotate: [-2, 2, -2]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
            >
                {/* 顔のベース */}
                <motion.circle
                    cx="60" cy="60" r="60"
                    fill={isRainbow ? '#ff0000' : safePetColor}
                    animate={isStatic ? undefined : (isRainbow ? rainbowAnimation : { fill: safePetColor })}
                />

                {showSakura && (
                    <g transform="translate(86 16) rotate(12)" aria-hidden="true">
                        <ellipse cx="0" cy="-5" rx="3.8" ry="5" fill="#f5a9c4" stroke="#e58dab" strokeWidth="0.8" />
                        <ellipse cx="4.8" cy="-1.5" rx="3.8" ry="5" transform="rotate(72 4.8 -1.5)" fill="#f7b6cc" stroke="#e58dab" strokeWidth="0.8" />
                        <ellipse cx="3" cy="4.3" rx="3.8" ry="5" transform="rotate(144 3 4.3)" fill="#f5a9c4" stroke="#e58dab" strokeWidth="0.8" />
                        <ellipse cx="-3" cy="4.3" rx="3.8" ry="5" transform="rotate(216 -3 4.3)" fill="#f7b6cc" stroke="#e58dab" strokeWidth="0.8" />
                        <ellipse cx="-4.8" cy="-1.5" rx="3.8" ry="5" transform="rotate(288 -4.8 -1.5)" fill="#f5a9c4" stroke="#e58dab" strokeWidth="0.8" />
                        <circle cx="0" cy="0" r="2.4" fill="#f4c45b" stroke="#d59b45" strokeWidth="0.7" />
                    </g>
                )}

                {showMomiji && (
                    <g transform="translate(88 16) rotate(12) scale(0.78)" aria-hidden="true">
                        <path
                            d="M0 14 C-1 10 -1 6 -1 3 C-5 6 -10 8 -14 7 C-12 4 -9 1 -6 -1 C-10 -1 -13 -3 -14 -5 C-11 -7 -7 -8 -4 -7 C-4 -11 -2 -14 0 -16 C2 -14 4 -11 4 -7 C7 -8 11 -7 14 -5 C13 -3 10 -1 6 -1 C9 1 12 4 14 7 C10 8 5 6 1 3 C1 6 1 10 0 14 Z"
                            fill="#e6a14d"
                            stroke="#b86f32"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />
                        <path d="M0 11 L0 -9 M0 1 L-6 -2 M0 1 L6 -2" fill="none" stroke="#f7d27d" strokeWidth="1.2" strokeLinecap="round" />
                    </g>
                )}

                {showHydrangea && (
                    <g transform="translate(88 19) rotate(8) scale(1.12)" aria-hidden="true" data-weather-accessory="hydrangea">
                        <path d="M-12 9 C-8 3 -3 3 1 8 C-3 11 -8 11 -12 9 Z" fill="#6d9b72" stroke="#456e50" strokeWidth="0.9" />
                        <path d="M-1 9 C4 3 10 4 13 9 C8 11 3 11 -1 9 Z" fill="#79a979" stroke="#456e50" strokeWidth="0.9" />
                        <path d="M0 10 C-1 5 -1 0 1 -5" fill="none" stroke="#4f7d58" strokeWidth="1.2" strokeLinecap="round" />
                        <g transform="translate(-8 -5)" fill="#8e78c8" stroke="#66509c" strokeWidth="0.65">
                            <circle cx="0" cy="-3.2" r="2.8" /><circle cx="3" cy="-0.9" r="2.8" /><circle cx="1.8" cy="2.6" r="2.8" /><circle cx="-1.8" cy="2.6" r="2.8" /><circle cx="-3" cy="-0.9" r="2.8" /><circle cx="0" cy="0" r="1.05" fill="#f6df9a" stroke="#b78c4e" strokeWidth="0.35" />
                        </g>
                        <g transform="translate(0 -9)" fill="#7ea8d6" stroke="#587fae" strokeWidth="0.65">
                            <circle cx="0" cy="-3.2" r="2.8" /><circle cx="3" cy="-0.9" r="2.8" /><circle cx="1.8" cy="2.6" r="2.8" /><circle cx="-1.8" cy="2.6" r="2.8" /><circle cx="-3" cy="-0.9" r="2.8" /><circle cx="0" cy="0" r="1.05" fill="#f6df9a" stroke="#b78c4e" strokeWidth="0.35" />
                        </g>
                        <g transform="translate(8 -5)" fill="#b18bd0" stroke="#795ca5" strokeWidth="0.65">
                            <circle cx="0" cy="-3.2" r="2.8" /><circle cx="3" cy="-0.9" r="2.8" /><circle cx="1.8" cy="2.6" r="2.8" /><circle cx="-1.8" cy="2.6" r="2.8" /><circle cx="-3" cy="-0.9" r="2.8" /><circle cx="0" cy="0" r="1.05" fill="#f6df9a" stroke="#b78c4e" strokeWidth="0.35" />
                        </g>
                        <g transform="translate(-3 1)" fill="#9d90d4" stroke="#6b5ca1" strokeWidth="0.65">
                            <circle cx="0" cy="-3.2" r="2.8" /><circle cx="3" cy="-0.9" r="2.8" /><circle cx="1.8" cy="2.6" r="2.8" /><circle cx="-1.8" cy="2.6" r="2.8" /><circle cx="-3" cy="-0.9" r="2.8" /><circle cx="0" cy="0" r="1.05" fill="#f6df9a" stroke="#b78c4e" strokeWidth="0.35" />
                        </g>
                        <g transform="translate(5 1)" fill="#85a9d6" stroke="#587fae" strokeWidth="0.65">
                            <circle cx="0" cy="-3.2" r="2.8" /><circle cx="3" cy="-0.9" r="2.8" /><circle cx="1.8" cy="2.6" r="2.8" /><circle cx="-1.8" cy="2.6" r="2.8" /><circle cx="-3" cy="-0.9" r="2.8" /><circle cx="0" cy="0" r="1.05" fill="#f6df9a" stroke="#b78c4e" strokeWidth="0.35" />
                        </g>
                    </g>
                )}

                {showSnowflake && (
                    <g transform="translate(88 16) rotate(12)" aria-hidden="true" data-weather-accessory="snow">
                        <g stroke="#b9e8ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M0 -10 L0 10 M-8.7 -5 L8.7 5 M-8.7 5 L8.7 -5" />
                            <path d="M0 -10 L-2.5 -7 M0 -10 L2.5 -7 M0 10 L-2.5 7 M0 10 L2.5 7" />
                            <path d="M-8.7 -5 L-5.2 -4.8 M-8.7 -5 L-7 -1.8 M8.7 5 L5.2 4.8 M8.7 5 L7 1.8" />
                            <path d="M-8.7 5 L-5.2 4.8 M-8.7 5 L-7 1.8 M8.7 -5 L5.2 -4.8 M8.7 -5 L7 -1.8" />
                        </g>
                        <circle cx="0" cy="0" r="1.8" fill="#e9f8ff" stroke="#8acde9" strokeWidth="0.7" />
                    </g>
                )}

                {showRainDrop && (
                    <g transform="translate(88 15) rotate(10)" aria-hidden="true" data-weather-accessory="rain">
                        <path
                            d="M0 -10 C-2.6 -6 -6.2 -2.3 -6.2 1.4 A6.2 6.2 0 0 0 6.2 1.4 C6.2 -2.3 2.6 -6 0 -10 Z"
                            fill="#9edcf2"
                            stroke="#4f9fc3"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                        />
                        <path d="M-2.4 -1.2 C-2.1 -3.1 -1.2 -4.5 0 -5.9" fill="none" stroke="#eaffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.82" />
                    </g>
                )}

                {showLightning && (
                    <g transform="translate(88 15) rotate(8)" aria-hidden="true" data-weather-accessory="thunder">
                        <path
                            d="M2 -12 L-6 1 L0 0 L-3 12 L8 -3 L2 -2 Z"
                            fill="#f6d45f"
                            stroke="#bd8b32"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />
                    </g>
                )}

                {showNightStar && (
                    <g transform="translate(88 15)" aria-hidden="true" data-weather-accessory="night">
                    <motion.g
                        animate={isStatic ? undefined : { opacity: [0.72, 1, 0.78], scale: [0.92, 1.08, 0.96] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <path
                            d="M0 -13 C-2.2 -5.2 -5.2 -2.2 -13 0 C-5.2 2.2 -2.2 5.2 0 13 C2.2 5.2 5.2 2.2 13 0 C5.2 -2.2 2.2 -5.2 0 -13 Z"
                            fill="#ffe79a"
                            stroke="#cf9f3f"
                            strokeWidth="0.9"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M0 -17 L0 -10 M0 10 L0 17 M-17 0 L-10 0 M10 0 L17 0"
                            fill="none"
                            stroke="#fff8d0"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            opacity="0.9"
                        />
                        <circle cx="0" cy="0" r="1.7" fill="#fffbe0" />
                    </motion.g>
                    </g>
                )}

                {showBirthday && (
                    <g transform="translate(87 16) rotate(8)" aria-hidden="true" data-birthday-accessory="birthday">
                        <path d="M-13 -5 Q0 -9 13 -5 L11 7 Q0 11 -11 7 Z" fill="#fff4fb" stroke="#b9799a" strokeWidth="1.2" />
                        <path d="M-13 -5 Q-9 1 -5 -5 Q0 1 5 -5 Q9 1 13 -5" fill="none" stroke="#f3a9ca" strokeWidth="2" strokeLinecap="round" />
                        <ellipse cx="0" cy="8" rx="15" ry="3" fill="#9edfee" stroke="#5c9caf" strokeWidth="1.2" />
                        <path d="M-8 -7 L-8 -14 M0 -8 L0 -16 M8 -7 L8 -14" fill="none" stroke="#8bd7e9" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M-8 -14 C-10 -17 -6 -18 -8 -20 M0 -16 C-2 -19 2 -20 0 -23 M8 -14 C6 -17 10 -18 8 -20" fill="none" stroke="#ffe79a" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                )}

                {/* ほっぺ */}
                <circle cx="20" cy="70" r="12" fill={cheekColor} />
                <circle cx="100" cy="70" r="12" fill={cheekColor} />

                {/* 目 */}
                {mood === 'scared' ? (
                    <motion.g
                        animate={isStatic ? undefined : { x: [-1, 1, -1], y: [0, 1, 0] }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                    >
                        <path d="M 35 50 L 45 55 L 35 60" fill="none" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 85 50 L 75 55 L 85 60" fill="none" stroke="#5D4037" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.g>
                ) : mood === 'sleepy' ? (
                    <g>
                        <path d="M 35 55 Q 40 60 45 55" fill="none" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 75 55 Q 80 60 85 55" fill="none" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
                    </g>
                ) : mood === 'looking' ? (
                    <motion.g
                        animate={isStatic ? undefined : { x: [2, -2, 2], y: [0, -2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <circle cx="40" cy="55" r="5" fill="#5D4037" />
                        <circle cx="80" cy="55" r="5" fill="#5D4037" />
                    </motion.g>
                ) : (
                    <motion.g
                        style={{ transformOrigin: "60px 55px" }}
                        animate={isStatic ? undefined : { scaleY: [1, 0.1, 1] }}
                        transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                    >
                        <circle cx="40" cy="55" r="5" fill="#5D4037" />
                        <circle cx="80" cy="55" r="5" fill="#5D4037" />
                    </motion.g>
                )}

                {/* 口 */}
                <AnimatePresence mode="wait">
                    <motion.path
                        key={mood}
                        d={getMouthPath()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        stroke="#5D4037"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </AnimatePresence>
            </motion.svg>
        </motion.div>
    );
}

// Ten-chan Companion Component
type TenchanCompanionProps = {
    section: 'hero' | 'concept' | 'features' | 'tech' | 'bottom';
    lang?: 'ja' | 'en';
    weather?: TenchanWeather;
    showUmbrella?: boolean;
    showSakura?: boolean;
    showMomiji?: boolean;
    showHydrangea?: boolean;
    showSnowflake?: boolean;
    showRainDrop?: boolean;
    showLightning?: boolean;
    showNightStar?: boolean;
    showBirthdayCake?: boolean;
    overrideDialog?: { text: string; mood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking" } | null;
    onClick?: () => void;
};

export default function TenchanCompanion({ section, lang = 'ja', weather, showUmbrella = true, showSakura = false, showMomiji = false, showHydrangea = false, showSnowflake = false, showRainDrop = false, showLightning = false, showNightStar = false, showBirthdayCake = false, overrideDialog, onClick }: TenchanCompanionProps) {
    // セクションに応じたデフォルトメッセージと表情を設定
    const getDialogue = () => {
        const byLang = {
            ja: {
                hero: "やっほー！てんちゃんだよ！",
                concept: '天気予報、見ないでしょ？',
                features: '現実の天気と連動するよ！',
                tech: 'Next.jsで作られてるんだ！',
                bottom: 'おてんきぐらしで待ってるよ！',
            },
            en: {
                hero: 'Hi! I am Ten-chan!',
                concept: 'You do not check the forecast, right?',
                features: 'It syncs with real-world weather!',
                tech: 'It is built with Next.js!',
                bottom: 'I will be waiting in Otenkigurashi!',
            },
        } as const;

        switch (section) {
            case 'hero':
                return { text: byLang[lang].hero, mood: "happy" as const };
            case 'concept':
                return { text: byLang[lang].concept, mood: "neutral" as const };
            case 'features':
                return { text: byLang[lang].features, mood: "talking" as const };
            case 'tech':
                return { text: byLang[lang].tech, mood: "surprised" as const };
            case 'bottom':
                return { text: byLang[lang].bottom, mood: "happy" as const };
            default:
                return { text: "...", mood: "neutral" as const };
        }
    };

    const defaultDialog = getDialogue();
    const activeDialog = overrideDialog || defaultDialog;
    const hasUmbrella = showUmbrella && (weather === 'Rain' || weather === 'Thunder');

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4 pointer-events-none">
            {/* 吹き出し */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeDialog.text}
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white border-4 border-[#e0f4fc] rounded-3xl px-5 py-3 md:px-6 md:py-4 mb-4 md:mb-8 max-w-[calc(100vw-8rem)] md:max-w-none"
                >
                    <p className="text-gray-700 font-bold text-sm md:text-base whitespace-normal break-words sm:whitespace-nowrap">
                        {activeDialog.text}
                    </p>
                    {/* しっぽ (三角形) */}
                    <div className="absolute -bottom-3 right-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[14px] border-t-white border-r-[10px] border-r-transparent z-10" />
                    <div className="absolute -bottom-4 right-[22px] w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-[#e0f4fc] border-r-[12px] border-r-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* てんちゃん本体 */}
            <motion.div
                data-testid="tenchan-companion"
                className={`relative w-24 h-24 md:w-32 md:h-32 ${onClick ? 'pointer-events-auto cursor-pointer' : ''}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={onClick ? { scale: 1.05 } : undefined}
                whileTap={onClick ? { scale: 0.95 } : undefined}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                onClick={onClick}
            >
                {hasUmbrella && (
                    <svg
                        className="absolute -right-1 -top-8 z-10 h-24 w-24 rotate-[-12deg] md:-right-2 md:-top-11 md:h-32 md:w-32"
                        viewBox="0 0 120 120"
                        aria-hidden="true"
                    >
                        <path d="M14 50 Q58 8 106 50 Z" fill={weather === 'Thunder' ? '#7c83ff' : '#79d8ff'} stroke="#4f6f83" strokeWidth="4" strokeLinejoin="round" />
                        <path d="M14 50 Q36 37 58 50 Q82 37 106 50" fill="none" stroke="#eefaff" strokeWidth="3" strokeLinecap="round" />
                        <path d="M58 50 L43 104" fill="none" stroke="#6b4a3a" strokeWidth="5" strokeLinecap="round" />
                        <path d="M43 104 Q38 116 52 116" fill="none" stroke="#6b4a3a" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                )}
                <CharacterFace
                    mood={activeDialog.mood}
                    showSakura={showSakura}
                    showMomiji={showMomiji}
                    showHydrangea={showHydrangea}
                    showSnowflake={showSnowflake}
                    showRainDrop={showRainDrop}
                    showLightning={showLightning}
                    showNightStar={showNightStar}
                    showBirthday={showBirthdayCake}
                />
            </motion.div>
        </div>
    );
}
