'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { waveVertexShader, waveFragmentShader } from '@/shaders/wave';

function AcousticWave() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        // Cyber cyan color
        uColor: { value: new THREE.Color('#00ffff') }
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

export default function WaveTransitionCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#000000']} />
            <AcousticWave />
        </Canvas>
    );
}
