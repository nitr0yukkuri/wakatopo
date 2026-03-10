'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AscendingClouds() {
    const count = 300;
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // 雲の初期配置
    const { positions, randoms, scales } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const rnd = new Float32Array(count);
        const scl = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // X, Zはカメラの周囲にランダム配置、Yは上空に向かって配置
            const x = (Math.random() - 0.5) * 40;
            const y = Math.random() * 100 - 20; // -20 から 80 までの高さ
            const z = (Math.random() - 0.5) * 40 - 10;

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            rnd[i] = Math.random();
            scl[i] = 1.0 + Math.random() * 4.0; // 雲の大きさ
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
            dummy.scale.set(s, s * 0.6, s); // 少し平べったい形

            // ランダムに少し回転させる
            dummy.rotation.x = Math.random() * Math.PI;
            dummy.rotation.y = Math.random() * Math.PI;
            dummy.rotation.z = Math.random() * Math.PI;

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions, scales, count]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // --- 上昇エフェクトのイージング ---
        const progress = Math.min(time / 2.0, 1.0);
        // ゆっくり始まり、一気に加速して突き抜ける (Expo In)
        const ease = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10);

        const fallSpeed = 5.0 + ease * 150.0; // 雲が落ちてくる速度（自分が上昇しているように見える）

        const dummy = new THREE.Object3D();

        for (let i = 0; i < count; i++) {
            let y = positions[i * 3 + 1];
            y -= fallSpeed * delta; // 雲を下に移動させる = カメラが上昇

            // カメラより下に行ったら、上空にリセット
            if (y < -20) {
                // 加速中はリセットする高さを変えてより長く見せる
                y = 100 + Math.random() * 50;

                // XYも再計算してバラけさせる
                positions[i * 3] = (Math.random() - 0.5) * 40;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
            }
            positions[i * 3 + 1] = y;

            dummy.position.set(positions[i * 3], y, positions[i * 3 + 2]);

            const s = scales[i];
            // 雲が近づくにつれて少し膨らむような動き
            const dynamicScale = s * (1.0 + Math.sin(time * 2.0 + randoms[i] * Math.PI * 2) * 0.1);
            dummy.scale.set(dynamicScale, dynamicScale * 0.6, dynamicScale);

            dummy.rotation.x = time * 0.1 * randoms[i];
            dummy.rotation.y = time * 0.2 * randoms[i];

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.15}
                blending={THREE.AdditiveBlending}
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
        const progress = Math.min(time / 2.0, 1.0);

        // 最後につれて画面全体が白く(または水色に)フェードアウト
        const ease = Math.pow(progress, 4);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = ease;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#d4f1f9" transparent opacity={0} depthWrite={false} />
        </mesh>
    );
}

export default function CloudAscentCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#0e1c26']} />
            <fog attach="fog" args={['#0e1c26', 10, 40]} />

            <AscendingClouds />
            <SkyFade />
        </Canvas>
    );
}
