'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FogBlob {
    x: number; y: number; vx: number; vy: number;
    r: number; alpha: number; phase: number;
}

interface MistParticle {
    x: number; y: number; vx: number; vy: number;
    r: number; life: number; phase: number;
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
        const blobs: FogBlob[] = Array.from({ length: 30 }, (_, i) => {
            const layer = i < 15 ? 0 : 1; // 0=奥(小・遅い), 1=手前(大・速い)
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight * 0.55) - 50,
                vx: (Math.random() - 0.5) * (layer === 0 ? 0.04 : 0.08),
                vy: (Math.random() - 0.5) * (layer === 0 ? 0.015 : 0.02),
                r: layer === 0
                    ? Math.random() * 200 + 150
                    : Math.random() * 300 + 250,
                alpha: layer === 0
                    ? Math.random() * 0.06 + 0.03
                    : Math.random() * 0.04 + 0.02,
                phase: Math.random() * Math.PI * 2,
            };
        });

        // 晴れ遷移の浮遊感を曇天向けに転用したミスト粒子
        const particles: MistParticle[] = Array.from({ length: 120 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * (window.innerHeight * 0.55) - 50,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -(Math.random() * 0.25 + 0.06),
            r: Math.random() * 1.7 + 0.35,
            life: Math.random(),
            phase: Math.random() * Math.PI * 2,
        }));

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
                if (b.y > h * 0.55 + b.r) b.y = -b.r;
                if (b.y < -b.r) b.y = h * 0.55 + b.r;

                const pulse = Math.sin(t * 0.2 + b.phase) * 0.004;
                const a = Math.max(0, b.alpha + pulse);

                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                grad.addColorStop(0, `rgba(190,200,215,${a})`);
                grad.addColorStop(0.45, `rgba(170,185,205,${a * 0.55})`);
                // FIX: Fading RGB to a darker color while alpha approaches 0 creates "dirty ringing" (pre-multiplied alpha Mach bands).
                // Keep the exact same mid-RGB (170,185,205) for the edge stop to allow pure clean alpha fade.
                grad.addColorStop(1, 'rgba(170,185,205,0)');

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            // 霧粒で奥行き感を追加
            for (const p of particles) {
                p.x += p.vx + Math.sin(t * 0.33 + p.phase) * 0.09;
                p.y += p.vy;
                p.life += 0.003;

                if (p.life > 1) {
                    p.life = 0;
                    p.y = h * 0.55 + 6;
                    p.x = Math.random() * w;
                }
                if (p.y < -6) p.y = h * 0.55 + 6;

                const a = Math.sin(p.life * Math.PI) * 0.22;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(208,224,244,${a})`;
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
            {/* 上部にうっすら霞 */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(120,140,170,0.12) 0%, rgba(115,138,170,0.05) 35%, rgba(115,138,170,0) 60%)' }}
            />
        </motion.div>
    );
}
