'use client';

import { motion, AnimatePresence } from 'framer-motion';

type CharacterFaceProps = {
    mood?: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking";
    petColor?: string;
    cheekColor?: string;
    isStatic?: boolean;
};

export function CharacterFace({
    mood = "happy",
    petColor = "white",
    cheekColor = "#F8BBD0",
    isStatic = false
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
    overrideDialog?: { text: string; mood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking" } | null;
    onClick?: () => void;
};

export default function TenchanCompanion({ section, overrideDialog, onClick }: TenchanCompanionProps) {
    // セクションに応じたデフォルトメッセージと表情を設定
    const getDialogue = () => {
        switch (section) {
            case 'hero':
                return { text: "やっほー！てんちゃんだよ！", mood: "happy" as const };
            case 'concept':
                return { text: "天気予報、見ないでしょ？", mood: "neutral" as const };
            case 'features':
                return { text: "現実の天気と連動するよ！", mood: "talking" as const };
            case 'tech':
                return { text: "Next.jsで作られてるんだ！", mood: "surprised" as const };
            case 'bottom':
                return { text: "おてんきぐらしで待ってるよ！", mood: "happy" as const };
            default:
                return { text: "...", mood: "neutral" as const };
        }
    };

    const defaultDialog = getDialogue();
    const activeDialog = overrideDialog || defaultDialog;

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
                    className="relative bg-white border-4 border-[#e0f4fc] rounded-3xl px-5 py-3 md:px-6 md:py-4 shadow-[0_10px_30px_rgba(152,173,194,0.3)] mb-4 md:mb-8 max-w-[calc(100vw-8rem)] md:max-w-none"
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
                className={`w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_10px_20px_rgba(152,173,194,0.4)] ${onClick ? 'pointer-events-auto cursor-pointer' : ''}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={onClick ? { scale: 1.05 } : undefined}
                whileTap={onClick ? { scale: 0.95 } : undefined}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                onClick={onClick}
            >
                <CharacterFace mood={activeDialog.mood} />
            </motion.div>
        </div>
    );
}
