'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cloudVertexShader, cloudFragmentShader } from '@/shaders/cloud';
import { sunVertexShader, sunFragmentShader } from '@/shaders/sun';

function Sun() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSunColor: { value: new THREE.Color('#ffb03a') }, // Cute orange/yellow
        uRayColor: { value: new THREE.Color('#ffd166') }  // Lighter orange/yellow for rays
    }), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <mesh ref={meshRef} position={[0, 5, -40]} scale={[30, 30, 1]}>
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
    const count = 120; // Reduced count because 2D planes cover more space and look better sparse
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // 雲の初期配置
    const { positions, randoms, scales } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const rnd = new Float32Array(count);
        const scl = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Screen-space like distribution
            const x = (Math.random() - 0.5) * 80;
            const y = Math.random() * 80 - 40;
            // Keep Z fairly tight so they layer nicely in front of the sun
            const z = (Math.random() - 0.5) * 20 - 10;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            rnd[i] = Math.random();
            // Scale reduced significantly from 12+8 to 4+6 for smaller, cuter clouds
            scl[i] = 4.0 + Math.random() * 6.0;
        }
        return { positions: pos, randoms: rnd, scales: scl };
    }, []);

    // InstancedMeshの初期化
    useMemo(() => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            const s = scales[i];

            // Planes need to be scaled symmetrically, shape is handled in shader
            dummy.scale.set(s, s, 1);

            // No rotation! Kept flat to the camera for 2D illustration look
            dummy.rotation.set(0, 0, 0);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions, scales, count]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color('#ffffff') },       // 基本の白
        uOutlineColor: { value: new THREE.Color('#98adc2') }     // アニメ・イラスト調のフチ（落ち着いたグレーブルー）
    }), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;

        // --- 超ゆったりした動き ---
        // 激しい加速をやめ、一定の気持ち良い速度で流れ続ける
        // "上に昇っている" 感じを強くするため、少し速度にグラデーションをつける
        const fallSpeed = 5.0 + Math.min(time * 1.5, 10.0); // 5 から最大 15 くらいまでの速度

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            let y = positions[i * 3 + 1];
            y -= fallSpeed * delta;

            // 画面外（カメラの後ろ）に行ったら上空にリセット（ループ）
            if (y < -30) {
                y = 50 + Math.random() * 30; // 遥か上空に再配置
                positions[i * 3] = (Math.random() - 0.5) * 80;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
            }
            positions[i * 3 + 1] = y;

            dummy.position.set(positions[i * 3], y, positions[i * 3 + 2]);

            const s = scales[i];
            // 雲がふわふわと大きさを変える動き (これも非常にゆっくり)
            const dynamicScale = s * (1.0 + Math.sin(time * 0.5 + randoms[i] * Math.PI * 2) * 0.05);
            dummy.scale.set(dynamicScale, dynamicScale, 1);

            // No rotation
            dummy.rotation.set(0, 0, 0);

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
        const progress = Math.min(time / 4.0, 1.0); // ゆっくりとしたフェードアウト

        // 最後につれて画面全体が白く(または淡い色に)フェードアウト
        const ease = Math.pow(progress, 3);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = ease;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#e0f4fc" transparent opacity={0} depthWrite={false} />
        </mesh>
    );
}

export default function CloudAscentCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#aee1f9']} /> {/* より明るくポップな青空背景 */}

            <Sun />
            <AscendingClouds />
            <SkyFade />
        </Canvas>
    );
}
