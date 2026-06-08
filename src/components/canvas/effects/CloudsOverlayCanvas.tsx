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

type CloudsVariant = 'default' | 'spring-clouds';

export default function CloudsOverlayCanvas({ variant = 'default' }: { variant?: CloudsVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isSpringClouds = variant === 'spring-clouds';

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

        const blobs: FogBlob[] = Array.from({ length: isSpringClouds ? 36 : 30 }, (_, i) => {
            const layer = i < 15 ? 0 : 1;
            return {
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight * (isSpringClouds ? 0.7 : 0.55)) - 50,
                vx: (Math.random() - 0.5) * (layer === 0 ? 0.04 : 0.08) * (isSpringClouds ? 0.72 : 1),
                vy: (Math.random() - 0.5) * (layer === 0 ? 0.015 : 0.02) * (isSpringClouds ? 0.65 : 1),
                r: layer === 0
                    ? Math.random() * 200 + 150
                    : Math.random() * 300 + 250,
                alpha: layer === 0
                    ? Math.random() * (isSpringClouds ? 0.075 : 0.06) + 0.03
                    : Math.random() * (isSpringClouds ? 0.052 : 0.04) + 0.02,
                phase: Math.random() * Math.PI * 2,
            };
        });

        const particles: MistParticle[] = Array.from({ length: isSpringClouds ? 68 : 120 }, () => ({
            x: Math.random() * window.innerWidth,
            y: isSpringClouds
                ? Math.random() * window.innerHeight
                : Math.random() * (window.innerHeight * 0.55) - 50,
            vx: isSpringClouds ? Math.random() * 0.1 + 0.02 : (Math.random() - 0.5) * 0.2,
            vy: isSpringClouds ? Math.random() * 0.18 + 0.06 : -(Math.random() * 0.25 + 0.06),
            r: Math.random() * (isSpringClouds ? 2.2 : 1.7) + 0.35,
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

                const cloudHeight = h * (isSpringClouds ? 0.7 : 0.55);
                if (b.x > w + b.r) b.x = -b.r;
                if (b.x < -b.r) b.x = w + b.r;
                if (b.y > cloudHeight + b.r) b.y = -b.r;
                if (b.y < -b.r) b.y = cloudHeight + b.r;

                const pulse = Math.sin(t * 0.2 + b.phase) * 0.004;
                const a = Math.max(0, b.alpha + pulse);

                const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                grad.addColorStop(0, isSpringClouds ? `rgba(224,213,222,${a})` : `rgba(190,200,215,${a})`);
                grad.addColorStop(0.45, isSpringClouds ? `rgba(196,190,205,${a * 0.58})` : `rgba(170,185,205,${a * 0.55})`);
                grad.addColorStop(1, isSpringClouds ? 'rgba(196,190,205,0)' : 'rgba(170,185,205,0)');

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }

            for (const p of particles) {
                p.x += p.vx + Math.sin(t * (isSpringClouds ? 0.46 : 0.33) + p.phase) * (isSpringClouds ? 0.13 : 0.09);
                p.y += p.vy;
                p.life += isSpringClouds ? 0.0022 : 0.003;

                if (p.life > 1) {
                    p.life = 0;
                    p.y = isSpringClouds ? -8 : h * 0.55 + 6;
                    p.x = Math.random() * w;
                }
                if (isSpringClouds && (p.y > h + 8 || p.x > w + 8)) { p.y = -8; p.x = Math.random() * w; }
                if (!isSpringClouds && p.y < -6) p.y = h * 0.55 + 6;

                const a = Math.sin(p.life * Math.PI) * (isSpringClouds ? 0.24 : 0.22);
                if (isSpringClouds) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.sin(t * 1.05 + p.phase) * 0.55 + p.phase);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.r * 1.65, p.r * 0.68, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(236,194,211,${a * 0.6})`;
                    ctx.fill();
                    ctx.restore();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(208,224,244,${a})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [isSpringClouds]);

    const springGroundHaze = 'radial-gradient(ellipse 82% 36% at 50% 100%, rgba(238,223,230,0.2) 0%, rgba(218,190,205,0.13) 34%, rgba(240,238,232,0.07) 60%, transparent 84%), linear-gradient(to top, rgba(221,198,211,0.1) 0%, rgba(232,228,224,0.055) 42%, transparent 78%)';
    const cloudWash = isSpringClouds
        ? 'linear-gradient(to bottom, rgba(148,150,165,0.1) 0%, rgba(185,176,188,0.075) 35%, rgba(212,196,205,0.035) 62%, rgba(212,196,205,0) 82%)'
        : 'linear-gradient(to bottom, rgba(120,140,170,0.12) 0%, rgba(115,138,170,0.05) 35%, rgba(115,138,170,0) 60%)';

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div
                className="absolute inset-0"
                style={{ background: cloudWash }}
            />
            {isSpringClouds && (
                <motion.div
                    className="absolute inset-x-0 bottom-0 h-[36%]"
                    style={{ background: springGroundHaze }}
                    animate={{ opacity: [0.64, 0.9, 0.72] }}
                    transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
        </motion.div>
    );
}
