'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// === シェーダー定義 (空間の柔らかな雪用) ===
const particleVertexShader = `
uniform float uTime;
attribute float scale;
varying float vAlpha;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // ゆっくり降下
    mvPosition.y -= mod(uTime * 5.0 * scale, 100.0) - 50.0;
    
    // 風の影響で左右に揺れる（しんしんと降る）
    mvPosition.x += sin(uTime * 0.5 + position.y) * 4.0 * scale;
    
    // カメラに近づくほどフェードイン、近すぎるとフェードアウト
    vAlpha = smoothstep(-60.0, -10.0, mvPosition.z) * (1.0 - smoothstep(-5.0, 2.0, mvPosition.z));
    
    // 奥に行くほど小さく
    gl_PointSize = scale * (250.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying float vAlpha;
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    // ふわっとした丸い雪
    if (dist > 0.5) discard;
    
    // エッジを非常に柔らかくするぼかし
    float alpha = pow((1.0 - (dist * 2.0)), 1.5) * vAlpha;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.6); // ピュアホワイト
}
`;

function GentleSnowParticles() {
    const count = 1500;
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
            p[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
            s[i] = Math.random() * 0.8 + 0.5; // 少し大きめのふわふわ
        }
        return { positions: p, scales: s };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
        // ゆっくり前へ
        meshRef.current.position.z += 0.05;
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

export default function SnowTransitionCanvas() {
    return (
        <div className="w-full h-full bg-gradient-to-b from-[#d1e6eb] to-[#f4fbfc]">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <GentleSnowParticles />
            </Canvas>
        </div>
    );
}
