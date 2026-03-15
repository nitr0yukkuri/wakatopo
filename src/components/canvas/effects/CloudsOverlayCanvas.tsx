'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FogBlob {
    x: number; y: number; vx: number; vy: number;
    r: number; alpha: number; phase: number;
}

export default function CloudsOverlayCanvas() {
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

        // 2レイヤー: 遠近で速度・サイズが異なるフォグブロブ
        const blobs: FogBlob[] = Array.from({ length: 22 }, (_, i) => {
            const layer = i < 11 ? 0 : 1; // 0=奥(小・遅い), 1=手前(大・速い)
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * (layer === 0 ? 0.07 : 0.15),
                vy: (Math.random() - 0.5) * (layer === 0 ? 0.025 : 0.04),
                r: layer === 0
                    ? Math.random() * 130 + 80
                    : Math.random() * 220 + 140,
                alpha: layer === 0
                    ? Math.random() * 0.05 + 0.025
                    : Math.random() * 0.04 + 0.015,
                phase: Math.random() * Math.PI * 2,
            };
        });

        function draw() {
            t += 0.003;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            for (const b of blobs) {
                b.x += b.vx;
                b.y += b.vy + Math.sin(t * 0.18 + b.phase) * 0.04;

                // 画面外ループ
                if (b.x > w + b.r) b.x = -b.r;
                if (b.x < -b.r) b.x = w + b.r;
                if (b.y > h + b.r) b.y = -b.r;
                if (b.y < -b.r) b.y = h + b.r;

                const pulse = Math.sin(t * 0.35 + b.phase) * 0.008;
                const a = Math.max(0, b.alpha + pulse);

                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                grad.addColorStop(0, `rgba(190,200,215,${a})`);
                grad.addColorStop(0.45, `rgba(170,185,205,${a * 0.55})`);
                grad.addColorStop(1, 'rgba(150,165,190,0)');

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
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
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* 全体にうっすら霞 */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(150,165,185,0.035)' }}
            />
        </motion.div>
    );
}
