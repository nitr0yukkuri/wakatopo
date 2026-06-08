'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle { x: number; y: number; vx: number; vy: number; r: number; life: number; phase: number; }

type SunraysVariant = 'default' | 'summer-clear';

export default function SunraysCanvas({ variant = 'default' }: { variant?: SunraysVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isSummerClear = variant === 'summer-clear';

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

        // 浮遊ダスト粒子
        const particles: Particle[] = Array.from({ length: isSummerClear ? 128 : 90 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * (isSummerClear ? 0.42 : 0.25),
            vy: -(Math.random() * (isSummerClear ? 0.58 : 0.45) + 0.08),
            r: Math.random() * (isSummerClear ? 2.2 : 1.8) + 0.3,
            life: Math.random(),
            phase: Math.random() * Math.PI * 2,
        }));

        function draw() {
            t += 0.004;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // 右上の太陽本体
            const sunX = w * 0.88;
            const sunY = h * 0.08;
            const sunR = Math.max(34, Math.min(w, h) * 0.055);

            const sunAura = ctx.createRadialGradient(sunX, sunY, sunR * 0.16, sunX, sunY, sunR * (isSummerClear ? 3.15 : 2.4));
            if (isSummerClear) {
                sunAura.addColorStop(0, 'rgba(255,255,255,0.54)');
                sunAura.addColorStop(0.24, 'rgba(255,238,168,0.24)');
                sunAura.addColorStop(0.58, 'rgba(68,176,255,0.16)');
                sunAura.addColorStop(1, 'rgba(21,128,220,0)');
            } else {
                sunAura.addColorStop(0, 'rgba(255,238,188,0.32)');
                sunAura.addColorStop(0.5, 'rgba(255,214,146,0.16)');
                sunAura.addColorStop(1, 'rgba(255,190,132,0)');
            }
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * (isSummerClear ? 3.15 : 2.4), 0, Math.PI * 2);
            ctx.fillStyle = sunAura;
            ctx.fill();

            const sunBody = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, sunR * 0.18, sunX, sunY, sunR);
            if (isSummerClear) {
                sunBody.addColorStop(0, 'rgba(255,255,255,1)');
                sunBody.addColorStop(0.5, 'rgba(255,253,238,0.99)');
                sunBody.addColorStop(1, 'rgba(255,232,156,0.9)');
            } else {
                sunBody.addColorStop(0, 'rgba(255,252,236,0.98)');
                sunBody.addColorStop(0.45, 'rgba(255,236,180,0.98)');
                sunBody.addColorStop(1, 'rgba(255,198,116,0.95)');
            }
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fillStyle = sunBody;
            ctx.fill();

            // ダストパーティクル
            for (const p of particles) {
                p.x += p.vx + Math.sin(t * 0.55 + p.phase) * 0.1;
                p.y += p.vy * 0.85;
                p.life += 0.0035;
                if (p.life > 1) { p.life = 0; p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
                if (p.y < -5) { p.y = canvas.height + 5; }
                const a = Math.sin(p.life * Math.PI) * (isSummerClear ? 0.52 : 0.42);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = isSummerClear
                    ? `rgba(248,253,255,${a * 0.76})`
                    : `rgba(255,244,216,${a * 0.82})`;
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [isSummerClear]);

    const baseGlow = isSummerClear
        ? 'radial-gradient(ellipse 66% 54% at 86% -10%, rgba(84,183,255,0.22) 0%, rgba(255,230,156,0.08) 24%, rgba(40,153,238,0.11) 44%, transparent 74%)'
        : 'radial-gradient(ellipse 62% 50% at 86% -10%, rgba(255,228,172,0.18) 0%, rgba(255,205,150,0.08) 38%, transparent 72%)';
    const pulseGlow = isSummerClear
        ? 'radial-gradient(ellipse 58% 46% at 86% -14%, rgba(255,248,216,0.18) 0%, rgba(91,195,255,0.12) 44%, transparent 76%)'
        : 'radial-gradient(ellipse 56% 44% at 86% -14%, rgba(255,236,188,0.16) 0%, rgba(255,214,160,0.06) 44%, transparent 76%)';
    const wash = isSummerClear
        ? 'linear-gradient(to bottom, rgba(39,157,245,0.11) 0%, rgba(98,192,255,0.055) 34%, transparent 72%)'
        : 'linear-gradient(to bottom, rgba(255,222,180,0.07) 0%, rgba(255,215,170,0.03) 34%, transparent 72%)';
    const summerAtmosphere = 'radial-gradient(ellipse 78% 46% at 48% 4%, rgba(90,184,255,0.14) 0%, rgba(92,177,235,0.08) 42%, rgba(92,177,235,0) 72%), linear-gradient(to bottom, rgba(71,165,235,0.08) 0%, rgba(71,165,235,0.03) 38%, transparent 66%)';

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
        >
            {/* 朝日のやわらかい暖色グロー */}
            {isSummerClear && (
                <div
                    className="absolute inset-0"
                    style={{ background: summerAtmosphere }}
                />
            )}
            <div
                className="absolute inset-0"
                style={{ background: baseGlow }}
            />
            <motion.div
                className="absolute inset-0"
                style={{ background: pulseGlow }}
                animate={{ opacity: isSummerClear ? [0.62, 1, 0.72] : [0.55, 0.92, 0.64] }}
                transition={{ duration: isSummerClear ? 4.8 : 6.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
                className="absolute inset-0"
                style={{ background: wash }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
