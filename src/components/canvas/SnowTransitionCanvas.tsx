'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// === シェーダー定義 (氷の破片/クリスタル用) ===
const particleVertexShader = `
uniform float uTime;
attribute float scale;
attribute vec3 randomRotation;
varying float vAlpha;
varying vec2 vUv;
varying vec3 vRotation;

void main() {
    vUv = uv;
    vRotation = randomRotation;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 非常にゆっくりと漂う（吹雪ではなく、静寂の氷）
    mvPosition.y -= mod(uTime * 1.5 * scale, 100.0) - 50.0;
    
    // 回転しながら少しだけ左右に揺れる
    mvPosition.x += sin(uTime * 0.2 + position.y) * 2.0 * scale;
    
    // カメラに近づくほどフェードイン、近すぎるとフェードアウト
    vAlpha = smoothstep(-80.0, -20.0, mvPosition.z) * (1.0 - smoothstep(-10.0, 5.0, mvPosition.z));
    
    // 鋭い破片を表現するためサイズを調整
    gl_PointSize = scale * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const particleFragmentShader = `
varying float vAlpha;
varying vec3 vRotation;

// 擬似的な回転行列（2D）
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

// ひし形（氷の結晶）を生成する関数
float sharpDiamond(vec2 st) {
    vec2 pos = vec2(0.5) - st;
    return smoothstep(0.45, 0.5, 1.0 - (abs(pos.x) + abs(pos.y)));
}

void main() {
    // 頂点ごとのランダムな回転を適用
    vec2 rotatedCoord = vec2(0.5) + rotate2d(vRotation.z * 10.0) * (gl_PointCoord - vec2(0.5));
    
    // ひし形のマスクを生成
    float shape = sharpDiamond(rotatedCoord);
    
    if (shape < 0.1) discard;
    
    // 氷のようなシャープな輝き（中心が明るく、エッジが鋭い）
    float dist = length(rotatedCoord - vec2(0.5));
    float glow = exp(-dist * 4.0);
    
    // ピュアなブルー〜シアン系の氷の色
    vec3 iceColor = mix(vec3(0.5, 0.9, 1.0), vec3(0.9, 0.95, 1.0), glow);
    
    gl_FragColor = vec4(iceColor, shape * vAlpha * glow * 1.5);
}
`;

function IceShardParticles() {
    const count = 800; // 雪より数を減らして一つ一つの結晶を際立たせる
    const meshRef = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), []);

    const { positions, scales, rotations } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const r = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            p[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
            s[i] = Math.random() * 1.5 + 0.5; // サイズにばらつき

            // ランダムな初期回転
            r[i * 3] = Math.random() * Math.PI;
            r[i * 3 + 1] = Math.random() * Math.PI;
            r[i * 3 + 2] = Math.random() * Math.PI;
        }
        return { positions: p, scales: s, rotations: r };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
        // 非常にゆっくりとカメラが氷の世界へ進んでいく
        meshRef.current.position.z += 0.02;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
                {/* カスタム属性としてランダムな回転値を渡す */}
                <bufferAttribute attach="attributes-randomRotation" args={[rotations, 3]} />
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
        // デイタイムの雪空から、深い氷の世界（深海のようなブルー）へ
        <div className="w-full h-full bg-gradient-to-b from-[#020b16] via-[#081b33] to-[#020b16]">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <IceShardParticles />
            </Canvas>
        </div>
    );
}
