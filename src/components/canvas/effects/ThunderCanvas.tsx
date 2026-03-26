'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Drop { x: number; y: number; speed: number; len: number; alpha: number; }
type Seg = [number, number, number, number];

export default function ThunderCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const flashRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let raf: number;
        let lastTime = performance.now();

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 雨粒
        const dropCount = 300;
        const drops: Drop[] = Array.from({ length: dropCount }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            speed: Math.random() * 7 + 10,
            len: Math.random() * 8 + 6,
            alpha: Math.random() * 0.16 + 0.06,
        }));

        // 稲妻
        let bolt: Seg[] | null = null;
        let boltTimer = 0;
        const BOLT_DURATION = 0.13;
        let lightningTimer = 0;
        let nextLightning = 2.5 + Math.random() * 4;

        // 中点変位法で稲妻セグメントを生成
        function genBolt(
            x1: number, y1: number,
            x2: number, y2: number,
            depth: number, offset: number,
            segs: Seg[],
        ) {
            if (depth <= 0) { segs.push([x1, y1, x2, y2]); return; }
            const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * offset;
            const my = (y1 + y2) / 2 + (Math.random() - 0.5) * offset * 0.15;
            genBolt(x1, y1, mx, my, depth - 1, offset * 0.52, segs);
            genBolt(mx, my, x2, y2, depth - 1, offset * 0.52, segs);
        }

        function triggerLightning() {
            const segs: Seg[] = [];
            const sx = canvas.width * (0.2 + Math.random() * 0.6);
            const ex = sx + (Math.random() - 0.5) * 90;
            const ey = canvas.height * (0.35 + Math.random() * 0.3);
            genBolt(sx, 0, ex, ey, 6, 72, segs);
            bolt = segs;
            boltTimer = 0;

            // フラッシュ演出
            const flash = flashRef.current;
            if (flash) {
                flash.style.opacity = '0.2';
                setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 65);
                setTimeout(() => { if (flash) flash.style.opacity = '0.08'; }, 105);
                setTimeout(() => { if (flash) flash.style.opacity = '0'; }, 180);
            }
        }

        function draw(now: number) {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // 雨を描画
            ctx.lineWidth = 0.5;
            for (const d of drops) {
                d.x -= d.speed * 0.38 * dt * 60;
                d.y += d.speed * dt * 60;
                if (d.y > h + d.len) { d.y = -d.len; d.x = Math.random() * w; }
                if (d.x < -20) { d.x = w; }
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x + d.len * 0.38, d.y - d.len);
                ctx.strokeStyle = `rgba(130,165,220,${d.alpha})`;
                ctx.stroke();
            }

            // 稲妻タイマー
            lightningTimer += dt;
            boltTimer += dt;
            if (lightningTimer >= nextLightning) {
                triggerLightning();
                lightningTimer = 0;
                nextLightning = 2 + Math.random() * 5;
            }

            // 稲妻ボルトを描画 (フェードアウト)
            if (bolt && boltTimer < BOLT_DURATION) {
                const fade = 1 - boltTimer / BOLT_DURATION;
                ctx.save();
                ctx.shadowBlur = 13;
                ctx.shadowColor = 'rgba(180,210,255,1)';
                ctx.strokeStyle = `rgba(215,235,255,${fade * 0.76})`;
                ctx.lineWidth = 0.92;
                for (const [x1, y1, x2, y2] of bolt) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                // 中心に白いコアライン
                ctx.strokeStyle = `rgba(240,248,255,${fade * 0.45})`;
                ctx.lineWidth = 0.34;
                for (const [x1, y1, x2, y2] of bolt) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            raf = requestAnimationFrame(draw);
        }
        raf = requestAnimationFrame(draw);

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* 暗い嵐のオーバーレイ */}
            <div className="absolute inset-0 bg-[#000510]/18" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* 稲妻フラッシュ */}
            <div
                ref={flashRef}
                className="absolute inset-0 bg-[#b2c7ff]"
                style={{ opacity: 0, transition: 'opacity 0.04s' }}
            />
        </motion.div>
    );
}
