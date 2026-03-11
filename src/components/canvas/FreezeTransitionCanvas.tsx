'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { freezeVertexShader, freezeFragmentShader } from '@/shaders/freeze';

function FreezingEffect() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        // Navy/Ice Blue
        uColor1: { value: new THREE.Color('#0f172a') },
        // Frost White / Cyan tint
        uColor2: { value: new THREE.Color('#e0f2fe') }
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]}>
            <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
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
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full pointer-events-none">
            <FreezingEffect />
        </Canvas>
    );
}
