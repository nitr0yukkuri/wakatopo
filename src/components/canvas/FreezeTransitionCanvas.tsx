'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { freezeVertexShader, freezeFragmentShader } from '@/shaders/freeze';

// =============================
// Phase 1: 奥から飛んでくる氷の結晶
// =============================
const iceVertexShader = `
uniform float uTime;
attribute float scale;
attribute vec3 randomRotation;
varying float vAlpha;
varying vec3 vRotation;

void main() {
    vRotation = randomRotation;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 少しゆっくり目に降る
    mvPosition.y -= mod(uTime * 3.0 * scale, 150.0) - 75.0;
    mvPosition.x += sin(uTime * 0.3 + position.y * 0.5) * 1.5 * scale;
    
    vAlpha = smoothstep(-100.0, -25.0, mvPosition.z) * (1.0 - smoothstep(-8.0, 5.0, mvPosition.z));
    gl_PointSize = scale * (400.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const iceFragmentShader = `
varying float vAlpha;
varying vec3 vRotation;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle), sin(_angle),cos(_angle));
}

float sharpDiamond(vec2 st) {
    vec2 pos = vec2(0.5) - st;
    return smoothstep(0.46, 0.5, 1.0 - (abs(pos.x) + abs(pos.y)));
}

void main() {
    vec2 rotatedCoord = vec2(0.5) + rotate2d(vRotation.z * 15.0) * (gl_PointCoord - vec2(0.5));
    float shape = sharpDiamond(rotatedCoord);
    if (shape < 0.08) discard;
    
    float dist = length(rotatedCoord - vec2(0.5));
    float glow = exp(-dist * 4.5);
    
    // より鮮やかな氷の色（白に近い輝き）
    vec3 iceColor = mix(vec3(0.5, 0.9, 1.0), vec3(1.0, 1.0, 1.0), glow * 0.8);
    gl_FragColor = vec4(iceColor, shape * vAlpha * glow * 2.0);
}
`;

function IceShardParticles() {
    const count = 1500;
    const meshRef = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, scales, rotations } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const r = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 120;
            p[i * 3 + 1] = (Math.random() - 0.5) * 120;
            p[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
            s[i] = Math.random() * 2.5 + 0.5;
            r[i * 3] = Math.random() * Math.PI;
            r[i * 3 + 1] = Math.random() * Math.PI;
            r[i * 3 + 2] = Math.random() * Math.PI;
        }
        return { positions: p, scales: s, rotations: r };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
        // 最初はゆっくり、後半は急加速してカメラに迫る感じ
        const t = state.clock.getElapsedTime();
        const speed = t < 1.0 ? 0.03 : 0.03 + (t - 1.0) * 0.04;
        meshRef.current.position.z += speed;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
                <bufferAttribute attach="attributes-randomRotation" args={[rotations, 3]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={iceVertexShader}
                fragmentShader={iceFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// =============================
// Phase 2: フリーズシェーダー（画面を氷で覆う）
// =============================
function FreezingEffect({ startDelay }: { startDelay: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTimeRef = useRef<number | null>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#020b16') },
        uColor2: { value: new THREE.Color('#a8e4f8') },
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = state.clock.getElapsedTime();
        if (startTimeRef.current === null) {
            // startDelay秒後に開始
            if (elapsed >= startDelay) {
                startTimeRef.current = elapsed;
            } else {
                uniforms.uTime.value = -1; // まだ表示しない
                return;
            }
        }
        uniforms.uTime.value = elapsed - startTimeRef.current;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -4]}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                vertexShader={freezeVertexShader}
                fragmentShader={freezeFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

// =============================
// メインコンポーネント
// =============================
export default function FreezeTransitionCanvas() {
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        // 1.5秒後に白いフラッシュを表示（フリーズが画面を覆い切るタイミング）
        const t = setTimeout(() => setShowFlash(true), 1500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="w-full h-full pointer-events-none relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #020b16 0%, #051a30 50%, #020b16 100%)' }}>

            {/* Phase1: 氷の結晶パーティクル / Phase2: フリーズシェーダー */}
            <Canvas camera={{ position: [0, 0, 10], fov: 65 }}>
                <IceShardParticles />
                {/* 0.8秒後にフリーズシェーダーが起動 */}
                <FreezingEffect startDelay={0.8} />
            </Canvas>

            {/* Phase3: 最後の白フラッシュ（氷の世界へ突入する瞬間） */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        key="ice-flash"
                        className="absolute inset-0 bg-white pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.95, 0.6] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>

            {/* 氷の霜（エッジに薄い水色のビネット） */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(100,200,255,0.12) 80%, rgba(150,220,255,0.35) 100%)',
            }} />
        </div>
    );
}
