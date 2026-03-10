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
        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;

        // 太陽が下から昇ってくる演出
        // time=0 の時は y=-20 (画面下部)、そこからスッと上がって中央付近でゆっくりになる
        const progress = Math.min(time / 2.0, 1.0);
        const yPos = -20 + (Math.pow(progress, 0.5) * 45); // easeOut風に上に昇る

        meshRef.current.position.y = yPos;
    });

    return (
        <mesh ref={meshRef} position={[0, -20, -50]} scale={[50, 50, 1]}>
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
    const count = 150; // 少し数を増やしてリッチに
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // 雲の初期配置
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

    // InstancedMeshの初期化
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
        uBaseColor: { value: new THREE.Color('#ffffff') },
        uOutlineColor: { value: new THREE.Color('#98adc2') }
    }), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();
        uniforms.uTime.value = time;

        // --- 強烈な上昇感の演出 ---
        const progress = Math.min(time / 2.5, 1.0);
        const ease = progress * progress; // 二次曲線で加速する

        // 下方向への猛烈なスピード ＋ 手前(Z方向)へのスピードを合わせて「斜め上へ突き抜ける」立体感を出す
        const fallSpeed = 10.0 + ease * 80.0;
        const forwardSpeed = 5.0 + ease * 30.0;

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            let y = positions[i * 3 + 1];
            let z = positions[i * 3 + 2];

            y -= fallSpeed * delta;
            z += forwardSpeed * delta;

            // 画面の下(y<-40) または カメラの後ろ(z>5) に突き抜けたら上空の奥にリセット
            if (y < -40 || z > 5) {
                y = 60 + Math.random() * 40; // 遥か上空
                z = -50 - Math.random() * 20; // 遥か奥
                positions[i * 3] = (Math.random() - 0.5) * 100;
            }
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            dummy.position.set(positions[i * 3], y, z);

            const s = scales[i];
            // 手前に来る(Zが大きくなる)ほど大きく見える錯覚を強調（遠近法エンハンス）
            const depthScale = Math.max(0.2, (z + 60) / 60);
            // 雲のふわふわアニメーション
            const dynamicScale = s * depthScale * (1.0 + Math.sin(time * 2.0 + randoms[i] * Math.PI * 2) * 0.05);

            dummy.scale.set(dynamicScale, dynamicScale, 1);
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
        const progress = Math.min(time / 2.5, 1.0);

        // 最後に一気に白くフェードアウトしてページ遷移へ繋ぐ
        const ease = Math.pow(progress, 4);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = ease;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
    );
}

export default function CloudAscentCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#aee1f9']} />

            <Sun />
            <AscendingClouds />
            <SkyFade />
        </Canvas>
    );
}
