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

            // 光源 (右上外)
            const sx = w * 0.78;
            const sy = -h * 0.06;
            const rayCount = 14;

            for (let i = 0; i < rayCount; i++) {
                const base = Math.PI * 0.60 + (i / rayCount) * Math.PI * 0.58;
                const angle = base + Math.sin(t * 0.28 + i * 0.65) * 0.015;
                const hw = 0.016 + Math.sin(t * 0.45 + i * 1.1) * 0.005;
                const len = h * 3.0;

                const x1 = sx + Math.cos(angle - hw) * len;
                const y1 = sy + Math.sin(angle - hw) * len;
                const x2 = sx + Math.cos(angle + hw) * len;
                const y2 = sy + Math.sin(angle + hw) * len;

                const a = 0.016 + Math.abs(Math.sin(t * 0.38 + i * 0.85)) * 0.012;

                const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, len * 0.75);
                grad.addColorStop(0, `rgba(255,230,110,${a * 2.8})`);
                grad.addColorStop(0.25, `rgba(255,210,70,${a * 1.6})`);
                grad.addColorStop(0.6, `rgba(255,175,30,${a * 0.7})`);
                grad.addColorStop(1, 'rgba(255,140,0,0)');

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
                ctx.fillStyle = `rgba(255,235,150,${a})`;
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
            {/* 右上の暖色グロー */}
            <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 55% 45% at 82% -8%, rgba(255,205,80,0.13) 0%, transparent 70%)' }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
