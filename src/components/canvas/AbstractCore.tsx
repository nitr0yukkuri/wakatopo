'use client'

import { useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';
import { useCoreInteraction } from './abstractCore/useCoreInteraction';
import { useCoreParticles } from './abstractCore/useCoreParticles';
import { useCoreAnimation } from './abstractCore/useCoreAnimation';

export default function AbstractCore() {
    const { size } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const wireframe2Ref = useRef<THREE.Mesh>(null);

    const isMobile = size.width < 768;
    const { githubActivityLevel, weather } = useStore();
    const { hovered, active, hitPointRef, pointerHandlers } = useCoreInteraction();
    const particleState = useCoreParticles();

    useCoreAnimation({
        weather,
        githubActivityLevel,
        hovered,
        active,
        hitPointRef,
        meshRef,
        innerRef,
        particlesRef,
        ring1Ref,
        ring2Ref,
        wireframe2Ref,
        particleState,
    });

    return (
        <group scale={isMobile ? 0.56 : 1}>
            <mesh {...pointerHandlers}>
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.0} depthWrite={false} />
            </mesh>

            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.6, 2]} />
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={wireframe2Ref} scale={0.9}>
                <icosahedronGeometry args={[1.5, 3]} />
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0.1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={innerRef} scale={0.88}>
                <icosahedronGeometry args={[1.6, 2]} />
                <meshBasicMaterial
                    color="#0088ff"
                    transparent
                    opacity={0.05}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={ring1Ref} rotation={[-Math.PI / 2.5, Math.PI / 8, 0]}>
                <torusGeometry args={[2.5, 0.002, 16, 128]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            <mesh ref={ring2Ref} rotation={[-Math.PI / 2.2, -Math.PI / 10, 0]}>
                <torusGeometry args={[3.0, 0.005, 16, 128]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[particleState.positions, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.025}
                    color="#00ffff"
                    transparent
                    opacity={0.85}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        </group>
    );
}
