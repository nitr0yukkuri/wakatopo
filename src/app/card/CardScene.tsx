'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense } from 'react';
import AbstractCore from '@/components/canvas/AbstractCore';

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

export default function CardScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 6.4], fov: 38 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            performance={{ min: 0.8, debounce: 250 }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.14} />
                <pointLight position={[6, 5, 6]} intensity={1.7} />
                <pointLight position={[-5, -4, -6]} intensity={0.7} color="#22d3ee" />

                <group scale={1.08} position={[0, 0.02, 0]}>
                    <AbstractCore />
                </group>

                <Stars radius={70} depth={36} count={360} factor={1.15} saturation={0} fade speed={0.25} />

                <EffectComposer multisampling={4}>
                    <Bloom
                        intensity={0.7}
                        luminanceThreshold={0.28}
                        luminanceSmoothing={0.35}
                        mipmapBlur
                    />
                </EffectComposer>

                <CardCameraRig />
            </Suspense>
        </Canvas>
    );
}
