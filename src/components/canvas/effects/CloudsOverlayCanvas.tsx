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

        // 晴れ遷移の浮遊感を曇天向けに転用したミスト粒子
        const particles: MistParticle[] = Array.from({ length: 72 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
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

            // 曇りの切れ間から差すクールトーンの光芒
            const sx = w * 0.18;
            const sy = -h * 0.12;
            const rayCount = 12;

            for (let i = 0; i < rayCount; i++) {
                const base = Math.PI * 0.54 + (i / rayCount) * Math.PI * 0.58;
                const angle = base + Math.sin(t * 0.22 + i * 0.66) * 0.02;
                const hw = 0.028 + Math.sin(t * 0.4 + i * 1.1) * 0.008;
                const len = h * 2.5;

                const x1 = sx + Math.cos(angle - hw) * len;
                const y1 = sy + Math.sin(angle - hw) * len;
                const x2 = sx + Math.cos(angle + hw) * len;
                const y2 = sy + Math.sin(angle + hw) * len;

                const a = 0.012 + Math.abs(Math.sin(t * 0.31 + i * 0.93)) * 0.01;
                const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, len * 0.8);
                grad.addColorStop(0, `rgba(215,228,245,${a * 1.7})`);
                grad.addColorStop(0.35, `rgba(185,205,230,${a})`);
                grad.addColorStop(1, 'rgba(145,170,205,0)');

                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();
            }

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

            // 霧粒で奥行き感を追加
            for (const p of particles) {
                p.x += p.vx + Math.sin(t * 0.33 + p.phase) * 0.09;
                p.y += p.vy;
                p.life += 0.003;

                if (p.life > 1) {
                    p.life = 0;
                    p.y = h + 6;
                    p.x = Math.random() * w;
                }
                if (p.y < -6) p.y = h + 6;

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
            {/* 方向性のある曇天グロー */}
            <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 64% 48% at 18% -8%, rgba(205,220,240,0.16) 0%, rgba(170,190,218,0.08) 40%, transparent 74%)' }}
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* 全体にうっすら霞 */}
            <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(120,140,170,0.08) 0%, rgba(115,138,170,0.04) 45%, rgba(105,128,160,0.02) 100%)' }}
            />
        </motion.div>
    );
}
