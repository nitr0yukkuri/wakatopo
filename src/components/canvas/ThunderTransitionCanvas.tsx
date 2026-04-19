'use client'

import { useEffect, useRef } from 'react';

// 雷（Thunder）の遷移エフェクト: HTML5 Canvasで動的に枝分かれするリアルな稲妻と発光を描画

class Lightning {
    branches: { depth: number, lines: {x1:number, y1:number, x2:number, y2:number}[] }[] = [];
    life: number = 1.0;
    maxLife: number = Math.random() * 0.3 + 0.4; // 寿命(秒)
    
    constructor(w: number, h: number, startX?: number) {
        const rx = startX ?? w * (0.2 + Math.random() * 0.6);
        this.buildBranch(rx, 0, Math.PI / 2, 0, h);
    }
    
    buildBranch(startX: number, startY: number, startAngle: number, depth: number, h: number) {
        if (!this.branches[depth]) this.branches[depth] = { depth, lines: [] };
        
        let cx = startX;
        let cy = startY;
        let angle = startAngle;
        
        const maxSteps = depth === 0 ? 120 : (15 + Math.random() * 25);
        
        for (let i = 0; i < maxSteps; i++) {
            if (cy > h + 50) break;
            
            const length = 12 + Math.random() * 18;
            angle += (Math.random() - 0.5) * 0.9; // 鋭いジグザグ
            const downAngle = Math.PI / 2;
            angle += (downAngle - angle) * 0.15; // 下方向へ補正
            
            const nx = cx + Math.cos(angle) * length;
            const ny = cy + Math.sin(angle) * length;
            
            this.branches[depth].lines.push({ x1: cx, y1: cy, x2: nx, y2: ny });
            
            cx = nx;
            cy = ny;
            
            // 枝分かれの確率を大幅に下げ、深さも制限（きもくない、スッキリした稲妻にする）
            if (Math.random() < 0.015 && depth < 2) {
                this.buildBranch(cx, cy, angle + (Math.random() > 0.5 ? 0.6 : -0.6), depth + 1, h);
            }
        }
    }

    update(dt: number) {
        this.life -= dt / this.maxLife;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        // 点滅効果: 発生直後は激しく乱数で点滅し、その後スッと消えるリアルな表現
        const flicker = this.life > 0.7 ? (Math.random() > 0.3 ? 1 : 0.2) : this.life;
        if (flicker < 0.05) return;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // パフォーマンスのため、同じ太さ・色の線はまとめてパスにする
        // 複数回の大まかなストロークで強い発光(Bloom)を表現
        const passes = [
            { exp: 12, col: `rgba(130, 170, 255, ${flicker * 0.15})` },
            { exp: 6, col: `rgba(180, 210, 255, ${flicker * 0.4})` },
            { exp: 0, col: `rgba(255, 255, 255, ${flicker * 0.95})` },
        ];

        passes.forEach(pass => {
            ctx.strokeStyle = pass.col;
            this.branches.forEach(b => {
                if (!b || b.lines.length === 0) return;
                ctx.lineWidth = Math.max(0.5, 4.5 - b.depth * 1.2) + pass.exp;
                ctx.beginPath();
                for (const l of b.lines) {
                    ctx.moveTo(l.x1, l.y1);
                    ctx.lineTo(l.x2, l.y2);
                }
                ctx.stroke();
            });
        });
    }
}

export default function ThunderTransitionCanvas({ continuous = false }: { continuous?: boolean } = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        
        let raf: number;
        let lastTime = performance.now();
        let bolts: Lightning[] = [];
        
        let dpr = window.devicePixelRatio || 1;
        
        const resize = () => {
            dpr = window.devicePixelRatio || 1;
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener('resize', resize);
        
        // 初回の落雷 (transition時、もしくはcontinuousの初期表示)
        bolts.push(new Lightning(window.innerWidth, window.innerHeight, window.innerWidth * 0.3));
        
        let timeElapsed = 0;
        let hasSpawnedBolt2 = false;
        let hasSpawnedBolt3 = false;
        let nextContinuousBoltTime = Math.random() * 5 + 3; // 最初は少し待ってから発生

        const loop = (time: number) => {
            raf = requestAnimationFrame(loop);
            const dt = Math.min((time - lastTime) / 1000, 0.1); // seconds
            lastTime = time;
            timeElapsed += dt;
            
            // 時間差で複数の落雷を発生させる (最初の演出)
            if (timeElapsed > 0.25 && !hasSpawnedBolt2) {
                bolts.push(new Lightning(window.innerWidth, window.innerHeight, window.innerWidth * (Math.random() * 0.6 + 0.2)));
                hasSpawnedBolt2 = true;
            }
            if (!continuous && timeElapsed > 0.6 && !hasSpawnedBolt3) {
                bolts.push(new Lightning(window.innerWidth, window.innerHeight, window.innerWidth * (Math.random() * 0.8 + 0.1)));
                hasSpawnedBolt3 = true;
            }

            // continuous: 断続的に雷を発生させる
            if (continuous && timeElapsed > nextContinuousBoltTime) {
                // ランダムな位置に落雷
                bolts.push(new Lightning(window.innerWidth, window.innerHeight, window.innerWidth * Math.random()));
                // 次の落雷までの間隔 (10秒〜25秒に延長し、降る量を大幅に減らす)
                nextContinuousBoltTime = timeElapsed + Math.random() * 15 + 10;
                
                // たまに連雷(2発目)も追加 (確率も下げる)
                if (Math.random() > 0.85) {
                    setTimeout(() => {
                        if (canvasRef.current) {
                            bolts.push(new Lightning(window.innerWidth, window.innerHeight, window.innerWidth * Math.random()));
                        }
                    }, Math.random() * 300 + 100);
                }
            }

            // グローバルの閃光強度（最も鮮烈な雷に合わせる）
            let maxFlash = 0;
            bolts.forEach(b => {
               b.update(dt);
               if (b.life > maxFlash) maxFlash = b.life;
            });
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (!continuous) {
                // 暗雲の空模様（トランジション用のベース背景）
                const bg = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
                bg.addColorStop(0, '#070b12');
                bg.addColorStop(0.42, '#0e1825');
                bg.addColorStop(1, '#1a2839');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            }

            // 空全体の淡い発光（雷に合わせた光）
            if (maxFlash > 0.05) {
                const globalFlicker = maxFlash > 0.7 ? (Math.random() > 0.3 ? maxFlash : maxFlash * 0.3) : maxFlash;
                
                // 光の広がりを表現する放射状グラデーション
                const glow = ctx.createRadialGradient(
                    window.innerWidth * 0.5, window.innerHeight * 0.2, 0,
                    window.innerWidth * 0.5, window.innerHeight * 0.2, window.innerWidth * 0.8
                );
                glow.addColorStop(0, `rgba(180, 200, 255, ${globalFlicker * 0.3})`);
                glow.addColorStop(1, `rgba(180, 200, 255, 0)`);
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                
                // 更に画面全体を一瞬白く飛ばす強烈な閃光
                ctx.fillStyle = `rgba(220, 235, 255, ${globalFlicker * 0.15})`; 
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            }
            
            // 雷本体の描画
            bolts.forEach(b => b.draw(ctx));

            // 地面付近の霧・雲のグラデーション
            const fog = ctx.createLinearGradient(0, window.innerHeight * 0.6, 0, window.innerHeight);
            fog.addColorStop(0, 'rgba(214,228,255,0)');
            fog.addColorStop(1, 'rgba(214,228,255,0.18)');
            ctx.fillStyle = fog;
            ctx.fillRect(0, window.innerHeight * 0.6, window.innerWidth, window.innerHeight * 0.4);
        };
        
        raf = requestAnimationFrame(loop);
        
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="w-full h-full overflow-hidden relative">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
    );
}
