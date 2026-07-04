'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Flake {
    x: number; y: number;
    vx: number; vy: number;
    r: number; alpha: number; phase: number;
}

type SnowVariant = 'default' | 'winter-snow';

export default function SnowCanvas({
    density = 1,
    variant = 'default',
    mobileScale = 1,
}: {
    density?: number;
    variant?: SnowVariant;
    mobileScale?: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let raf: number;
        let t = 0;
        let dpr = Math.max(1, window.devicePixelRatio || 1);

        const resize = () => {
            dpr = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);

        const isWinterSnow = variant === 'winter-snow';
        const sizeScale = window.innerWidth < 640 ? mobileScale : 1;

        // 3レイヤー: 遠景(小・薄)・中景・近景(大・濃)
        const layers = (isWinterSnow ? [
            { count: 95, rMin: 0.8, rMax: 1.8, vyMin: 0.24, vyMax: 0.72, alphaMax: 0.28, drift: 0.10 },
            { count: 62, rMin: 1.2, rMax: 2.5, vyMin: 0.48, vyMax: 1.18, alphaMax: 0.38, drift: 0.14 },
            { count: 36, rMin: 1.8, rMax: 3.2, vyMin: 0.75, vyMax: 1.55, alphaMax: 0.46, drift: 0.18 },
        ] : [
            { count: 60, rMin: 1.0, rMax: 2.0, vyMin: 0.35, vyMax: 1.0, alphaMax: 0.30, drift: 0.18 },
            { count: 40, rMin: 1.6, rMax: 3.0, vyMin: 0.8, vyMax: 1.8, alphaMax: 0.42, drift: 0.24 },
            { count: 25, rMin: 2.2, rMax: 4.0, vyMin: 1.2, vyMax: 2.3, alphaMax: 0.55, drift: 0.30 },
        ]).map((layer) => ({
            ...layer,
            count: Math.max(1, Math.round(layer.count * density)),
            rMin: layer.rMin * sizeScale,
            rMax: layer.rMax * sizeScale,
        }));

        const flakes: Flake[] = [];
        for (const l of layers) {
            for (let i = 0; i < l.count; i++) {
                flakes.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * (isWinterSnow ? 0.16 : 0.3),
                    vy: Math.random() * (l.vyMax - l.vyMin) + l.vyMin,
                    r: Math.random() * (l.rMax - l.rMin) + l.rMin,
                    alpha: Math.random() * l.alphaMax + 0.1,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        }

        // レイヤー毎の drift 量を保持するため、flakeIndexからdrif値へのマップ
        const driftMap: number[] = [];
        const flakeCanvases: HTMLCanvasElement[] = [];
        let fi = 0;
        for (const l of layers) {
            for (let i = 0; i < l.count; i++) {
                driftMap[fi++] = l.drift;
            }
        }

        // プレレンダリングしてパフォーマンスを最適化 (createRadialGradientを毎フレーム呼ばない)
        for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            const fc = document.createElement('canvas');
            const rOffset = Math.ceil(f.r);
            fc.width = Math.ceil(rOffset * 2 * dpr);
            fc.height = Math.ceil(rOffset * 2 * dpr);
            const fctx = fc.getContext('2d')!;
            fctx.scale(dpr, dpr);
            fctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
            fctx.beginPath();
            fctx.arc(rOffset, rOffset, f.r, 0, Math.PI * 2);
            fctx.fill();
            flakeCanvases.push(fc);
        }

        function draw() {
            t += 0.012;
            const w = window.innerWidth;
            const h = window.innerHeight;
            ctx.clearRect(0, 0, w, h);

            if (isWinterSnow) {
                const air = ctx.createLinearGradient(0, 0, 0, h);
                air.addColorStop(0, 'rgba(205, 234, 255, 0.055)');
                air.addColorStop(0.48, 'rgba(226, 244, 255, 0.035)');
                air.addColorStop(1, 'rgba(235, 249, 255, 0.075)');
                ctx.fillStyle = air;
                ctx.fillRect(0, 0, w, h);
            }

            for (let i = 0; i < flakes.length; i++) {
                const f = flakes[i];
                const drift = driftMap[i];

                f.x += f.vx + Math.sin(t * 0.42 + f.phase) * drift;
                f.y += f.vy;

                if (f.y > h + 6) { f.y = -6; f.x = Math.random() * w; }
                if (f.x > w + 6) f.x = -6;
                if (f.x < -6) f.x = w + 6;

                const rOffset = Math.ceil(f.r);
                ctx.drawImage(flakeCanvases[i], f.x - rOffset, f.y - rOffset);
            }

            if (isWinterSnow) {
                const haze = ctx.createLinearGradient(0, h * 0.62, 0, h);
                haze.addColorStop(0, 'rgba(238, 249, 255, 0)');
                haze.addColorStop(0.7, 'rgba(232, 247, 255, 0.08)');
                haze.addColorStop(1, 'rgba(246, 252, 255, 0.16)');
                ctx.fillStyle = haze;
                ctx.fillRect(0, h * 0.62, w, h * 0.38);
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [density, variant, mobileScale]);

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
        >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
