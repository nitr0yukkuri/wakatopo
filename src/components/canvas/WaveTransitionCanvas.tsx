'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { waveVertexShader, waveFragmentShader } from '@/shaders/wave';

const bubbleVertexShader = `
uniform float uTime;
attribute float scale;
attribute float speed;
attribute float seed;
varying float vAlpha;

void main() {
    vec3 pos = position;
    float rise = mod(uTime * speed + seed * 18.0, 28.0) - 14.0;
    pos.y += rise;
    pos.x += sin(uTime * 0.7 + seed * 8.0) * 0.25;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vAlpha = smoothstep(-25.0, -6.0, mvPosition.z) * (1.0 - smoothstep(-3.0, 3.0, mvPosition.z));

    gl_PointSize = scale * (130.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const bubbleFragmentShader = `
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;

    float ring = smoothstep(0.5, 0.34, r) - smoothstep(0.34, 0.22, r);
    float glow = smoothstep(0.42, 0.0, r);
    float alpha = (ring * 0.55 + glow * 0.16) * vAlpha;

    vec3 col = mix(vec3(0.74, 0.94, 0.98), vec3(0.95, 1.0, 1.0), ring);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.34));
}
`;

function AcousticWave() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color('#0b3a49') },
        uColorShallow: { value: new THREE.Color('#53c8d2') }
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]}>
            {/* Extremely large plane to cover screen regardless of aspect ratio */}
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

function BubbleLayer() {
    const count = 140;
    const ref = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, scales, speeds, seeds } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const sp = new Float32Array(count);
        const sd = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 22;
            p[i * 3 + 1] = (Math.random() - 0.5) * 16;
            p[i * 3 + 2] = -Math.random() * 13 - 1.4;
            s[i] = Math.random() * 2.2 + 0.8;
            sp[i] = Math.random() * 1.1 + 0.55;
            sd[i] = Math.random();
        }

        return { positions: p, scales: s, speeds: sp, seeds: sd };
    }, [count]);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <points ref={ref}>
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

export default function WaveTransitionCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#041116']} />
            <AcousticWave />
            <BubbleLayer />
        </Canvas>
    );
}
