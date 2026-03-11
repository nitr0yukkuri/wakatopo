'use client'

import { useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ------------------------------------------------------------------
// Background Snow / Ice Crystals
// ------------------------------------------------------------------
const particleVertexShader = `
uniform float uTime;
attribute float scale;
varying float vAlpha;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Slow drifting downwards and slight horizontal sway
    mvPosition.y -= mod(uTime * 2.0 * scale, 100.0) - 50.0;
    mvPosition.x += sin(uTime + position.y) * 2.0 * scale;
    
    // Fade out near camera and far away
    vAlpha = smoothstep(-50.0, -10.0, mvPosition.z) * smoothstep(5.0, -10.0, mvPosition.z);
    
    // Size attenuation
    gl_PointSize = scale * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying float vAlpha;
void main() {
    // Soft circle particle
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
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-scale" count={count} array={scales} itemSize={1} />
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

// ------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------
export default function ColdKeepPage() {
    const router = useRouter();
    const { setActiveWork } = useStore();
    const { scrollYProgress } = useScroll();

    // Parallax effect for header
    const yTransform = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const handleReturn = () => {
        setActiveWork(null);
        router.push('/');
    };

    return (
        <main className="relative w-full min-h-[100dvh] bg-gradient-to-b from-[#020b16] via-[#081b33] to-[#020b16] text-white overflow-x-hidden font-sans selection:bg-cyan-200 selection:text-[#020b16]">

            {/* 3D Snow Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                    <SnowParticles />
                </Canvas>
            </div>

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-screen backdrop-blur-sm bg-gradient-to-b from-[#020b16]/80 to-transparent">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-cyan-200 hover:text-white transition-colors group">
                    <span className="w-6 h-[1px] bg-cyan-200 group-hover:bg-white transition-colors" />
                    RETURN TO ORBIT
                </button>
            </nav>

            <div className="relative z-10 container mx-auto px-6 md:px-12 pt-40 pb-32 max-w-4xl">

                {/* Hero Section */}
                <motion.div
                    className="mb-32 md:mb-48 text-center"
                    style={{ y: yTransform, opacity: opacityTransform }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        <span className="inline-block border border-cyan-300/30 text-cyan-100 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full text-xs font-mono tracking-widest mb-10 shadow-[0_0_15px_rgba(165,243,252,0.2)]">
                            STATUS: R&amp;D PHASE
                        </span>

                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 relative">
                            {/* Glass/Ice Text Effect */}
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-blue-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                ColdKeep
                            </span>
                        </h1>
                        <p className="text-xl md:text-3xl font-light text-blue-200/80 tracking-widest mb-12">
                            AI Water Bottle Assistant
                        </p>
                    </motion.div>
                </motion.div>

                {/* Content Blocks - Frosted Glass Aesthetics */}
                <div className="space-y-32">

                    {/* Overview */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-gradient-to-r from-cyan-300 to-transparent" />
                            01 / OVERVIEW
                        </h2>
                        <div className="p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            {/* Inner frost highlight */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50" />
                            <p className="text-xl md:text-3xl font-light leading-relaxed text-blue-50/90 relative z-10">
                                スマートフォンのマイクを入力センサーとして活用し、ステンレスボトルの内部状態（氷の有無・残量・温度）を非破壊で推定する <span className="font-normal text-cyan-200">Soft Sensing</span> アーキテクチャ。
                            </p>
                        </div>
                    </motion.section>

                    {/* The Problem */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                    >
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-gradient-to-r from-cyan-300 to-transparent" />
                            02 / THE PROBLEM
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg transition-all hover:bg-white/[0.06]">
                                <h3 className="text-cyan-100 font-bold mb-4 text-xl flex items-center gap-3">
                                    <span className="text-2xl">🧊</span> Blackbox Nature
                                </h3>
                                <p className="text-sm md:text-base text-blue-200/70 leading-relaxed">
                                    ステンレス水筒の中身は見えない。「飲んだら熱すぎた」「いつの間にかぬるい」という体験の損失が発生している。
                                </p>
                            </div>
                            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-lg transition-all hover:bg-white/[0.06]">
                                <h3 className="text-cyan-100 font-bold mb-4 text-xl flex items-center gap-3">
                                    <span className="text-2xl">🔋</span> Hardware Limits
                                </h3>
                                <p className="text-sm md:text-base text-blue-200/70 leading-relaxed">
                                    既存のIoT水筒は専用デバイスが必須。充電の手間、高コスト、そして電子廃棄物（E-Waste）の問題が避けられない。
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Technical Approach */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <h2 className="text-xs font-mono tracking-widest text-cyan-300 mb-12 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-gradient-to-r from-cyan-300 to-transparent" />
                            03 / TECHNICAL APPROACH
                        </h2>

                        <div className="pl-6 md:pl-12 border-l border-cyan-800/50 space-y-20 relative">
                            {/* Phase 1 */}
                            <div className="relative">
                                {/* Timeline Marker */}
                                <div className="absolute left-[-24px] md:left-[-48px] top-1 transform -translate-x-1/2 w-4 h-4 bg-[#081b33] border-2 border-cyan-300 rounded-full shadow-[0_0_10px_rgba(103,232,249,0.5)]" />

                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                                    Active Sensing
                                </h3>
                                <p className="text-cyan-200/80 font-mono text-sm mb-6 uppercase tracking-wider">
                                    Acoustic Analysis / DSP / Edge AI
                                </p>
                                <p className="text-blue-100/80 leading-relaxed text-base md:text-lg max-w-2xl font-light">
                                    ユーザーがボトルを振った際、あるいは注水時の「衝突音・流体音」をスマートフォンのマイクで集音。
                                    PCM生波形をFFTでスペクトログラム化し、TensorFlow Liteによる軽量モデルで端末内推論（氷量・水量）を実行します。
                                    C++ JSIレイヤーで直接処理することで、超低遅延を実現。
                                </p>
                            </div>

                            {/* Phase 2 */}
                            <div className="relative">
                                {/* Timeline Marker */}
                                <div className="absolute left-[-24px] md:left-[-48px] top-1 transform -translate-x-1/2 w-4 h-4 bg-[#081b33] border-2 border-cyan-300 rounded-full shadow-[0_0_10px_rgba(103,232,249,0.5)]" />

                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                                    Passive Simulation
                                </h3>
                                <p className="text-cyan-200/80 font-mono text-sm mb-6 uppercase tracking-wider">
                                    Newton's Law of Cooling / Real-time Physics
                                </p>
                                <p className="text-blue-100/80 leading-relaxed text-base md:text-lg max-w-2xl font-light">
                                    一度内部状態を特定した後は、ニュートンの冷却法則に基づく物理モデルをバックグラウンドで実行。
                                    外気温と時刻データから熱移動を計算し、水筒内部の温度変化を高精度にシミュレーションし続けます。
                                </p>

                                {/* Ice Code Block */}
                                <div className="mt-8 bg-[#020b16]/80 border border-cyan-900/50 p-6 rounded-2xl font-mono text-xs md:text-sm text-cyan-100/70 overflow-x-auto whitespace-pre shadow-inner">
                                    <code>
                                        {`// Newton's Law of Cooling Simulation Step
const dT = -k * (T_liquid - T_ambient) * delta_t;
T_liquid += dT;

if (ice_mass > 0) {
    // Phase change enthalpy (Keeping it freezing)
    const energy_transfer = h_f * ice_melt_rate * delta_t;
    T_liquid = 0.0; // Stabilize at 0°C while ice persists
}`}
                                    </code>
                                </div>
                            </div>
                        </div>

                    </motion.section>

                    {/* GitHub Link */}
                    <motion.div
                        className="pt-16 border-t border-cyan-900/30 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <a
                            href="https://github.com/nitr0yukkuri/coldkeep"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-white/5 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] px-10 py-5 rounded-full text-sm font-mono tracking-widest transition-all duration-300 text-cyan-50 backdrop-blur-md"
                        >
                            <span className="text-xl">❄️</span> VIEW SOURCE ON GITHUB ↗
                        </a>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
