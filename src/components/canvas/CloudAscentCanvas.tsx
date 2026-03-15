'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cloudVertexShader, cloudFragmentShader } from '@/shaders/cloud';
import { sunVertexShader, sunFragmentShader } from '@/shaders/sun';

function Sun() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();
    const isMobile = size.width < 768;
    const sunScale = isMobile ? 24 : 40;
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSunColor: { value: new THREE.Color('#f8dfad') },
        uRayColor: { value: new THREE.Color('#f8f1dc') }
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;

        const progress = Math.min(time / 2.4, 1.0);
        const easeOut = 1.0 - Math.pow(1.0 - progress, 3.0);
        const yPos = -18 + (easeOut * 16);
        const xPos = Math.sin(time * 0.25) * 0.35;

        meshRef.current.position.y = yPos;
        meshRef.current.position.x = xPos;
    });

    return (
        <mesh ref={meshRef} position={[0, -18, -58]} scale={[sunScale, sunScale, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={sunVertexShader}
                fragmentShader={sunFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

function AscendingClouds() {
    const count = 150;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const { positions, randoms, scales } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const rnd = new Float32Array(count);
        const scl = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = Math.random() * 100 - 20;
            const z = (Math.random() - 0.5) * 60 - 20;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            rnd[i] = Math.random();
            scl[i] = 5.0 + Math.random() * 10.0;
        }
        return { positions: pos, randoms: rnd, scales: scl };
    }, []);

    useMemo(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            const s = scales[i];

            dummy.scale.set(s, s, 1);
            dummy.rotation.set(0, 0, 0);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions, scales, count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color('#fdfefe') },
        uOutlineColor: { value: new THREE.Color('#b7c7d6') }
    }), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;

        const progress = Math.min(time / 2.6, 1.0);
        const ease = 1.0 - Math.pow(1.0 - progress, 2.0);
        const fallSpeed = 12.0 + ease * 58.0;
        const forwardSpeed = 7.0 + ease * 22.0;

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            let y = positions[i * 3 + 1];
            let z = positions[i * 3 + 2];

            y -= fallSpeed * delta;
            z += forwardSpeed * delta;

            if (y < -40 || z > 5) {
                y = 60 + Math.random() * 40;
                z = -50 - Math.random() * 20;
                positions[i * 3] = (Math.random() - 0.5) * 100;
            }
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            dummy.position.set(positions[i * 3], y, z);

            const s = scales[i];
            const depthScale = Math.max(0.2, (z + 60) / 60);
            const dynamicScale = s * depthScale * (1.0 + Math.sin(time * 2.0 + randoms[i] * Math.PI * 2) * 0.05);
            const driftRotation = Math.sin(time * 1.2 + randoms[i] * Math.PI * 2) * 0.06;

            dummy.scale.set(dynamicScale, dynamicScale, 1);
            dummy.rotation.set(0, 0, driftRotation);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={cloudVertexShader}
                fragmentShader={cloudFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </instancedMesh>
    );
}

function SkyFade() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        const progress = Math.min(time / 2.5, 1.0);

        const ease = Math.pow(progress, 4);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = ease;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#edf3f7" transparent opacity={0} depthWrite={false} />
        </mesh>
    );
}

export default function CloudAscentCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#c8d8e6']} />

            <Sun />
            <AscendingClouds />
            <SkyFade />
        </Canvas>
    );
}
