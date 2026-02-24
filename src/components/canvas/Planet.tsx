'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/planet';
import { useStore } from '@/store';

export default function Planet() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { githubActivityLevel, weather } = useStore();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uActivity: { value: 0 },
            uIntro: { value: 0 },
            uColorA: { value: new THREE.Color('#ffffff') }, // ベースは白
            uColorB: { value: new THREE.Color('#00ffff') }, // 鋭いシアン
        }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        const time = state.clock.getElapsedTime();

        material.uniforms.uTime.value = time;
        material.uniforms.uIntro.value = THREE.MathUtils.lerp(material.uniforms.uIntro.value, 1.0, 0.03);
        material.uniforms.uActivity.value = THREE.MathUtils.lerp(material.uniforms.uActivity.value, githubActivityLevel, 0.05);

        const targetColor = weather === 'Rain' ? '#ffffff' : '#00ffff';
        material.uniforms.uColorB.value.lerp(new THREE.Color(targetColor), 0.05);

        meshRef.current.rotation.y = time * 0.1;
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 128, 128]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            {/* インナーコア */}
            <mesh scale={0.98}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}