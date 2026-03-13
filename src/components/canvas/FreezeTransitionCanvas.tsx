'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { freezeVertexShader, freezeFragmentShader } from '@/shaders/freeze';

// =============================
// Phase 1: 奥から漂ってくる氷の塊（水筒の中の氷イメージ）
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

    // 上から降ってくる
    float phase = randomRotation.x * 6.28;
    mvPosition.y -= mod(uTime * 1.5 * scale * 0.5, 120.0) - 60.0;
    mvPosition.x += sin(uTime * 0.4 + phase) * 3.0 * scale;
    mvPosition.z += cos(uTime * 0.3 + phase) * 1.0 * scale;
    
    vAlpha = smoothstep(-80.0, -20.0, mvPosition.z) * (1.0 - smoothstep(-5.0, 5.0, mvPosition.z));
    gl_PointSize = scale * (450.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const iceFragmentShader = `
varying float vAlpha;
varying vec3 vRotation;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

// SDF: 角丸長方形
float roundedBox(vec2 uv, vec2 halfSize, float radius) {
    vec2 q = abs(uv) - halfSize + vec2(radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void main() {
    // ランダムな回転
    vec2 uv = rotate2d(vRotation.z * 6.28) * (gl_PointCoord - vec2(0.5));
    
    // ランダムなアスペクト比（正方形〜縦長）
    float aspect = 0.75 + vRotation.x * 0.5;
    vec2 halfSize = vec2(0.33 * aspect, 0.33);
    float radius = 0.04; // 軽くだけ丸める（氷らしい鋭さ）
    
    float d = roundedBox(uv, halfSize, radius);
    if (d > 0.005) discard;

    // ===================================================
    // 3D風ライティング（Point Spriteのまま立体感を出す）
    // ===================================================
    
    // UV を -1〜1 に正規化して「面の法線」を擬似計算
    vec2 n2d = uv / max(halfSize, 0.001);  // -1〜+1 の範囲
    n2d = clamp(n2d, -1.0, 1.0);
    
    // Z成分を球面っぽく追加して3D法線を擬似的に作る
    float nz = sqrt(max(0.0, 1.0 - n2d.x * n2d.x * 0.5 - n2d.y * n2d.y * 0.5));
    vec3 normal = normalize(vec3(n2d.x * 0.6, n2d.y * 0.6, nz));
    
    // 光の方向（左上から斜め）
    vec3 lightDir = normalize(vec3(-0.6, 0.8, 1.0));
    
    // ディフューズ（拡散光）
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    // スペキュラー（鏡面光）— Blinn-Phong
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfVec), 0.0), 40.0);
    
    // ===================================================
    // 氷の色の構成
    // ===================================================
    
    // 本体色：深い氷のシアン〜青（濁りのある氷の内部）
    vec3 iceBody = mix(vec3(0.62, 0.84, 0.97), vec3(0.55, 0.78, 0.95), length(n2d) * 0.5);
    
    // ライティング適用
    vec3 lit = iceBody * (0.35 + diffuse * 0.5);
    
    // スペキュラーハイライト（白い光）
    lit += vec3(0.95, 0.98, 1.0) * specular * 1.5;
    
    // エッジの霜（全反射）
    float edgeDist = 1.0 - smoothstep(-0.06, 0.005, d);
    lit += vec3(0.85, 0.95, 1.0) * edgeDist * 0.5;
    
    // ===================================================
    // 透明度：中心はスケスケ、エッジと面は見え方に差をつける
    // ===================================================
    float baseTrans = 0.22;                                // 中心の透明度
    float edgeSolid = edgeDist * 0.45;                    // エッジで少し不透明に
    float specContrib = specular * 0.4;                   // ハイライト部分は白く
    float finalAlpha = (baseTrans + edgeSolid + specContrib) * vAlpha;
    
    gl_FragColor = vec4(lit, clamp(finalAlpha, 0.0, 0.92));
}
`;

function IceChunkParticles() {
    const count = 600; // 少なくして一個一個を大きく見せる
    const meshRef = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, scales, rotations } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const r = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100;
            p[i * 3 + 1] = (Math.random() - 0.5) * 100;
            p[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
            s[i] = Math.random() * 6.0 + 3.0; // 大きく
            r[i * 3] = Math.random();
            r[i * 3 + 1] = Math.random();
            r[i * 3 + 2] = Math.random() * Math.PI * 2;
        }
        return { positions: p, scales: s, rotations: r };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
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
                blending={THREE.NormalBlending}
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
                <IceChunkParticles />
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
