'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Star { x: number; y: number; r: number; base: number; phase: number; speed: number; }
interface GlowDust { x: number; y: number; r: number; alpha: number; phase: number; speed: number; }

type NightVariant = 'default' | 'autumn-night';

export default function NightGlowOverlay({ variant = 'default' }: { variant?: NightVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isAutumnNight = variant === 'autumn-night';

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let raf: number;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 星
        const stars: Star[] = Array.from({ length: isAutumnNight ? 95 : 130 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.75,
            r: Math.random() * 1.4 + 0.25,
            base: Math.random() * (isAutumnNight ? 0.42 : 0.55) + 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * (isAutumnNight ? 0.55 : 0.9) + 0.22,
        }));

        // 夜光にじみ（ゆっくり漂う粒子）
        const dusts: GlowDust[] = Array.from({ length: isAutumnNight ? 44 : 60 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 22 + 8,
            alpha: Math.random() * (isAutumnNight ? 0.04 : 0.05) + 0.015,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * (isAutumnNight ? 0.24 : 0.35) + 0.1,
        }));

        // オーロラバンドの定義
        const bands = isAutumnNight
            ? [
                { y: 0.08, h: 0.24, r: 26, g: 48, b: 110, speed: 0.12, amp: 0.026 },
                { y: 0.18, h: 0.18, r: 152, g: 110, b: 48, speed: 0.1, amp: 0.02 },
            ]
            : [
                { y: 0.08, h: 0.28, r: 20, g: 60, b: 150, speed: 0.18, amp: 0.035 },
                { y: 0.14, h: 0.20, r: 15, g: 90, b: 130, speed: 0.13, amp: 0.028 },
                { y: 0.20, h: 0.22, r: 35, g: 45, b: 140, speed: 0.22, amp: 0.032 },
            ];

        function draw() {
            t += 0.007;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // 背景の微小グロー
            const bgGrad = ctx.createRadialGradient(w * 0.22, h * 0.18, 0, w * 0.22, h * 0.18, w * 0.75);
            bgGrad.addColorStop(0, isAutumnNight ? 'rgba(72,82,150,0.06)' : 'rgba(80,120,255,0.07)');
            bgGrad.addColorStop(1, isAutumnNight ? 'rgba(16,24,60,0)' : 'rgba(20,35,80,0)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // オーロラバンド
            for (let bi = 0; bi < bands.length; bi++) {
                const b = bands[bi];
                const yOff = h * b.y + Math.sin(t * b.speed + bi * 2.1) * h * b.amp;
                const bh = h * b.h;

                // 横方向にうねるため複数の垂直グラデを合成
                for (let xi = 0; xi < 4; xi++) {
                    const xCenter = (xi / 3) * w + Math.sin(t * 0.12 + bi * 1.5 + xi * 0.8) * w * 0.12;
                    const xr = w * (0.35 + Math.sin(t * 0.09 + xi * 1.2) * 0.1);
                    const aa = (0.035 + Math.sin(t * b.speed * 1.5 + bi * 1.8 + xi) * 0.015);

                    const grad = ctx.createRadialGradient(xCenter, yOff + bh * 0.4, 0, xCenter, yOff + bh * 0.4, Math.max(xr, bh));
                    grad.addColorStop(0, `rgba(${b.r},${b.g},${b.b},${aa * 1.4})`);
                    grad.addColorStop(0.4, `rgba(${b.r},${b.g},${b.b},${aa})`);
                    grad.addColorStop(1, `rgba(${b.r},${b.g},${b.b},0)`);

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.ellipse(xCenter, yOff + bh * 0.4, xr, bh * 0.55, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 夜光のにじみ
            for (const d of dusts) {
                const a = d.alpha * (0.6 + 0.4 * (Math.sin(t * d.speed + d.phase) * 0.5 + 0.5));
                const x = d.x + Math.sin(t * 0.07 + d.phase) * 16;
                const y = d.y + Math.cos(t * 0.06 + d.phase) * 10;
                const dg = ctx.createRadialGradient(x, y, 0, x, y, d.r);
                dg.addColorStop(0, isAutumnNight ? `rgba(190,145,76,${a})` : `rgba(110,160,255,${a})`);
                dg.addColorStop(1, isAutumnNight ? 'rgba(150,105,52,0)' : 'rgba(90,140,240,0)');
                ctx.fillStyle = dg;
                ctx.beginPath();
                ctx.arc(x, y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }

            // 星のきらめき
            for (const s of stars) {
                const a = (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5) * s.base;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = isAutumnNight ? `rgba(226,218,195,${a})` : `rgba(210,225,255,${a})`;
                ctx.fill();

                // 一部の星にクロスグリントを乗せて夜光感を出す
                if (s.r > 1.2) {
                    const g = a * 0.35;
                    ctx.strokeStyle = isAutumnNight ? `rgba(232,220,180,${g})` : `rgba(210,230,255,${g})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(s.x - 2.5, s.y);
                    ctx.lineTo(s.x + 2.5, s.y);
                    ctx.moveTo(s.x, s.y - 2.5);
                    ctx.lineTo(s.x, s.y + 2.5);
                    ctx.stroke();
                }
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [isAutumnNight]);

    const moonBase = isAutumnNight ? '#e2d7b8' : '#dce8ff';
    const moonShadow = isAutumnNight ? '#091129' : '#0a152a';
    const moonGlow = isAutumnNight ? '0_0_38px_rgba(210,178,106,0.34)' : '0_0_35px_rgba(167,196,245,0.38)';
    const topWash = isAutumnNight
        ? 'linear-gradient(to bottom, rgba(1,4,20,0.58) 0%, rgba(6,10,32,0.24) 42%, transparent 74%)'
        : 'linear-gradient(to bottom, rgba(1,4,22,0.52) 0%, rgba(2,8,28,0.20) 42%, transparent 74%)';
    const lowerGlow = isAutumnNight
        ? 'radial-gradient(ellipse 120% 80% at 50% 120%, rgba(150,104,42,0.12) 0%, rgba(40,42,95,0.04) 42%, transparent 78%)'
        : 'radial-gradient(ellipse 120% 80% at 50% 120%, rgba(75,110,210,0.10) 0%, rgba(25,45,120,0.04) 42%, transparent 78%)';

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
        >
            {/* Moon */}
            <div
                className="absolute right-[8%] top-[10%] w-20 h-20 md:w-28 md:h-28 rounded-full opacity-90 overflow-hidden"
                style={{ backgroundColor: moonBase, boxShadow: moonGlow }}
            >
                {isAutumnNight && (
                    <>
                        <div className="absolute left-[50%] top-[18%] h-[28%] w-[10%] rotate-[54deg] rounded-full bg-[#7f6c50]/16 blur-[1px]" />
                        <div className="absolute left-[59%] top-[20%] h-[26%] w-[9%] rotate-[76deg] rounded-full bg-[#7f6c50]/14 blur-[1px]" />
                        <div className="absolute left-[44%] top-[34%] h-[18%] w-[22%] rotate-[-10deg] rounded-full bg-[#7f6c50]/16 blur-[1px]" />
                        <div className="absolute left-[31%] top-[48%] h-[30%] w-[34%] rotate-[-18deg] rounded-full bg-[#7f6c50]/15 blur-[1px]" />
                        <div className="absolute left-[47%] top-[54%] h-[9%] w-[24%] rotate-[38deg] rounded-full bg-[#7f6c50]/17 blur-[1px]" />
                        <div className="absolute left-[60%] top-[65%] h-[22%] w-[24%] rotate-[10deg] rounded-sm bg-[#7f6c50]/13 blur-[1px]" />
                        <div className="absolute left-[32%] top-[70%] h-[13%] w-[12%] rotate-[-18deg] rounded-full bg-[#7f6c50]/12 blur-[1px]" />
                    </>
                )}
            </div>
            {!isAutumnNight && (
                <div
                    className="absolute right-[6.4%] top-[8.8%] w-20 h-20 md:w-28 md:h-28 rounded-full opacity-95"
                    style={{ backgroundColor: moonShadow }}
                />
            )}

            {/* 上部から深い紺色グラデーション */}
            <div
                className="absolute inset-0"
                style={{ background: topWash }}
            />
            {/* 画面縁の夜光ハロー */}
            <div
                className="absolute inset-0"
                style={{ background: lowerGlow }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
