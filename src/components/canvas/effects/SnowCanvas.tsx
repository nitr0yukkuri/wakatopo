'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Flake {
    x: number; y: number;
    vx: number; vy: number;
    r: number; alpha: number; phase: number;
}

export default function SnowCanvas() {
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

        // 3レイヤー: 遠景(小・薄)・中景・近景(大・濃)
        const layers = [
            { count: 80, rMin: 0.8, rMax: 1.8, vyMin: 0.3, vyMax: 0.9, alphaMax: 0.35, drift: 0.22 },
            { count: 60, rMin: 1.5, rMax: 3.0, vyMin: 0.7, vyMax: 1.6, alphaMax: 0.55, drift: 0.30 },
            { count: 30, rMin: 2.5, rMax: 4.5, vyMin: 1.2, vyMax: 2.2, alphaMax: 0.70, drift: 0.35 },
        ];

        const flakes: Flake[] = [];
        for (const l of layers) {
            for (let i = 0; i < l.count; i++) {
                flakes.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.3,
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
            fc.width = rOffset * 2;
            fc.height = rOffset * 2;
            const fctx = fc.getContext('2d')!;
            const grad = fctx.createRadialGradient(rOffset, rOffset, 0, rOffset, rOffset, f.r);
            grad.addColorStop(0, `rgba(225,238,255,${f.alpha})`);
            grad.addColorStop(0.6, `rgba(210,228,255,${f.alpha * 0.45})`);
            grad.addColorStop(1, 'rgba(200,220,255,0)');
            fctx.fillStyle = grad;
            fctx.beginPath();
            fctx.arc(rOffset, rOffset, f.r, 0, Math.PI * 2);
            fctx.fill();
            flakeCanvases.push(fc);
        }

        function draw() {
            t += 0.012;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

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
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* わずかに冷たい青みがかったオーバーレイ */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(190,210,240,0.025)' }}
            />
        </motion.div>
    );
}
