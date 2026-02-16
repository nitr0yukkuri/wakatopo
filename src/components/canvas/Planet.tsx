'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/planet';
import { useStore } from '@/store';

export default function Planet() {
    // Meshの型を指定（materialが含まれる）
    const meshRef = useRef<THREE.Mesh>(null);
    const { githubActivityLevel, weather } = useStore();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uActivity: { value: 0 },
            uColorA: { value: new THREE.Color('#1e293b') },
            uColorB: { value: new THREE.Color('#38bdf8') },
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current) return;

        // 【修正ポイント】ここで material を ShaderMaterial として扱う
        const material = meshRef.current.material as THREE.ShaderMaterial;

        const { clock } = state;
        material.uniforms.uTime.value = clock.getElapsedTime();

        material.uniforms.uActivity.value = THREE.MathUtils.lerp(
            material.uniforms.uActivity.value,
            githubActivityLevel,
            0.05
        );

        const targetColor = weather === 'Rain' ? '#64748b' : '#38bdf8';
        material.uniforms.uColorB.value.lerp(new THREE.Color(targetColor), 0.05);

        meshRef.current.rotation.y += 0.002;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[2, 64, 64]} />
            {/* @ts-ignore */}
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                wireframe={false}
            />
        </mesh>
    );
}