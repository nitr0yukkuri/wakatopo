'use client'

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';

// 流星（Shooting Stars / Meteors）コンポーネント
function Meteors({ count = 15 }) {
    const linesRef = useRef<THREE.LineSegments>(null);

    // Lineの始点と終点を生成
    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 6); // 各線分につき2頂点 (x,y,z) * 2
        const vel = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // かなり遠方からスポーンさせる
            const x = (Math.random() - 0.5) * 60;
            const y = (Math.random() - 0.5) * 60 + 20; // 少し上から降り注ぐ感じ
            const z = -20 - Math.random() * 50;

            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;

            // 彗星の尾の長さ
            pos[i * 6 + 3] = x - 2;
            pos[i * 6 + 4] = y + 2;
            pos[i * 6 + 5] = z - 8;

            vel[i * 3] = 0.5 + Math.random() * 1.5;   // dx
            vel[i * 3 + 1] = -0.5 - Math.random() * 1.5; // dy (下に向かって)
            vel[i * 3 + 2] = 2.0 + Math.random() * 4.0;  // dz (奥から手前へ)
        }
        return { positions: pos, velocities: vel };
    }, [count]);

    useFrame(() => {
        if (!linesRef.current) return;
        const posAttribute = linesRef.current.geometry.attributes.position;
        const pos = posAttribute.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const vx = velocities[i * 3];
            const vy = velocities[i * 3 + 1];
            const vz = velocities[i * 3 + 2];

            // 線全体を移動
            pos[i * 6] += vx;
            pos[i * 6 + 1] += vy;
            pos[i * 6 + 2] += vz;

            pos[i * 6 + 3] += vx;
            pos[i * 6 + 4] += vy;
            pos[i * 6 + 5] += vz;

            // 画面外に飛び去ったら奥にリセット
            if (pos[i * 6 + 2] > 20 || pos[i * 6 + 1] < -30) {
                const startX = (Math.random() - 0.5) * 60;
                const startY = (Math.random() - 0.5) * 60 + 30;
                const startZ = -30 - Math.random() * 60;

                pos[i * 6] = startX;
                pos[i * 6 + 1] = startY;
                pos[i * 6 + 2] = startZ;

                pos[i * 6 + 3] = startX - 2;
                pos[i * 6 + 4] = startY + 2;
                pos[i * 6 + 5] = startZ - 8;
            }
        }
        posAttribute.needsUpdate = true;
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </lineSegments>
    );
}

export default function RealisticPlanetScene() {
    return (
        <div className="absolute inset-0 z-0 bg-black">
            <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#020202']} />
                    <fog attach="fog" args={['#020202', 5, 25]} />

                    <Planet />

                    {/* 流星群 */}
                    <Meteors count={30} />

                    {/* 無数の星屑 */}
                    <Stars radius={100} depth={50} count={4000} factor={3} saturation={0} fade speed={1} />

                    {/* 背景光 */}
                    <Environment preset="city" environmentIntensity={0.1} />

                    {/* マウスで少しだけ視点を動かせるようにする */}
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
                </Suspense>
            </Canvas>
        </div>
    );
}
