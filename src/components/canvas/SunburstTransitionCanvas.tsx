'use client'

import { motion } from 'framer-motion';
import { useStore } from '@/store';

// 晴れの遷移: 下から昇る太陽と斜めの層状ゴッドレイ

export default function SunburstTransitionCanvas() {
    const season = useStore((state) => state.season);
    const seasonEvent = useStore((state) => state.seasonEvent);
    const isSpringSun = season === 'spring';
    const isAutumnSun = season === 'autumn';
    const isGeshiSun = season === 'summer' && seasonEvent === 'geshi';
    const background = isSpringSun
        ? 'linear-gradient(180deg, #f6e8ee 0%, #fdf3f7 42%, #fffafc 74%, #ffffff 100%)'
        : isAutumnSun
            ? 'linear-gradient(180deg, #c7ded9 0%, #f1e6ce 50%, #e4b36f 100%)'
        : isGeshiSun
            ? 'linear-gradient(180deg, #a9d6e8 0%, #cfe8ee 42%, #e8f0e8 74%, #f7edcf 100%)'
        : 'linear-gradient(180deg, #82cbf6 0%, #dff2ff 42%, #fff3d8 74%, #ffefcf 100%)';

    return (
        <div
            className="w-full h-full overflow-hidden relative flex items-center justify-center"
            style={{ background }}
        >
            {/* 空気の露出変化（白フラッシュではなく空気の明度で見せる） */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: isGeshiSun
                        ? 'radial-gradient(ellipse 100% 72% at 76% 18%, rgba(190,229,246,0.14) 0%, rgba(164,215,237,0.06) 44%, rgba(164,215,237,0) 78%)'
                        : 'radial-gradient(ellipse 100% 72% at 76% 18%, rgba(255,234,190,0.28) 0%, rgba(255,226,176,0.12) 44%, rgba(255,226,176,0) 78%)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.08, 0.24, 0.18] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* 遷移後の晴れ画面と同じ太陽 */}
            <motion.div
                className="absolute right-[8%] top-[9%] w-24 h-24 md:w-32 md:h-32 rounded-full pointer-events-none"
                style={{
                    background: isSpringSun
                        ? 'radial-gradient(circle at 35% 35%, rgba(255,244,214,0.98) 0%, rgba(241,157,188,0.96) 38%, rgba(205,100,139,0.94) 100%)'
                    : isGeshiSun
                        ? 'radial-gradient(circle at 35% 35%, rgba(255,248,211,0.96) 0%, rgba(255,220,133,0.90) 38%, rgba(246,181,70,0.84) 100%)'
                        : 'radial-gradient(circle at 35% 35%, rgba(255,245,180,0.96) 0%, rgba(255,213,112,0.92) 38%, rgba(255,170,58,0.92) 100%)',
                    boxShadow: isSpringSun
                        ? '0 0 45px rgba(224,122,159,0.32), 0 0 110px rgba(205,100,139,0.16)'
                        : isGeshiSun
                            ? '0 0 24px rgba(151,211,238,0.18), 0 0 66px rgba(120,190,224,0.07)'
                        : '0 0 45px rgba(255,205,110,0.55), 0 0 110px rgba(255,187,82,0.35)',
                }}
                initial={{ opacity: 0, scale: 0.86 }}
                animate={{ opacity: isGeshiSun ? [0, 0.78, 0.86] : [0, 0.94, 1], scale: [0.86, 1.04, 1.0] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
                className="absolute right-[3%] top-[2%] w-44 h-44 md:w-64 md:h-64 rounded-full pointer-events-none"
                style={{
                    background: isSpringSun
                        ? 'radial-gradient(circle, rgba(255,205,219,0.22) 0%, rgba(229,128,166,0.07) 42%, rgba(229,128,166,0.0) 74%)'
                    : isGeshiSun
                        ? 'radial-gradient(circle, rgba(188,228,245,0.10) 0%, rgba(151,208,234,0.025) 42%, rgba(151,208,234,0.0) 74%)'
                        : 'radial-gradient(circle, rgba(255,220,150,0.36) 0%, rgba(255,220,150,0.08) 42%, rgba(255,220,150,0.0) 74%)',
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
                    background: isGeshiSun
                        ? 'linear-gradient(104deg, rgba(221,244,253,0.26) 0%, rgba(190,226,242,0.14) 24%, rgba(161,211,235,0.06) 46%, rgba(161,211,235,0.0) 74%)'
                        : 'linear-gradient(104deg, rgba(255,247,220,0.7) 0%, rgba(255,236,194,0.36) 24%, rgba(255,220,162,0.15) 46%, rgba(255,210,156,0.0) 74%)',
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
                    background: isGeshiSun
                        ? 'linear-gradient(105deg, rgba(229,248,255,0.20) 0%, rgba(195,229,242,0.10) 22%, rgba(168,213,234,0.035) 44%, rgba(168,213,234,0.0) 68%)'
                        : 'linear-gradient(105deg, rgba(255,251,236,0.52) 0%, rgba(255,241,210,0.24) 22%, rgba(255,224,170,0.08) 44%, rgba(255,214,165,0.0) 68%)',
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
                    background: isGeshiSun
                        ? 'linear-gradient(102deg, rgba(235,250,255,0.17) 0%, rgba(205,234,245,0.08) 20%, rgba(174,217,236,0.025) 40%, rgba(174,217,236,0.0) 62%)'
                        : 'linear-gradient(102deg, rgba(255,255,246,0.48) 0%, rgba(255,247,224,0.22) 20%, rgba(255,232,186,0.06) 40%, rgba(255,220,180,0.0) 62%)',
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
                style={{ background: isGeshiSun
                    ? 'linear-gradient(180deg, rgba(220,245,253,0.0) 0%, rgba(199,231,243,0.035) 54%, rgba(179,218,235,0.08) 100%)'
                    : 'linear-gradient(180deg, rgba(255,246,220,0.0) 0%, rgba(255,239,206,0.07) 54%, rgba(255,233,196,0.16) 100%)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.0, 0.2, 0.16] }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
        </div>
    );
}
