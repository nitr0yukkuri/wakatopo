'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// === シェーダー定義 (空間の雨パーティクル用) ===
const particleVertexShader = `
uniform float uTime;
attribute float scale;
varying float vAlpha;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 激しく降下
    mvPosition.y -= mod(uTime * 30.0 * scale, 100.0) - 50.0;
    
    // 風の影響で斜めに降る
    mvPosition.x += (uTime * 5.0) * scale;
    
    // カメラに近づくほどフェードイン、近すぎるとフェードアウト
    vAlpha = smoothstep(-60.0, -10.0, mvPosition.z) * (1.0 - smoothstep(-5.0, 2.0, mvPosition.z));
    
    // 奥に行くほど小さく、細長くする
    gl_PointSize = scale * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying float vAlpha;
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    // 雨粒らしく、縦にシャープな線にするためのブレンド
    if (dist > 0.5) discard;
    
    float alpha = (1.0 - (dist * 2.0)) * vAlpha;
    // やや暗めの青白い色（大粒の雨）
    gl_FragColor = vec4(0.5, 0.7, 0.9, alpha * 0.4);
}
`;

function RainParticles() {
    const count = 2000;
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
            s[i] = Math.random() * 0.5 + 0.2; // Snowより長細い想定だがPointSizeでざっくり調整
        }
        return { positions: p, scales: s };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
        // カメラに向かって少し前進させる（顔に雨が当たるような感覚）
        meshRef.current.position.z += 0.2;
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

export default function RainTransitionCanvas() {
    return (
        <div className="w-full h-full bg-gradient-to-b from-[#1c2331] to-[#3a4759]">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <RainParticles />
            </Canvas>
        </div>
    );
}
