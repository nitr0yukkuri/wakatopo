'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense } from 'react';
import AbstractCore from '@/components/canvas/AbstractCore';
import Weather from '@/components/canvas/Weather';
import type { WeatherType } from '@/store';

function CardCameraRig() {
    useFrame(({ camera, clock }) => {
        const t = clock.getElapsedTime() * 0.065;
        camera.position.x = Math.sin(t) * 6.4;
        camera.position.y = Math.sin(t * 0.7) * 0.22;
        camera.position.z = Math.cos(t) * 6.4;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

export default function CardScene({
    weather,
    activityLevel,
    showBackgroundStars = true,
}: {
    weather: WeatherType;
    activityLevel: number;
    showBackgroundStars?: boolean;
}) {
    return (
        <Canvas
            camera={{ position: [0, 0, 6.4], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            performance={{ min: 0.8, debounce: 250 }}
        >
            <Suspense fallback={null}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 3, 12]} />
                <ambientLight intensity={0.1} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

                <group scale={1.08} position={[0, 0.02, 0]}>
                    <AbstractCore weatherOverride={weather} activityOverride={activityLevel} />
                </group>

                <Weather weatherOverride={weather} />

                <Stars radius={100} depth={50} count={showBackgroundStars ? 640 : 0} factor={1.5} saturation={0} fade speed={0.35} />

                <EffectComposer multisampling={8}>
                    <Bloom
                        intensity={0.8}
                        luminanceThreshold={0.3}
                        luminanceSmoothing={0.4}
                        mipmapBlur
                    />
                </EffectComposer>

                <CardCameraRig />
            </Suspense>
        </Canvas>
    );
}
