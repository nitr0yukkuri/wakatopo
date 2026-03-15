'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Star { x: number; y: number; r: number; base: number; phase: number; speed: number; }

export default function NightGlowOverlay() {
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

        // 星
        const stars: Star[] = Array.from({ length: 130 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 0.75,
            r: Math.random() * 1.4 + 0.25,
            base: Math.random() * 0.55 + 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.9 + 0.25,
        }));

        // オーロラバンドの定義
        const bands = [
            { y: 0.08, h: 0.28, r: 20, g: 60, b: 150, speed: 0.18, amp: 0.035 },
            { y: 0.14, h: 0.20, r: 15, g: 90, b: 130, speed: 0.13, amp: 0.028 },
            { y: 0.20, h: 0.22, r: 35, g: 45, b: 140, speed: 0.22, amp: 0.032 },
        ];

        function draw() {
            t += 0.007;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

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

            // 星のきらめき
            for (const s of stars) {
                const a = (Math.sin(t * s.speed + s.phase) * 0.5 + 0.5) * s.base;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(210,225,255,${a})`;
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
            transition={{ duration: 2.5 }}
        >
            {/* 上部から深い紺色グラデーション */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(1,4,22,0.45) 0%, rgba(1,6,18,0.15) 40%, transparent 70%)' }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
