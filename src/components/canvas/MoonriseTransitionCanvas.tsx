'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// ==================
// 月（クレセントシェーダー）
// ==================
const moonVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const moonFragmentShader = `
varying vec2 vUv;

void main() {
    vec2 uv = vUv - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    // 影でクレセントを表現（ずらした円の外側だけを照らす）
    float shadowD = length(uv - vec2(0.14, 0.10));
    float lit = smoothstep(0.22, 0.36, shadowD);

    // 明るい月面色（青白い月光、縁が淡く光る）
    float edge = smoothstep(0.5, 0.30, d);
    vec3 moonCol = mix(vec3(0.80, 0.88, 0.98), vec3(0.97, 0.98, 1.0), edge);

    // 影側は完全に透明にする（黒にしない）
    float alpha = smoothstep(0.5, 0.42, d) * lit;
    gl_FragColor = vec4(moonCol, alpha);
}
`;

function Moon() {
    const moonRef    = useRef<THREE.Mesh>(null);
    const glowInRef  = useRef<THREE.Mesh>(null);
    const glowOutRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // スクリーン下から徐々に上昇
        const y = Math.min(-8.0 + t * 5.0, 1.6);
        const progress = Math.min(t / 1.6, 1.0);

        if (moonRef.current)    moonRef.current.position.y    = y;
        if (glowInRef.current) {
            glowInRef.current.position.y = y;
            (glowInRef.current.material as THREE.MeshBasicMaterial).opacity = progress * 0.30;
        }
        if (glowOutRef.current) {
            glowOutRef.current.position.y = y;
            (glowOutRef.current.material as THREE.MeshBasicMaterial).opacity = progress * 0.13;
        }
    });

    return (
        <>
            {/* 外側ハレーション */}
            <mesh ref={glowOutRef} position={[0.5, -8, -3]}>
                <circleGeometry args={[6.2, 64]} />
                <meshBasicMaterial color="#6a9ed4" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* 内側グロー */}
            <mesh ref={glowInRef} position={[0.5, -8, -2]}>
                <circleGeometry args={[3.0, 64]} />
                <meshBasicMaterial color="#a6c6ee" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            {/* 月本体（クレセントシェーダー） */}
            <mesh ref={moonRef} position={[0.5, -8, -1]}>
                <planeGeometry args={[3.2, 3.2]} />
                <shaderMaterial
                    vertexShader={moonVertexShader}
                    fragmentShader={moonFragmentShader}
                    transparent
                    depthWrite={false}
                />
            </mesh>
        </>
    );
}

// ==================
// 瞬く星
// ==================
const starVertexShader = `
uniform float uTime;
attribute float twinkleSpeed;
attribute float starSize;
varying float vAlpha;

void main() {
    float t = sin(uTime * twinkleSpeed + position.x * 13.7 + position.y * 9.3) * 0.4 + 0.6;
    vAlpha = t;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = starSize * (220.0 / max(0.1, -mvPos.z));
    gl_Position = projectionMatrix * mvPos;
}
`;

const starFragmentShader = `
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - d * 2.0) * (1.0 - d * 2.0) * vAlpha;
    gl_FragColor = vec4(0.88, 0.93, 1.0, a * 0.85);
}
`;

function StarField() {
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
    const count = 280;

    const { positions, speeds, sizes } = useMemo(() => {
        const p  = new Float32Array(count * 3);
        const sp = new Float32Array(count);
        const sz = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3]     = (Math.random() - 0.5) * 52;
            p[i * 3 + 1] = (Math.random() - 0.5) * 36;
            p[i * 3 + 2] = -8 - Math.random() * 18;
            sp[i] = Math.random() * 2.5 + 0.8;
            sz[i] = Math.random() * 1.8 + 0.4;
        }
        return { positions: p, speeds: sp, sizes: sz };
    }, []);

    useFrame((state) => { uniforms.uTime.value = state.clock.getElapsedTime(); });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position"    args={[positions, 3]} />
                <bufferAttribute attach="attributes-twinkleSpeed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-starSize"    args={[sizes, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={starVertexShader}
                fragmentShader={starFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

// ==================
// メイン
// ==================
export default function MoonriseTransitionCanvas() {
    return (
        <div
            className="w-full h-full pointer-events-none relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom, #010208 0%, #01060f 55%, #040e1a 100%)' }}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <StarField />
                <Moon />
            </Canvas>

            {/* 月明かりの大気グロー */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2.0, ease: 'easeIn' }}
                style={{
                    background: 'radial-gradient(ellipse 70% 50% at 53% 54%, rgba(120,180,240,0.08) 0%, rgba(70,120,210,0.03) 45%, transparent 72%)',
                }}
            />
        </div>
    );
}
