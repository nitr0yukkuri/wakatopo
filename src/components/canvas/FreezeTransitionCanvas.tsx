'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import { freezeFragmentShader, freezeVertexShader } from '@/shaders/freeze';

const pseudoRandom = (index: number, salt: number) => {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453123;
    return value - Math.floor(value);
};

const traceVertexShader = `
uniform float uTime;
attribute float scale;
attribute vec3 randomRotation;
varying float vAlpha;
varying vec3 vRotation;
varying float vDepth;

void main() {
    vRotation = randomRotation;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float phase = randomRotation.x * 6.28318;

    mvPosition.x += sin(uTime * 0.28 + phase) * 1.2 * scale;
    mvPosition.y += sin(uTime * 0.34 + phase) * 0.9 * scale;
    mvPosition.z += cos(uTime * 0.22 + phase) * 0.7 * scale;

    vAlpha = smoothstep(-80.0, -20.0, mvPosition.z) * (1.0 - smoothstep(-5.0, 5.0, mvPosition.z));
    vDepth = clamp((-mvPosition.z - 3.0) / 32.0, 0.0, 1.0);
    gl_PointSize = scale * (280.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const traceFragmentShader = `
varying float vAlpha;
varying vec3 vRotation;
varying float vDepth;

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
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
    vec2 uv = rotate2d(vRotation.z * 6.28318) * (gl_PointCoord - vec2(0.5));

    float aspect = 0.62 + vRotation.x * 0.24;
    vec2 halfSize = vec2(0.24 * aspect, 0.18);
    float d = roundedBox(uv, halfSize, 0.025);
    float bevel = roundedBox(uv, halfSize * 0.82, 0.018);
    if (d > 0.003) discard;

    vec2 n2d = clamp(uv / max(halfSize, 0.001), -1.0, 1.0);
    float nz = sqrt(max(0.0, 1.0 - n2d.x * n2d.x * 0.58 - n2d.y * n2d.y * 0.58));
    vec3 normal = normalize(vec3(n2d.x * 0.72, n2d.y * 0.72, nz));

    vec3 lightDir = normalize(vec3(-0.55, 0.88, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    vec3 halfVec = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float specular = pow(max(dot(normal, halfVec), 0.0), 72.0);

    float edgeDist = 1.0 - smoothstep(-0.045, 0.004, d);
    float innerBevel = 1.0 - smoothstep(-0.035, 0.018, bevel);
    float crackA = lineMask(uv, vec2(-0.20, -0.16), vec2(0.17, 0.12), 0.006);
    float crackB = lineMask(uv, vec2(-0.16, 0.15), vec2(0.20, -0.06), 0.004);
    float cracks = max(crackA * 0.42, crackB * 0.34);

    vec3 iceBody = mix(vec3(0.70, 0.90, 0.98), vec3(0.35, 0.62, 0.78), length(n2d) * 0.75);
    vec3 deepTint = mix(vec3(0.25, 0.54, 0.70), vec3(0.84, 0.97, 1.0), diffuse * 0.5 + 0.2);
    vec3 lit = mix(iceBody, deepTint, innerBevel * 0.35);

    lit *= 0.28 + diffuse * 0.42;
    lit += vec3(0.96, 0.99, 1.0) * specular * 0.95;
    lit += vec3(0.82, 0.93, 1.0) * edgeDist * 0.28;
    lit += vec3(0.78, 0.90, 0.98) * cracks * 0.18;

    float baseTrans = mix(0.025, 0.075, vDepth);
    float detectionPulse = 0.64 + 0.36 * sin(vRotation.x * 18.0);
    float alpha = (baseTrans + edgeDist * 0.15 + innerBevel * 0.06 + cracks * 0.08 + specular * 0.10) * vAlpha * detectionPulse;

    gl_FragColor = vec4(lit, clamp(alpha, 0.0, 0.32));
}
`;

function SensorTraceParticles() {
    const meshRef = useRef<THREE.Points>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, rotations, scales } = useMemo(() => {
        const count = 220;
        const p = new Float32Array(count * 3);
        const r = new Float32Array(count * 3);
        const s = new Float32Array(count);

        for (let i = 0; i < count; i += 1) {
            const band = pseudoRandom(i, 1) < 0.58 ? 1 : -1;
            p[i * 3] = (pseudoRandom(i, 2) - 0.5) * 86;
            p[i * 3 + 1] = (pseudoRandom(i, 3) - 0.5) * 46 + band * 10;
            p[i * 3 + 2] = (pseudoRandom(i, 4) - 0.5) * 78 - 22;
            r[i * 3] = pseudoRandom(i, 5);
            r[i * 3 + 1] = pseudoRandom(i, 6);
            r[i * 3 + 2] = pseudoRandom(i, 7) * Math.PI * 2;
            s[i] = pseudoRandom(i, 8) * 4.2 + 1.8;
        }

        return { positions: p, rotations: r, scales: s };
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = state.clock.getElapsedTime();
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = elapsed;
        }
        meshRef.current.position.z += elapsed < 1 ? 0.006 : 0.006 + (elapsed - 1) * 0.012;
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-randomRotation" args={[rotations, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                vertexShader={traceVertexShader}
                fragmentShader={traceFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                depthTest
                blending={THREE.NormalBlending}
            />
        </points>
    );
}

function ThermalScanField({ startDelay }: { startDelay: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const startTimeRef = useRef<number | null>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#03111d') },
        uColor2: { value: new THREE.Color('#d8f7ff') },
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const elapsed = state.clock.getElapsedTime();

        if (startTimeRef.current === null) {
            if (elapsed < startDelay) {
                if (materialRef.current) {
                    materialRef.current.uniforms.uTime.value = -1;
                }
                return;
            }
            startTimeRef.current = elapsed;
        }

        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = elapsed - startTimeRef.current;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -4]}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={freezeVertexShader}
                fragmentShader={freezeFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

function AnalysisHud() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                className="absolute left-0 top-0 h-full w-[2px] bg-cyan-100/70 shadow-[0_0_18px_rgba(165,243,252,0.8)]"
                initial={{ x: '14vw', opacity: 0 }}
                animate={{ x: ['14vw', '50vw', '86vw'], opacity: [0, 0.85, 0] }}
                transition={{ duration: 1.45, ease: 'easeInOut' }}
            />

            <motion.div
                className="absolute inset-x-[12%] top-[29%] h-px bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: [0, 1, 0.78], opacity: [0, 0.75, 0.2] }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
            />

            <motion.svg
                className="absolute left-[9%] top-[36%] h-28 w-[82%] opacity-70"
                viewBox="0 0 900 120"
                preserveAspectRatio="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.72, 0.2] }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
            >
                <path
                    d="M0 70 C45 46 82 94 128 64 S205 54 250 70 S330 88 384 58 S470 38 530 64 S620 94 690 56 S802 54 900 70"
                    fill="none"
                    stroke="rgba(165,243,252,0.62)"
                    strokeWidth="1.4"
                />
                <path
                    d="M0 78 C58 74 86 52 146 76 S230 99 300 72 S402 44 470 78 S575 102 640 70 S760 50 900 76"
                    fill="none"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="0.8"
                />
            </motion.svg>

            <motion.div
                className="absolute left-[10%] top-[18%] font-mono text-[10px] tracking-[0.24em] text-cyan-100/70"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 1, 0.45], y: 0 }}
                transition={{ duration: 1.4, delay: 0.18 }}
            >
                INTERNAL SCAN / ACOUSTIC SIGNAL
            </motion.div>
            <motion.div
                className="absolute right-[10%] bottom-[18%] font-mono text-[10px] tracking-[0.24em] text-cyan-100/65"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: [0, 1, 0.35], y: 0 }}
                transition={{ duration: 1.35, delay: 0.82 }}
            >
                ICE MASS DETECTED / THERMAL MODEL
            </motion.div>
        </div>
    );
}

export default function FreezeTransitionCanvas() {
    const [showReflection, setShowReflection] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setShowReflection(true), 1500);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div
            className="relative h-full w-full overflow-hidden pointer-events-none"
            style={{
                background: [
                    'radial-gradient(ellipse 38% 82% at 50% 48%, rgba(72,147,176,0.16) 0%, rgba(14,44,66,0.10) 38%, rgba(1,6,12,0) 68%)',
                    'linear-gradient(to bottom, #01050a 0%, #04121d 48%, #01060c 100%)',
                ].join(', '),
            }}
        >
            <Canvas camera={{ position: [0, 0, 10], fov: 65 }}>
                <SensorTraceParticles />
                <ThermalScanField startDelay={0.65} />
            </Canvas>

            <AnalysisHud />

            <AnimatePresence>
                {showReflection && (
                    <motion.div
                        key="ice-reflection"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(118deg, rgba(255,255,255,0) 0%, rgba(218,249,255,0) 36%, rgba(232,252,255,0.42) 48%, rgba(148,219,241,0.16) 56%, rgba(255,255,255,0) 100%)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.75, 0.18] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.64, ease: 'easeOut' }}
                    />
                )}
            </AnimatePresence>

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: [
                        'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 28%, rgba(132,205,255,0.06) 72%, rgba(217,246,255,0.18) 100%)',
                        'linear-gradient(90deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 100%)',
                    ].join(', '),
                    backgroundSize: '100% 100%, 64px 100%',
                }}
            />
        </div>
    );
}
