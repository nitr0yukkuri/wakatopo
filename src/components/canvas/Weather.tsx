'use client'

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export default function Weather() {
    const { weather } = useStore();
    const rainRef = useRef<THREE.Points>(null);

    const rainCount = 3000;
    // useMemoを使わず外で定義するとレンダリング毎に再生成されるため、
    // 本来はuseMemoすべきですが、ここでは簡単のため定数として扱います。
    // ただし、R3Fではargsが変わると再マウントされるので、
    // positions配列は一度だけ作るように修正します。
    const positions = useRef(new Float32Array(rainCount * 3));

    // 初回のみ初期化
    if (positions.current[0] === 0 && positions.current[1] === 0) {
        for (let i = 0; i < rainCount * 3; i++) {
            positions.current[i] = (Math.random() - 0.5) * 20;
        }
    }

    useFrame(() => {
        if (weather !== 'Rain' || !rainRef.current) return;

        // 型アサーションを追加
        const geom = rainRef.current.geometry;
        const positionAttribute = geom.attributes.position as THREE.BufferAttribute;
        const posArray = positionAttribute.array as Float32Array;

        for (let i = 1; i < rainCount * 3; i += 3) {
            posArray[i] -= 0.15;
            if (posArray[i] < -10) {
                posArray[i] = 10;
            }
        }
        positionAttribute.needsUpdate = true;
    });

    if (weather !== 'Rain') return null;

    return (
        <points ref={rainRef}>
            <bufferGeometry>
                {/* ここを修正: argsを使って初期化します */}
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions.current, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#a5f3fc"
                size={0.05}
                transparent
                opacity={0.6}
            />
        </points>
    );
}