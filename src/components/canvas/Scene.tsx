'use client'

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import AbstractCore from './AbstractCore';
import Weather from './Weather';
import { Suspense } from 'react';

export default function Scene({ onSceneReady }: { onSceneReady?: () => void }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 768);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (!onSceneReady) return;

        // Wait two frames so the first planet frame is actually painted.
        let raf1 = 0;
        let raf2 = 0;
        raf1 = window.requestAnimationFrame(() => {
            raf2 = window.requestAnimationFrame(() => {
                onSceneReady();
            });
        });

        return () => {
            if (raf1) window.cancelAnimationFrame(raf1);
            if (raf2) window.cancelAnimationFrame(raf2);
        };
    }, [onSceneReady]);

    return (
        <div className="absolute inset-0 z-0 bg-black pointer-events-none md:pointer-events-auto">
            <Canvas
                camera={{ position: [0, 0, isMobile ? 9.2 : 8], fov: isMobile ? 42 : 35 }}
                dpr={[1, 1.25]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                performance={{ min: 0.7, debounce: 300 }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#050505']} />

                    {/* 奥を暗黒に溶け込ませるフォグ（インポート不要） */}
                    <fog attach="fog" args={['#050505', 3, 12]} />

                    <ambientLight intensity={0.1} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

                    <AbstractCore />
                    <Weather />

                    {/* 星の密度を調整 */}
                    <Stars radius={100} depth={50} count={640} factor={1.5} saturation={0} fade speed={0.35} />

                    <Environment preset="city" environmentIntensity={0.18} />

                    {/* Bloom エフェクト: 発光をより劇的に */}
                    <EffectComposer multisampling={8}>
                        <Bloom
                            intensity={0.8}
                            luminanceThreshold={0.3}
                            luminanceSmoothing={0.4}
                            mipmapBlur
                        />
                    </EffectComposer>

                    {/* スクロールを妨害しないよう、手動回転(enableRotate)のみ無効化 */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={false}
                        autoRotate
                        autoRotateSpeed={0.8}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
