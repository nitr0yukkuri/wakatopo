'use client'

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';
import Meteors from './Meteors';

export default function RealisticPlanetScene() {
    return (
        <div className="absolute inset-0 z-0 bg-black">
            {/* 少し奥に引いて全体を小さめに表示 */}
            <Canvas camera={{ position: [0, 0, 10], fov: 42 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#020202']} />
                    <fog attach="fog" args={['#020202', 10, 35]} />

                    {/* 中央配置（オフセット解除） */}
                    <group scale={1.0}>
                        <Planet />
                    </group>

                    {/* アニメーション付きの新しい流星群 */}
                    <Meteors />

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
