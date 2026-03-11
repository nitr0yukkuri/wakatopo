'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { freezeVertexShader, freezeFragmentShader } from '@/shaders/freeze';

const blizzardVertexShader = `
uniform float uTime;
attribute float scale;
varying float vAlpha;
void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    mvPosition.z += mod(uTime * 150.0 * scale, 200.0) - 100.0;
    mvPosition.y -= mod(uTime * 60.0 * scale, 100.0) - 50.0;
    mvPosition.x += sin(uTime * 2.0 + position.y) * 5.0; // Violent wind
    vAlpha = 1.0;
    gl_PointSize = scale * (200.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const blizzardFragmentShader = `
varying float vAlpha;
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - (dist * 2.0)) * vAlpha;
    gl_FragColor = vec4(0.8, 0.95, 1.0, alpha * 0.8);
}
`;

function TransitionBlizzard() {
    const count = 1000;
    const meshRef = useRef<THREE.Points>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 }
    }), []);

    const { positions, scales } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 150;
            p[i * 3 + 1] = (Math.random() - 0.5) * 150;
            p[i * 3 + 2] = (Math.random() - 0.5) * -200;
            s[i] = Math.random() * 2.0 + 1.0;
        }
        return { positions: p, scales: s };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={blizzardVertexShader}
                fragmentShader={blizzardFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function FreezingEffect() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color('#020b16') },
        uColor2: { value: new THREE.Color('#e0f2fe') }
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
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

export default function FreezeTransitionCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }} className="w-full h-full pointer-events-none">
            <TransitionBlizzard />
            <FreezingEffect />
        </Canvas>
    );
}
