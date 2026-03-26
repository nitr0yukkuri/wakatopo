'use client'

import { motion } from 'framer-motion';

// 晴れの遷移: 下から昇る太陽と斜めの層状ゴッドレイ

export default function SunburstTransitionCanvas() {
    return (
        <div
            className="w-full h-full overflow-hidden relative flex items-center justify-center"
            style={{ background: 'linear-gradient(180deg, #82cbf6 0%, #dff2ff 42%, #fff3d8 74%, #ffefcf 100%)' }}
        >
            {/* 空気の露出変化（白フラッシュではなく空気の明度で見せる） */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 100% 72% at 76% 18%, rgba(255,234,190,0.28) 0%, rgba(255,226,176,0.12) 44%, rgba(255,226,176,0) 78%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.08, 0.24, 0.18] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 遷移後の晴れ画面と同じ太陽 */}
            <motion.div
                className="absolute right-[8%] top-[9%] w-24 h-24 md:w-32 md:h-32 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(255,245,180,0.96) 0%, rgba(255,213,112,0.92) 38%, rgba(255,170,58,0.92) 100%)',
                    boxShadow: '0 0 45px rgba(255,205,110,0.55), 0 0 110px rgba(255,187,82,0.35)',
                }}
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: [0, 0.94, 1], scale: [0.86, 1.04, 1.0] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute right-[3%] top-[2%] w-44 h-44 md:w-64 md:h-64 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(255,220,150,0.36) 0%, rgba(255,220,150,0.08) 42%, rgba(255,220,150,0.0) 74%)',
                }}
                initial={{ opacity: 0, rotate: -10, scale: 0.86 }}
                animate={{ opacity: [0, 0.42, 0.3], rotate: [-10, 10, 20], scale: [0.86, 1.0, 1.03] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 層状の斜めゴッドレイ */}
            <motion.div
                className="absolute pointer-events-none"
                style={{
                    right: '-30%',
                    top: '-42%',
                    width: '190%',
                    height: '190%',
                    transform: 'rotate(-24deg)',
                    background: 'linear-gradient(104deg, rgba(255,247,220,0.7) 0%, rgba(255,236,194,0.36) 24%, rgba(255,220,162,0.15) 46%, rgba(255,210,156,0.0) 74%)',
                    filter: 'blur(1.5px)',
                    mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0, x: 70, y: -40 }}
                animate={{ opacity: [0, 0.68, 0.52], x: [70, 8, 0], y: [-40, -8, 0] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    right: '-32%',
                    top: '-40%',
                    width: '180%',
                    height: '180%',
                    transform: 'rotate(-24deg)',
                    background: 'linear-gradient(105deg, rgba(255,251,236,0.52) 0%, rgba(255,241,210,0.24) 22%, rgba(255,224,170,0.08) 44%, rgba(255,214,165,0.0) 68%)',
                    filter: 'blur(7px)',
                    mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0, x: 40, y: -26 }}
                animate={{ opacity: [0, 0.48, 0.36], x: [40, 7, 0], y: [-26, -7, 0] }}
                transition={{ duration: 0.9, delay: 0.03, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute pointer-events-none"
                style={{
                    right: '-28%',
                    top: '-36%',
                    width: '160%',
                    height: '170%',
                    transform: 'rotate(-24deg)',
                    background: 'linear-gradient(102deg, rgba(255,255,246,0.48) 0%, rgba(255,247,224,0.22) 20%, rgba(255,232,186,0.06) 40%, rgba(255,220,180,0.0) 62%)',
                    filter: 'blur(14px)',
                    mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0, x: 26, y: -12 }}
                animate={{ opacity: [0, 0.4, 0.28], x: [26, 4, 0], y: [-12, -3, 0] }}
                transition={{ duration: 0.9, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 露出の余韻 */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,246,220,0.0) 0%, rgba(255,239,206,0.07) 54%, rgba(255,233,196,0.16) 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.0, 0.2, 0.16] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
