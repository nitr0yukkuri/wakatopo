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

            // 光源 (右上外): 穏やかな朝日として斜めに入射
            const sx = w * 0.88;
            const sy = -h * 0.14;
            const rayCount = 22;

            for (let i = 0; i < rayCount; i++) {
                const base = Math.PI * 0.55 + (i / rayCount) * Math.PI * 0.66;
                const angle = base + Math.sin(t * 0.21 + i * 0.58) * 0.012;
                const hw = 0.014 + Math.sin(t * 0.37 + i * 1.08) * 0.004;
                const len = h * 3.2;

                const x1 = sx + Math.cos(angle - hw) * len;
                const y1 = sy + Math.sin(angle - hw) * len;
                const x2 = sx + Math.cos(angle + hw) * len;
                const y2 = sy + Math.sin(angle + hw) * len;

                const a = 0.010 + Math.abs(Math.sin(t * 0.33 + i * 0.78)) * 0.008;

                const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, len * 0.75);
                grad.addColorStop(0, `rgba(255,242,195,${a * 2.3})`);
                grad.addColorStop(0.25, `rgba(255,221,156,${a * 1.6})`);
                grad.addColorStop(0.6, `rgba(255,192,126,${a * 0.75})`);
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
