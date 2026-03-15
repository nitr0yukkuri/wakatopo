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
varying float vDepth;

void main() {
    vRotation = randomRotation;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 上から降ってくる
    float phase = randomRotation.x * 6.28;
    mvPosition.y -= mod(uTime * 1.5 * scale * 0.5, 120.0) - 60.0;
    mvPosition.x += sin(uTime * 0.4 + phase) * 3.0 * scale;
    mvPosition.z += cos(uTime * 0.3 + phase) * 1.0 * scale;
    
    vAlpha = smoothstep(-80.0, -20.0, mvPosition.z) * (1.0 - smoothstep(-5.0, 5.0, mvPosition.z));
    vDepth = clamp((-mvPosition.z - 3.0) / 32.0, 0.0, 1.0);
    gl_PointSize = scale * (450.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const iceFragmentShader = `
varying float vAlpha;
varying vec3 vRotation;
varying float vDepth;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}

float roundedBox(vec2 uv, vec2 halfSize, float radius) {
    vec2 q = abs(uv) - halfSize + vec2(radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float lineMask(vec2 uv, vec2 a, vec2 b, float width) {
    vec2 pa = uv - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return 1.0 - smoothstep(width, width + 0.015, length(pa - ba * h));
}

void main() {
    vec2 uv = rotate2d(vRotation.z * 6.28) * (gl_PointCoord - vec2(0.5));
    
    float aspect = 0.86 + vRotation.x * 0.28;
    vec2 halfSize = vec2(0.32 * aspect, 0.32);
    float radius = 0.05;
    
    float d = roundedBox(uv, halfSize, radius);
    float bevel = roundedBox(uv, halfSize * 0.82, 0.035);
    if (d > 0.003) discard;

    vec2 n2d = uv / max(halfSize, 0.001);
    n2d = clamp(n2d, -1.0, 1.0);
    
    float nz = sqrt(max(0.0, 1.0 - n2d.x * n2d.x * 0.58 - n2d.y * n2d.y * 0.58));
    vec3 normal = normalize(vec3(n2d.x * 0.72, n2d.y * 0.72, nz));
    
    vec3 lightDir = normalize(vec3(-0.55, 0.88, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVec = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfVec), 0.0), 60.0);
    float specularTight = pow(max(dot(normal, halfVec), 0.0), 120.0);

    float edgeDist = 1.0 - smoothstep(-0.045, 0.004, d);
    float innerBevel = 1.0 - smoothstep(-0.035, 0.018, bevel);
    float crackA = lineMask(uv, vec2(-0.22, -0.26), vec2(0.18, 0.24), 0.011);
    float crackB = lineMask(uv, vec2(-0.10, 0.28), vec2(0.26, -0.08), 0.008);
    float crackC = lineMask(uv, vec2(-0.28, 0.04), vec2(0.04, 0.10), 0.006);
    float cracks = max(crackA * 0.65, max(crackB * 0.5, crackC * 0.35));
    float bubbles = smoothstep(0.82, 1.0, sin((uv.x + vRotation.x) * 36.0) * sin((uv.y + vRotation.y) * 31.0));
    bubbles *= smoothstep(0.32, 0.0, length(uv - vec2(0.04, -0.03)));

    vec3 iceBody = mix(vec3(0.78, 0.91, 0.99), vec3(0.58, 0.78, 0.93), length(n2d) * 0.75);
    vec3 deepTint = mix(vec3(0.56, 0.77, 0.92), vec3(0.85, 0.95, 1.0), diffuse * 0.5 + 0.2);
    
    vec3 lit = mix(iceBody, deepTint, innerBevel * 0.35);
    lit *= 0.34 + diffuse * 0.42;
    
    lit += vec3(0.96, 0.99, 1.0) * specular * 1.2;
    lit += vec3(1.0) * specularTight * 0.55;
    
    lit += vec3(0.82, 0.93, 1.0) * edgeDist * 0.34;
    lit += vec3(0.78, 0.90, 0.98) * cracks * 0.22;
    lit += vec3(0.98, 0.99, 1.0) * bubbles * 0.12;
    
    float baseTrans = mix(0.06, 0.13, vDepth);
    float edgeSolid = edgeDist * 0.20;
    float innerSolid = innerBevel * 0.08;
    float crackSolid = cracks * 0.10;
    float specContrib = specular * 0.12 + specularTight * 0.10;
    float finalAlpha = (baseTrans + edgeSolid + innerSolid + crackSolid + specContrib) * vAlpha;
    
    gl_FragColor = vec4(lit, clamp(finalAlpha, 0.0, 0.46));
}
`;

function IceChunkParticles() {
    const count = 420;
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
            s[i] = Math.random() * 7.5 + 4.0;
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
        const speed = t < 1.0 ? 0.025 : 0.025 + (t - 1.0) * 0.032;
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
                depthTest={true}
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
            style={{ background: 'linear-gradient(to bottom, #01060c 0%, #07192a 48%, #01060c 100%)' }}>

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
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.92) 0%, rgba(214,240,255,0.70) 30%, rgba(170,220,255,0.22) 62%, rgba(255,255,255,0.0) 100%)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0.38] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>

            {/* 氷の霜（エッジに薄い水色のビネット） */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 34%, rgba(132,205,255,0.08) 72%, rgba(180,232,255,0.22) 100%)',
            }} />
        </div>
    );
}
