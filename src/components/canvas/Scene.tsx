'use client'

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useProgress } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import AbstractCore from './AbstractCore';
import Weather from './Weather';
import { Suspense } from 'react';

function SceneReadySignal({ onReady }: { onReady?: () => void }) {
    const { active, progress, total } = useProgress();
    const firedRef = useRef(false);

    useEffect(() => {
        if (!onReady || firedRef.current) return;
        if (active || (total > 0 && progress < 100)) return;

        let raf1 = 0;
        let raf2 = 0;
        firedRef.current = true;

        // Wait two frames so the first loaded scene frame is painted before hiding loader.
        raf1 = window.requestAnimationFrame(() => {
            raf2 = window.requestAnimationFrame(() => {
                onReady();
            });
        });

        return () => {
            if (raf1) window.cancelAnimationFrame(raf1);
            if (raf2) window.cancelAnimationFrame(raf2);
        };
    }, [active, onReady, progress, total]);

    return null;
}

function CameraRotator({ isMobile }: { isMobile: boolean }) {
    useFrame(({ camera, clock }) => {
        // OrbitControlsの autoRotateSpeed={0.8} と同じ角速度（約0.0837 rad/s）
        const t = clock.getElapsedTime() * 0.0837;
        const radius = isMobile ? 9.2 : 8; // カメラの距離

        camera.position.x = Math.sin(t) * radius;
        camera.position.z = Math.cos(t) * radius;
        camera.lookAt(0, 0, 0); // 常に中心の惑星を向く
    });
    return null;
}

export default function Scene({ onSceneReady }: { onSceneReady?: () => void }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 768);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return (
        <div className="absolute inset-0 z-0 bg-black pointer-events-none lg:pointer-events-auto">
            <Canvas
                camera={{ position: [0, 0, isMobile ? 9.2 : 8], fov: isMobile ? 42 : 35 }}
                dpr={isMobile ? [1, 1] : [1, 1.25]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                performance={{ min: 0.7, debounce: 300 }}
            >
                <SceneReadySignal onReady={onSceneReady} />
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

                    <hemisphereLight args={['#b8d8ff', '#080808', 0.18]} />

                    {/* Bloom エフェクト: 発光をより劇的に */}
                    <EffectComposer multisampling={isMobile ? 0 : 8}>
                        <Bloom
                            intensity={0.8}
                            luminanceThreshold={0.3}
                            luminanceSmoothing={0.4}
                            mipmapBlur={!isMobile}
                        />
                    </EffectComposer>

                    {/* OrbitControlsを削除し、純粋なカメラの周回処理に変更 */}
                    <CameraRotator isMobile={isMobile} />
                </Suspense>
            </Canvas>
        </div>
    );
}
