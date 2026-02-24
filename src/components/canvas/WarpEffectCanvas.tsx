'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WarpStars() {
    const count = 3000;
    const linesRef = useRef<THREE.LineSegments>(null);

    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 6);
        const col = new Float32Array(count * 6);

        const color1 = new THREE.Color('#ffffff'); // Core white
        const color2 = new THREE.Color('#00ffff'); // Cyan
        const color3 = new THREE.Color('#0088ff'); // Deep blue

        for (let i = 0; i < count; i++) {
            // 円柱状（トンネル状）に星を配置し、中央を開ける
            const r = 5 + Math.random() * 80;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = -200 + Math.random() * 400;

            // Start point (closer to camera)
            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;

            // End point (pushed deep into Z to create a long streak)
            pos[i * 6 + 3] = x;
            pos[i * 6 + 4] = y;
            pos[i * 6 + 5] = z - (40 + Math.random() * 80);

            // Assign color
            const randColor = Math.random();
            const c = randColor > 0.8 ? color2 : (randColor > 0.5 ? color3 : color1);

            // Head is bright, tail is dark
            col[i * 6] = c.r; col[i * 6 + 1] = c.g; col[i * 6 + 2] = c.b;
            col[i * 6 + 3] = c.r * 0.05; col[i * 6 + 4] = c.g * 0.05; col[i * 6 + 5] = c.b * 0.05;
        }
        return { positions: pos, colors: col };
    }, []);

    useFrame((state, delta) => {
        if (!linesRef.current) return;
        const posAttribute = linesRef.current.geometry.attributes.position;
        const pos = posAttribute.array as Float32Array;

        // 加速するワープスピード
        const time = state.clock.getElapsedTime();
        const speed = 20.0 + Math.min(time * 60.0, 300.0); // 爆発的に加速

        for (let i = 0; i < count; i++) {
            pos[i * 6 + 2] += speed;
            pos[i * 6 + 5] += speed;

            // カメラを通り過ぎたら奥へリセット
            if (pos[i * 6 + 2] > 50) {
                const z = -500 - Math.random() * 200;
                pos[i * 6 + 2] = z;
                pos[i * 6 + 5] = z - (40 + Math.random() * 80);

                // 少しだけxyを揺らして躍動感を出す
                const r = 5 + Math.random() * 80;
                const theta = Math.random() * Math.PI * 2;
                const newX = Math.cos(theta) * r;
                const newY = Math.sin(theta) * r;
                pos[i * 6] = newX; pos[i * 6 + 1] = newY;
                pos[i * 6 + 3] = newX; pos[i * 6 + 4] = newY;
            }
        }
        posAttribute.needsUpdate = true;

        // トンネル全体を少し回転させる
        linesRef.current.rotation.z += delta * 0.2;
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <lineBasicMaterial vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
    );
}

export default function WarpEffectCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 90 }} className="w-full h-full">
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 10, 300]} />
            <WarpStars />
        </Canvas>
    );
}
