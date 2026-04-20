'use client'

import { useRef, useMemo, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const particleVertexShader = `
uniform float uTime;
attribute float scale;
varying float vAlpha;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    mvPosition.y -= mod(uTime * 2.0 * scale, 100.0) - 50.0;
    mvPosition.x += sin(uTime + position.y) * 2.0 * scale;
    
    // Fix smoothstep inversion
    vAlpha = smoothstep(-50.0, -10.0, mvPosition.z) * (1.0 - smoothstep(-10.0, 5.0, mvPosition.z));
    
    gl_PointSize = scale * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying float vAlpha;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - (dist * 2.0)) * vAlpha;
    gl_FragColor = vec4(0.8, 0.95, 1.0, alpha * 0.5); // Icy white-blue
}
`;

function SnowParticles() {
    const count = 600;
    const meshRef = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), []);

    const { positions, scales } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            p[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
            s[i] = Math.random() * 2.0 + 0.5;
        }
        return { positions: p, scales: s };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function WaterBottleCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
        x: -100, y: -100, rawX: -100, rawY: -100,
        vx: 0, vy: 0,
        clickScale: 1.0, clickVel: 0,
        lidOffset: 0, lidVel: 0,
        vaporParticles: [] as { x: number, y: number, vx: number, vy: number, life: number, r: number }[],
        raf: 0
    });

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            stateRef.current.rawX = e.clientX;
            stateRef.current.rawY = e.clientY;
        };
        const onDown = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            stateRef.current.clickVel = -0.12; // sharp, stiff click instead of soft squish
            stateRef.current.lidVel = -2.8; // pop lid up
            
            // Spawn vapor (デジタルな輝く冷気パーティクル)
            for (let i=0; i<10; i++) {
                stateRef.current.vaporParticles.push({
                    x: (Math.random() - 0.5) * 6,
                    y: 12, 
                    vx: (Math.random() - 0.5) * 3.5,
                    vy: Math.random() * -1.8 - 0.4, // 上向きにピュッと出る
                    life: 1.0 + Math.random() * 0.3,
                    r: Math.random() * 2 + 1 // 細かくシャープな粒
                });
            }
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerdown', onDown);

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
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
        
        let t = 0;
        
        const draw = () => {
            t += 0.05;
            const state = stateRef.current;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            // smooth follow
            const dx = state.rawX - state.x;
            const dy = state.rawY - state.y;
            state.x += dx * 0.22;
            state.y += dy * 0.22;
            
            state.vx = dx * 0.22;
            state.vy = dy * 0.22;
            
            // click spring (stiff mechanical click)
            state.clickVel += (1.0 - state.clickScale) * 0.4;
            state.clickVel *= 0.6; // high friction for snappiness
            state.clickScale += state.clickVel;
            
            // lid spring (snappy shut)
            state.lidVel += (0 - state.lidOffset) * 0.5; 
            state.lidVel *= 0.55;
            state.lidOffset += state.lidVel;
            
            if (state.rawX === -100) {
                state.raf = requestAnimationFrame(draw);
                return;
            }
            
            ctx.save();
            ctx.translate(state.x, state.y);
            
            // 基本の傾き(-36度) ＋ 追従時の少しの揺れSway
            const baseTilt = -Math.PI * 0.2; 
            const sway = Math.max(-0.2, Math.min(0.2, state.vx * 0.01));
            ctx.rotate(baseTilt + sway);
            ctx.scale(state.clickScale * 0.75, state.clickScale * 0.75); // 少し小さめにスケールダウン
            
            // ポインターの真の先端（クリック座標）が「ボトルの左上カド」に来るように、描画位置を右下にシフトする
            ctx.translate(6, 4);
            
            // --- Draw Vapor (デジタル冷気) ---
            for (let i = state.vaporParticles.length - 1; i >= 0; i--) {
                const p = state.vaporParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // 沈む
                p.vx += Math.sin(t * 3 + i) * 0.06; // swirl
                p.life -= 0.03;
                
                if (p.life <= 0) {
                    state.vaporParticles.splice(i, 1);
                    continue;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(125, 211, 252, ${p.life * 0.9})`; // ネオンブルーの輝き
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#38bdf8';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            // --- Draw Water Bottle (Stylish Game Asset Vibe) ---
            // 座標(0,0)がフタの先端（正確なクリックポイント）
            const lidY = Math.min(0, state.lidOffset);

            const pathLid = (c: CanvasRenderingContext2D, y: number) => {
                c.beginPath();
                c.roundRect(-7, y, 14, 10, [2, 2, 0, 0]);
                c.rect(-8, y + 10, 16, 3);
            };

            const pathNeck = (c: CanvasRenderingContext2D) => {
                c.beginPath();
                c.rect(-6, 13, 12, 4);
            };

            const bodyW = 18;
            const bodyH = 55;
            const bodyY = 17;

            const pathBody = (c: CanvasRenderingContext2D) => {
                c.beginPath();
                c.roundRect(-bodyW/2, bodyY, bodyW, bodyH, [6, 6, 4, 4]);
            };

            // White Outer Halo Glow
            ctx.lineJoin = 'round';
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
            
            pathLid(ctx, lidY); ctx.stroke();
            pathNeck(ctx); ctx.stroke();
            pathBody(ctx); ctx.stroke();
            
            ctx.shadowBlur = 0;

            // 1. Lid Fills & Strokes
            pathLid(ctx, lidY);
            const capG = ctx.createLinearGradient(-8, 0, 8, 0);
            capG.addColorStop(0, '#5a6d7c');
            capG.addColorStop(0.3, '#94a7b5');
            capG.addColorStop(0.7, '#94a7b5');
            capG.addColorStop(1, '#5a6d7c');
            ctx.fillStyle = capG;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#12182b';
            ctx.stroke();

            // Lid ridges
            ctx.beginPath();
            for (let rx = -4; rx <= 4; rx += 2.5) {
                ctx.moveTo(rx, lidY + 1.5);
                ctx.lineTo(rx, lidY + 8.5);
            }
            ctx.strokeStyle = 'rgba(20, 30, 50, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 2. Neck
            pathNeck(ctx);
            ctx.fillStyle = '#8293a1';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#12182b';
            ctx.stroke();

            // 3. Body
            pathBody(ctx);
            const bodyG = ctx.createLinearGradient(0, bodyY, 0, bodyY + bodyH);
            bodyG.addColorStop(0, '#a5b8c6');
            bodyG.addColorStop(0.4, '#419cd3');
            bodyG.addColorStop(1, '#6f3d9e');
            ctx.fillStyle = bodyG;
            ctx.fill();
            
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#12182b';
            ctx.stroke();

            // Bottom seam
            ctx.beginPath();
            ctx.moveTo(-bodyW/2, bodyY + bodyH - 6);
            ctx.lineTo(bodyW/2, bodyY + bodyH - 6);
            ctx.strokeStyle = 'rgba(18, 24, 43, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Highlight (Ice/Glass reflection on the left)
            const hlX = -bodyW/2 + 3.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            
            ctx.beginPath(); ctx.arc(hlX, bodyY + 8, 1, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.roundRect(hlX - 1, bodyY + 12, 2, 26, 1); ctx.fill();
            ctx.beginPath(); ctx.arc(hlX, bodyY + 42, 1, 0, Math.PI*2); ctx.fill();

            ctx.restore();
            
            state.raf = requestAnimationFrame(draw);
        };
        draw();
        
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(stateRef.current.raf);
        };
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            <style>{`
                * { cursor: none !important; }
            `}</style>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
    );
}

export default function ColdKeepPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork } = useStore();
    const { scrollYProgress } = useScroll();
    const [showSnowBackground, setShowSnowBackground] = useState(false);

    useEffect(() => {
        const reveal = () => {
            setShowSnowBackground(true);
        };

        window.addEventListener('pointerdown', reveal, { once: true, passive: true });
        window.addEventListener('keydown', reveal, { once: true });
        window.addEventListener('scroll', reveal, { once: true, passive: true });
        const timer = window.setTimeout(reveal, 15000);

        return () => {
            window.removeEventListener('pointerdown', reveal);
            window.removeEventListener('keydown', reveal);
            window.removeEventListener('scroll', reveal);
            window.clearTimeout(timer);
        };
    }, []);

    const copy = {
        ja: {
            returnToOrbit: 'Return to Lab',
            overview: 'スマートフォンのマイクを入力センサーとして活用し、ステンレスボトルの内部状態（氷の有無・残量・温度）を非破壊で推定する',
            overviewTail: 'アーキテクチャ。',
            blackbox: 'ステンレス水筒の中身は見えない。「飲んだら熱すぎた」「いつの間にかぬるい」という体験の損失が発生している。',
            hardware: '既存のIoT水筒は専用デバイスが必須。充電の手間、高コスト、そして電子廃棄物（E-Waste）の問題が避けられない。',
            active1: 'ユーザーがボトルを振った際、あるいは注水時の「衝突音・流体音」をスマートフォンのマイクで集音。',
            active2: 'PCM生波形をFFTでスペクトログラム化し、TensorFlow Liteによる軽量モデルで端末内推論（氷量・水量）を実行します。',
            active3: 'C++ JSIレイヤーで直接処理することで、超低遅延を実現。',
            passive1: '一度内部状態を特定した後は、ニュートンの冷却法則に基づく物理モデルをバックグラウンドで実行。',
            passive2: '外気温と時刻データから熱移動を計算し、水筒内部の温度変化を高精度にシミュレーションし続けます。',
        },
        en: {
            returnToOrbit: 'Return to Lab',
            overview: 'A non-destructive',
            overviewTail: 'architecture that uses a smartphone microphone as an input sensor to estimate internal bottle conditions (ice presence, remaining amount, and temperature).',
            blackbox: 'You cannot see inside a stainless bottle. This causes experience loss, such as finding it too hot to drink or unexpectedly lukewarm.',
            hardware: 'Existing IoT bottles require dedicated hardware. Charging friction, higher cost, and electronic waste (E-Waste) are hard to avoid.',
            active1: 'When users shake the bottle or pour liquid, collision and fluid sounds are captured by the smartphone microphone.',
            active2: 'Raw PCM waveforms are converted into spectrograms with FFT, then a lightweight TensorFlow Lite model performs on-device inference for ice and liquid levels.',
            active3: 'Direct C++ JSI processing enables ultra-low latency.',
            passive1: 'After estimating the internal state once, a physical model based on Newton\'s law of cooling runs in the background.',
            passive2: 'Using ambient temperature and time data, it continuously simulates internal temperature changes with high accuracy.',
        },
    } as const;
    const t = copy[lang];

    const yTransform = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const handleReturn = () => {
        setActiveWork(null);
        router.push(`/?lang=${lang}`);
    };

    return (
        <main className="relative w-full min-h-dvh bg-[#01060c] text-white overflow-x-hidden font-sans selection:bg-cyan-200 selection:text-[#020b16]">
            
            <WaterBottleCursor />

            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{ background: 'linear-gradient(to bottom, #01060c 0%, #07192a 48%, #01060c 100%)' }}
            />

            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: 'radial-gradient(circle at 50% 22%, rgba(210,238,255,0.18) 0%, rgba(120,190,235,0.08) 24%, rgba(255,255,255,0.0) 56%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 34%, rgba(132,205,255,0.07) 72%, rgba(180,232,255,0.18) 100%)',
                }}
            />

            {/* 3D Snow Background */}
            {showSnowBackground && (
                <div className="fixed inset-0 pointer-events-none z-1">
                    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                        <SnowParticles />
                    </Canvas>
                </div>
            )}

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#e0f2fe] hover:text-[#bae6fd] transition-colors group">
                    <span className="w-6 h-[1px] bg-[#e0f2fe] group-hover:bg-[#bae6fd] transition-colors" />
                    {t.returnToOrbit}
                </button>
            </nav>

            <div className="relative z-10 container mx-auto px-6 md:px-12 pt-40 pb-32 max-w-4xl">
                {/* Hero */}
                <motion.div className="mb-32 md:mb-48 text-center" style={{ y: yTransform, opacity: opacityTransform }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
                        <span className="inline-block border border-[#38bdf8]/30 backdrop-blur-md bg-white/5 text-[#7dd3fc] px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-10 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                            STATUS: R&amp;D PHASE
                        </span>
                        <Image
                            src="/coldkeep-logo.png"
                            alt="コールドキープ COLDKEEP"
                            width={640}
                            height={220}
                            sizes="(max-width: 768px) 80vw, 448px"
                            priority
                            className="w-full max-w-xs md:max-w-md mx-auto mb-6 drop-shadow-[0_0_40px_rgba(100,200,255,0.5)]"
                            style={{ mixBlendMode: 'screen' }}
                        />
                        <p className="text-xl md:text-3xl font-light text-[#e0f2fe] tracking-widest">
                            AI Water Bottle Assistant
                        </p>
                    </motion.div>
                </motion.div>

                {/* Content */}
                <div className="space-y-32">
                    {/* Overview */}
                    <motion.section
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-xs font-mono tracking-widest text-[#7dd3fc] mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-[#38bdf8]" />
                            01 / OVERVIEW
                        </h2>
                        <p className="text-xl md:text-3xl font-light leading-relaxed text-[#f0f9ff]">
                            {t.overview} <span className="font-medium text-white shadow-[#38bdf8]">Soft Sensing</span> {t.overviewTail}
                        </p>
                    </motion.section>

                    {/* Problem */}
                    <motion.section
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-xs font-mono tracking-widest text-[#7dd3fc] mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-[#38bdf8]" />
                            02 / THE PROBLEM
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-white font-bold mb-4 text-xl">Blackbox Nature</h3>
                                <p className="text-[#e0f2fe] leading-relaxed text-sm md:text-base opacity-80">
                                    {t.blackbox}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-4 text-xl">Hardware Limits</h3>
                                <p className="text-[#e0f2fe] leading-relaxed text-sm md:text-base opacity-80">
                                    {t.hardware}
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Technical Approach */}
                    <motion.section
                        className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-xs font-mono tracking-widest text-[#7dd3fc] mb-12 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-[#38bdf8]" />
                            03 / TECHNICAL APPROACH
                        </h2>

                        <div className="space-y-24">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Active Sensing</h3>
                                <p className="text-[#38bdf8] font-mono text-sm mb-6 bg-[#0369a1]/20 inline-block px-3 py-1 rounded-full">Acoustic Analysis / DSP / Edge AI</p>
                                <p className="text-[#e0f2fe] leading-relaxed mb-8 opacity-90">
                                    {t.active1}
                                    {t.active2}
                                    {t.active3}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">Passive Simulation</h3>
                                <p className="text-[#38bdf8] font-mono text-sm mb-6 bg-[#0369a1]/20 inline-block px-3 py-1 rounded-full">Newton's Law of Cooling</p>
                                <p className="text-[#e0f2fe] leading-relaxed mb-8 opacity-90">
                                    {t.passive1}
                                    {t.passive2}
                                </p>
                                <div className="bg-[#020b16]/80 glass border border-[#38bdf8]/30 p-6 rounded-lg font-mono text-xs md:text-sm text-[#bae6fd] overflow-x-auto shadow-inner">
                                    <code>
                                        {`// Newton's Law of Cooling Simulation Step
const dT = -k * (T_liquid - T_ambient) * delta_t;
T_liquid += dT;

if (ice_mass > 0) {
    // Phase change enthalpy
    const energy_transfer = h_f * ice_melt_rate * delta_t;
    T_liquid = 0.0;
}`}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* GitHub Link */}
                    <motion.div className="mt-16 pt-10 border-t border-white/10 flex justify-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <a href="https://github.com/nitr0yukkuri/coldkeep" target="_blank" rel="noopener noreferrer"
                            className="inline-block border border-[#7dd3fc] hover:bg-[#7dd3fc] hover:text-[#020b16] bg-white/5 backdrop-blur-md px-10 py-4 rounded-full text-sm font-mono tracking-widest text-[#e0f2fe] transition-all shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)]">
                            VIEW SOURCE ON GITHUB ↗
                        </a>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
