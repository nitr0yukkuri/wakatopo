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

            // 光源 (右上外): 朝の低めの光で広めに入射
            const sx = w * 0.86;
            const sy = -h * 0.10;
            const rayCount = 18;

            for (let i = 0; i < rayCount; i++) {
                const base = Math.PI * 0.57 + (i / rayCount) * Math.PI * 0.62;
                const angle = base + Math.sin(t * 0.28 + i * 0.65) * 0.015;
                const hw = 0.019 + Math.sin(t * 0.45 + i * 1.1) * 0.006;
                const len = h * 3.0;

                const x1 = sx + Math.cos(angle - hw) * len;
                const y1 = sy + Math.sin(angle - hw) * len;
                const x2 = sx + Math.cos(angle + hw) * len;
                const y2 = sy + Math.sin(angle + hw) * len;

                const a = 0.013 + Math.abs(Math.sin(t * 0.38 + i * 0.85)) * 0.010;

                const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, len * 0.75);
                grad.addColorStop(0, `rgba(255,236,180,${a * 2.6})`);
                grad.addColorStop(0.25, `rgba(255,218,145,${a * 1.7})`);
                grad.addColorStop(0.6, `rgba(255,190,120,${a * 0.8})`);
                grad.addColorStop(1, 'rgba(255,168,120,0)');

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // ダストパーティクル
            for (const p of particles) {
                p.x += p.vx + Math.sin(t * 0.55 + p.phase) * 0.1;
                p.y += p.vy;
                p.life += 0.0035;
                if (p.life > 1) { p.life = 0; p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
                if (p.y < -5) { p.y = canvas.height + 5; }
                const a = Math.sin(p.life * Math.PI) * 0.48;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,242,205,${a * 0.9})`;
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
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(255,222,180,0.07) 0%, rgba(255,215,170,0.03) 34%, transparent 72%)' }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
