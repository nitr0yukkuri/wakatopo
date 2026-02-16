'use client'

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import Planet from './Planet';
import Weather from './Weather';
import { Suspense } from 'react';

export default function Scene() {
    return (
        <div className="absolute inset-0 z-0 bg-black pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#050505']} />

                    {/* 奥を暗黒に溶け込ませるフォグ（インポート不要） */}
                    <fog attach="fog" args={['#050505', 5, 20]} />

                    <ambientLight intensity={0.1} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

                    <Planet />
                    <Weather />

                    {/* 星の密度を調整 */}
                    <Stars radius={100} depth={50} count={2000} factor={2} saturation={0} fade speed={0.5} />

                    <Environment preset="city" environmentIntensity={0.3} />

                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
                </Suspense>
            </Canvas>
        </div>
    );
}