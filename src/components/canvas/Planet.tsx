'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/planet';
import { useStore } from '@/store';

export default function Planet() {
    const meshRef = useRef<THREE.Mesh>(null);
    const starRef = useRef<THREE.Points>(null);
    const { githubActivityLevel, weather, activeWorkId } = useStore();

    const starCount = 500;
    const starPositions = useMemo(() => {
        const positions = new Float32Array(starCount * 3);
        const range = 100;
        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * range;
            positions[i * 3 + 1] = (Math.random() - 0.5) * range;
            positions[i * 3 + 2] = -50 + Math.random() * 100;
        }
        return positions;
    }, []);

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

        if (activeWorkId === '01' && starRef.current) {
            const positions = starRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                positions[i * 3 + 2] += 2.5; // Move stars VERY fast towards camera (Warp Speed)
                if (positions[i * 3 + 2] > 50) {
                    positions[i * 3 + 2] = -100;
                }
            }
            starRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group>
            {activeWorkId === '01' && (
                <points ref={starRef}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
                    </bufferGeometry>
                    <pointsMaterial size={0.15} color="#ffffff" transparent opacity={0.6} sizeAttenuation={true} />
                </points>
            )}
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