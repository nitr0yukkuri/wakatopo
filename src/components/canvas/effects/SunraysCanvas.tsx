'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle { x: number; y: number; vx: number; vy: number; r: number; life: number; phase: number; }

export default function SunraysCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
        const particles: Particle[] = Array.from({ length: 90 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -(Math.random() * 0.45 + 0.08),
            r: Math.random() * 1.8 + 0.3,
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

            const sunAura = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
            sunAura.addColorStop(0, 'rgba(255,238,188,0.32)');
            sunAura.addColorStop(0.5, 'rgba(255,214,146,0.16)');
            sunAura.addColorStop(1, 'rgba(255,190,132,0)');
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
            ctx.fillStyle = sunAura;
            ctx.fill();

            const sunBody = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, sunR * 0.18, sunX, sunY, sunR);
            sunBody.addColorStop(0, 'rgba(255,252,236,0.98)');
            sunBody.addColorStop(0.45, 'rgba(255,236,180,0.98)');
            sunBody.addColorStop(1, 'rgba(255,198,116,0.95)');
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
                const a = Math.sin(p.life * Math.PI) * 0.42;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,244,216,${a * 0.82})`;
                ctx.fill();
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
        >
            {/* 朝日のやわらかい暖色グロー */}
            <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 62% 50% at 86% -10%, rgba(255,228,172,0.18) 0%, rgba(255,205,150,0.08) 38%, transparent 72%)' }}
            />
            <motion.div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 56% 44% at 86% -14%, rgba(255,236,188,0.16) 0%, rgba(255,214,160,0.06) 44%, transparent 76%)' }}
                animate={{ opacity: [0.55, 0.92, 0.64] }}
                transition={{ duration: 6.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(255,222,180,0.07) 0%, rgba(255,215,170,0.03) 34%, transparent 72%)' }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
