'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// ==================
// 月グロー（exp減衰・円の辺縁なし）
// ==================
const moonGlowFragmentShader = `
uniform float uOpacity;
varying vec2 vUv;

void main() {
    vec2 uv = vUv - vec2(0.5);
    float d = length(uv) * 2.0; // 0=中心, 1=端
    float radialMask = smoothstep(1.0, 0.82, d);
    float glow = exp(-d * 3.2) * radialMask * uOpacity;
    if (glow < 0.002) discard;
    gl_FragColor = vec4(0.52, 0.72, 0.96, glow * 0.55);
}
`;

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

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 st) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(st); st *= 2.1; a *= 0.5; }
    return v;
}

void main() {
    vec2 uv = vUv - vec2(0.5);
    float d = length(uv);

    // 月の縁：シャープにクリップ
    if (d > 0.490) discard;
    float body = smoothstep(0.490, 0.484, d);

    // 三日月：影円を大きくオフセット → 右側に細い光の弧だけ残す
    float shadowD = length(uv - vec2(0.27, 0.03));
    // 境界を極薄くして、くっきりした昼夜境界線にする
    float lit = smoothstep(0.455, 0.468, shadowD);

    // 月面テクスチャ
    float surface = fbm(uv * 6.0 + vec2(2.3, 1.7));
    float crater  = noise(uv * 16.0) * 0.5 + noise(uv * 38.0) * 0.25;
    float tex = 1.0 - (surface * 0.14 + crater * 0.06);

    // 照射面カラー
    float centreBright = smoothstep(0.490, 0.0, d);
    vec3 litColor = mix(
        vec3(0.72, 0.82, 0.96),
        vec3(0.97, 0.97, 1.00),
        centreBright * 0.8
    ) * tex;

    // ターミネーター細ライン（shadowDがちょうど境界付近だけ光る極細線、リムは除去）
    float termLine = (1.0 - smoothstep(0.0, 0.010, abs(shadowD - 0.461)));
    litColor += vec3(0.65, 0.85, 1.00) * termLine * 0.55;

    // アースシャイン：影側にごく薄い青
    float earthshine = (1.0 - lit) * smoothstep(0.490, 0.05, d);
    vec3 earthshineCol = vec3(0.10, 0.18, 0.40) * earthshine * 0.12;

    vec3 finalColor = litColor + earthshineCol;

    // 影側はほぼ透明、lit面のみ不透明
    float alpha = body * (lit + (1.0 - lit) * 0.04);

    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
}
`;

function Moon() {
    const moonRef   = useRef<THREE.Mesh>(null);
    const glowRef   = useRef<THREE.Mesh>(null);
    const glowUniforms = useMemo(() => ({ uOpacity: { value: 0 } }), []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const y = Math.min(-8.0 + t * 5.0, 1.6);
        const progress = Math.min(t / 1.6, 1.0);

        if (moonRef.current) moonRef.current.position.y = y;
        if (glowRef.current) {
            glowRef.current.position.y = y;
            const pulse = 1.0 + Math.sin(t * 1.2) * 0.05;
            glowUniforms.uOpacity.value = progress * 0.92 * pulse;
        }
    });

    return (
        <>
            {/* グロー：exp減衰で辺縁なし、月本体の後ろに置く */}
            <mesh ref={glowRef} position={[0.5, -8, -2]}>
                <planeGeometry args={[12.0, 12.0]} />
                <shaderMaterial
                    vertexShader={moonVertexShader}
                    fragmentShader={moonGlowFragmentShader}
                    uniforms={glowUniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            {/* 月本体（クレセントシェーダー） */}
            <mesh ref={moonRef} position={[0.5, -8, -1]}>
                <planeGeometry args={[3.6, 3.6]} />
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
        const p = new Float32Array(count * 3);
        const sp = new Float32Array(count);
        const sz = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 52;
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
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-twinkleSpeed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-starSize" args={[sizes, 1]} />
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
