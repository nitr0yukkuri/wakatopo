'use client'

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GentleWarpStars() {
    const count = 2000;
    const linesRef = useRef<THREE.LineSegments>(null);

    // 最初は点として配置し、徐々に線として伸びる
    const { positions, randoms } = useMemo(() => {
        const pos = new Float32Array(count * 6);
        const rnd = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // 空間の中心は少し空けつつ、外側に広がるように分布
            const r = 4 + Math.pow(Math.random(), 1.5) * 60;
            const theta = Math.random() * Math.PI * 2;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r;
            const z = -20 - Math.random() * 80;

            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;

            // 尾も最初は同位置（点）
            pos[i * 6 + 3] = x;
            pos[i * 6 + 4] = y;
            pos[i * 6 + 5] = z;

            rnd[i] = Math.random();
        }
        return { positions: pos, randoms: rnd };
    }, []);

    useFrame((state, delta) => {
        if (!linesRef.current) return;
        const posAttribute = linesRef.current.geometry.attributes.position;
        const pos = posAttribute.array as Float32Array;

        const time = state.clock.getElapsedTime();

        // --- 非常にリッチで滑らかなイージング (目に優しいカーブ) ---
        // 最初はゆっくり動き出し、流れるように加速するInOutExpo的な動き
        const progress = Math.min(time / 2.0, 1.0);
        const ease = progress === 0 ? 0 : progress === 1 ? 1 : progress < 0.5 ? Math.pow(2, 20 * progress - 10) / 2 : (2 - Math.pow(2, -20 * progress + 10)) / 2;

        const speed = 0.5 + ease * 30.0;
        const tailLength = ease * 35.0; // 尾の長さも徐々に伸びる

        for (let i = 0; i < count; i++) {
            // 進行
            pos[i * 6 + 2] += speed + randoms[i] * ease * 5.0;
            // 尾の追従（Z軸後方に引っ張る）
            pos[i * 6 + 5] = pos[i * 6 + 2] - (tailLength + randoms[i] * tailLength * 0.5);

            // カメラを通り過ぎたら奥へ静かにリセット
            if (pos[i * 6 + 2] > 10) {
                const z = -80 - Math.random() * 40;
                pos[i * 6 + 2] = z;
                pos[i * 6 + 5] = z;

                const r = 4 + Math.pow(Math.random(), 1.5) * 60;
                const theta = Math.random() * Math.PI * 2;
                pos[i * 6] = Math.cos(theta) * r;
                pos[i * 6 + 1] = Math.sin(theta) * r;
                pos[i * 6 + 3] = pos[i * 6];
                pos[i * 6 + 4] = pos[i * 6 + 1];
            }
        }
        posAttribute.needsUpdate = true;

        // 優雅に全体を回転させる
        linesRef.current.rotation.z += delta * (0.05 + ease * 0.1);
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            {/* 色は淡いシアン。不透明度を抑えて目に優しく、滑らかにブレンド */}
            <lineBasicMaterial color="#a8efff" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
    );
}

// 画面全体を柔らかく覆うフォグと光のオーラ（目に優しいフェードアウト用）
function AmbientGlow() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.getElapsedTime();
        const progress = Math.min(time / 2.0, 1.0);
        // 遷移の最後に画面全体が優しくフェードホワイトアウト/ブルーアウトするように
        const ease = Math.pow(progress, 3);
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = ease * 0.9;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -5]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#001830" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}

export default function WarpEffectCanvas() {
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} className="w-full h-full">
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 5, 80]} />
            <GentleWarpStars />
            <AmbientGlow />
        </Canvas>
    );
}
