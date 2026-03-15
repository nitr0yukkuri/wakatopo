'use client'

import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { waveVertexShader, waveFragmentShader } from '@/shaders/wave';

const bubbleSpecs = [
    { left: '8%', top: '18%', size: 16, delay: 0.0, duration: 8.0 },
    { left: '18%', top: '68%', size: 10, delay: 1.2, duration: 7.2 },
    { left: '31%', top: '44%', size: 22, delay: 0.6, duration: 9.5 },
    { left: '52%', top: '72%', size: 14, delay: 1.8, duration: 8.8 },
    { left: '66%', top: '22%', size: 18, delay: 0.3, duration: 10.0 },
    { left: '81%', top: '56%', size: 12, delay: 1.0, duration: 7.8 },
    { left: '90%', top: '28%', size: 24, delay: 2.0, duration: 11.0 },
];

const fishSpecs = [
    { top: '20%', left: '12%', width: 72, delay: 0.0, duration: 18 },
    { top: '58%', left: '68%', width: 56, delay: 1.4, duration: 16 },
    { top: '74%', left: '24%', width: 42, delay: 2.1, duration: 14 },
];

const bubbleVertexShader = `
uniform float uTime;
attribute float scale;
attribute float speed;
attribute float seed;
varying float vAlpha;

void main() {
    vec3 pos = position;
    float rise = mod(uTime * speed + seed * 16.0, 24.0) - 12.0;
    pos.y += rise;
    pos.x += sin(uTime * 0.65 + seed * 7.0) * 0.22;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vAlpha = smoothstep(-22.0, -5.0, mvPosition.z) * (1.0 - smoothstep(-2.0, 2.0, mvPosition.z));

    gl_PointSize = scale * (120.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const bubbleFragmentShader = `
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;

    float ring = smoothstep(0.5, 0.34, r) - smoothstep(0.34, 0.2, r);
    float core = smoothstep(0.34, 0.0, r);
    float alpha = (ring * 0.50 + core * 0.12) * vAlpha;

    vec3 col = mix(vec3(0.70, 0.94, 0.98), vec3(0.94, 1.0, 1.0), ring);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.30));
}
`;

function OceanSurface() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color('#0b3a49') },
        uColorShallow: { value: new THREE.Color('#5acfd9') },
    }), []);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime() * 0.85;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                vertexShader={waveVertexShader}
                fragmentShader={waveFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

function OceanBubbles() {
    const count = 100;
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, scales, speeds, seeds } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const sp = new Float32Array(count);
        const sd = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 20;
            p[i * 3 + 1] = (Math.random() - 0.5) * 14;
            p[i * 3 + 2] = -Math.random() * 12 - 1.2;
            s[i] = Math.random() * 2.0 + 0.8;
            sp[i] = Math.random() * 0.9 + 0.5;
            sd[i] = Math.random();
        }

        return { positions: p, scales: s, speeds: sp, seeds: sd };
    }, [count]);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
                <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-seed" args={[seeds, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={bubbleVertexShader}
                fragmentShader={bubbleFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function OceanBackdrop() {
    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#041116]" />

            <div className="fixed inset-0 pointer-events-none z-1">
                <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
                    <color attach="background" args={['#041116']} />
                    <OceanSurface />
                    <OceanBubbles />
                </Canvas>
            </div>

            <div
                className="fixed inset-0 pointer-events-none z-2"
                style={{
                    background: 'radial-gradient(circle at 20% 18%, rgba(120, 247, 225, 0.10) 0%, rgba(120, 247, 225, 0.02) 20%, transparent 42%), radial-gradient(circle at 78% 20%, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.02) 24%, transparent 46%), linear-gradient(180deg, rgba(7,33,42,0.35) 0%, rgba(4,17,22,0.28) 45%, rgba(2,10,14,0.62) 100%)',
                }}
            />

            <motion.div
                className="fixed inset-0 pointer-events-none z-2 opacity-40"
                animate={{ opacity: [0.24, 0.46, 0.24], x: ['-3%', '2%', '-3%'] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    background: 'radial-gradient(ellipse 44% 26% at 18% 28%, rgba(170, 246, 255, 0.20) 0%, rgba(170, 246, 255, 0.06) 40%, rgba(170,246,255,0.0) 100%), radial-gradient(ellipse 40% 24% at 74% 36%, rgba(137, 227, 255, 0.18) 0%, rgba(137, 227, 255, 0.05) 42%, rgba(137,227,255,0.0) 100%)',
                }}
            />

            <motion.div
                className="fixed inset-0 pointer-events-none z-2 opacity-50"
                animate={{ backgroundPosition: ['0px 0px', '96px -52px', '0px 0px'] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                style={{
                    background: 'repeating-linear-gradient(165deg, rgba(255,255,255,0.00) 0px, rgba(255,255,255,0.00) 34px, rgba(135, 245, 229, 0.035) 35px, rgba(135, 245, 229, 0.00) 64px)',
                }}
            />

            {bubbleSpecs.map((bubble, index) => (
                <motion.div
                    key={index}
                    className="fixed pointer-events-none z-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
                    style={{
                        left: bubble.left,
                        top: bubble.top,
                        width: bubble.size,
                        height: bubble.size,
                        boxShadow: 'inset 0 0 18px rgba(255,255,255,0.12), 0 0 24px rgba(94,234,212,0.08)',
                    }}
                    animate={{
                        y: [-6, -34, -6],
                        x: [0, 6, -4, 0],
                        opacity: [0.22, 0.48, 0.18],
                    }}
                    transition={{
                        duration: bubble.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: bubble.delay,
                    }}
                />
            ))}

            {fishSpecs.map((fish, index) => (
                <motion.div
                    key={index}
                    className="fixed pointer-events-none z-2"
                    style={{ left: fish.left, top: fish.top, width: fish.width }}
                    animate={{ x: [0, 36, 0], y: [0, -10, 0], opacity: [0.10, 0.18, 0.10] }}
                    transition={{ duration: fish.duration, repeat: Infinity, ease: 'easeInOut', delay: fish.delay }}
                >
                    <div className="relative h-6 w-full">
                        <div className="absolute left-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-linear-to-r from-teal-200/0 via-teal-200/20 to-cyan-100/10" style={{ width: fish.width }} />
                        <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-y-transparent border-l-14 border-l-cyan-100/10" />
                    </div>
                </motion.div>
            ))}

            <div
                className="fixed inset-x-0 bottom-0 h-[32vh] pointer-events-none z-2"
                style={{
                    background: 'linear-gradient(to top, rgba(2,10,14,0.94) 0%, rgba(4,17,22,0.74) 42%, rgba(4,17,22,0) 100%)',
                }}
            />
        </>
    );
}

export default function DenshouoPage() {
    const router = useRouter();
    const { setActiveWork } = useStore();

    const handleReturn = () => {
        setActiveWork(null);
        router.push('/');
    };

    return (
        <main className="relative min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.12),transparent_35%),#041116] text-white overflow-x-hidden">
            <OceanBackdrop />

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#ecfeff] hover:text-teal-200 transition-colors group">
                    <span className="w-6 h-px bg-[#ecfeff] group-hover:bg-teal-200 transition-colors" />
                    RETURN TO ORBIT
                </button>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
                <div className="text-center mb-20">
                    <motion.div
                        className="mx-auto mb-10 h-28 w-28 rounded-full border border-teal-200/20 bg-white/5 backdrop-blur-xl shadow-[0_0_80px_rgba(45,212,191,0.18)] flex items-center justify-center"
                        initial={{ opacity: 0, y: 18, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="relative h-12 w-20">
                            <div className="absolute inset-y-1 left-0 right-3 rounded-full bg-linear-to-r from-teal-200/80 via-cyan-100/70 to-sky-100/35 shadow-[0_0_24px_rgba(165,243,252,0.25)]" />
                            <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-12 border-y-transparent border-l-18 border-l-cyan-100/50" />
                            <div className="absolute left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-900/55" />
                        </div>
                    </motion.div>
                    <span className="inline-block border border-teal-300/30 bg-teal-300/10 text-teal-200 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8">
                        REACT / SUPABASE
                    </span>
                    <img
                        src="/denshouo-logo.png"
                        alt="でんしょうお ロゴ"
                        className="w-full max-w-lg md:max-w-2xl mx-auto"
                    />
                    <p className="mt-6 text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        つぶやくほどでもない小さな幸せを魚に乗せて流し、みんなでゆるく分かち合う SNS。
                    </p>
                    <p className="mt-4 text-sm md:text-base text-teal-200/80 font-mono">
                        2025.10.07 公開 / 2025.10.11 更新 / 技育CAMP Vol.10 優秀賞
                    </p>
                </div>

                <div className="space-y-10">
                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-6 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            01 / OVERVIEW
                        </h2>
                        <p className="text-gray-200 leading-relaxed text-base md:text-lg">
                            小さな幸せをおさかなに乗せて流し、時間が経つとどこかへ泳いでいく、気軽さ重視の投稿体験を目指したアプリです。
                            「気兼ねなく流せること」と「ちょっとした幸せを誰かと分かち合えること」を中心に設計しました。
                        </p>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            02 / CONCEPT
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">SMALL HAPPINESS</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    大げさな発信ではなく、日常の小さな幸せを軽く流せることを重視。時間経過で投稿が流れていくため、心理的ハードルを下げています。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">LIGHT AND SHADOW</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    幸せだけでなく、少しダークな感情も含めて海に流せる世界観を持たせ、単なるメモアプリではない情緒を加えました。
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            03 / TECHNICAL NOTES
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">FRONTEND</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    React、TypeScript、Vite、Tailwind CSS を中心に構築。魚ごとのコンポーネント管理を行い、時間が足りない場面では CSS アニメーションも併用して完成度を優先しました。
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">BACKEND / DB</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    ハッカソン開発での学習コストと速度を考慮し、バックエンドとデータベースを兼ねられる Supabase を採用。定期実行ジョブを使い、時間差でデータが消える仕様も実現しました。
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">React</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vite</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Supabase</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vercel</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            04 / DEVELOPMENT CONTEXT
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            2025 年の技育CAMP Vol.10 にて開発。チームメンバーは全員 1 回生で、使う技術の多くが初挑戦という状態からスタートしました。
                            その中で、学習コストと実装速度のバランスを取りながら形にし、優秀賞を受賞したプロジェクトです。
                        </p>
                    </section>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://oikomi-front.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-teal-300/50 text-teal-200 font-mono text-sm bg-teal-300/10 hover:bg-teal-300/20 transition-colors"
                        >
                            OPEN APP
                        </a>
                        <a
                            href="https://x.com/geek_pjt/status/1954474531743232383?t=03zVZf-zya95vP3PMc1VOQ&s=19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-white/15 text-gray-300 font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            RELATED LINK
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}