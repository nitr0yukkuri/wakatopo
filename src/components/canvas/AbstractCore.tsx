'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export default function AbstractCore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const { githubActivityLevel, weather } = useStore();

    // コアの周囲を漂うデータ粒子の生成
    const particleCount = 1500;
    const { positions, randoms } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const rnd = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            // 球状に分布させる
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 1.8 + Math.random() * 1.5; // 半径1.8〜3.3の間に分布

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            rnd[i] = Math.random();
        }
        return { positions: pos, randoms: rnd };
    }, []);

    // 天候に応じたターゲットカラー
    const targetColor = weather === 'Rain' ? new THREE.Color('#ffffff') : new THREE.Color('#00ffff');

    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // ワイヤーフレームコアのアニメーション
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.05 + githubActivityLevel * 0.1;
            meshRef.current.rotation.x = time * 0.03 + githubActivityLevel * 0.05;

            // 活動量に応じた脈動（呼吸）
            const scale = 1.0 + Math.sin(time * 2.5) * 0.03 * (1 + githubActivityLevel * 2);
            meshRef.current.scale.set(scale, scale, scale);

            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(targetColor, 0.05);
        }

        // パーティクルのアニメーション
        if (particlesRef.current) {
            // 全体を逆回転
            particlesRef.current.rotation.y = -(time * 0.02 + githubActivityLevel * 0.05);

            const posAttr = particlesRef.current.geometry.attributes.position;
            const pos = posAttr.array as Float32Array;

            // 粒子一つ一つの微細な揺らぎ
            for (let i = 0; i < particleCount; i++) {
                const offset = Math.sin(time * 1.0 + randoms[i] * Math.PI * 2) * 0.001;
                pos[i * 3] += pos[i * 3] * offset;
                pos[i * 3 + 1] += pos[i * 3 + 1] * offset;
                pos[i * 3 + 2] += pos[i * 3 + 2] * offset;
            }
            posAttr.needsUpdate = true;

            const pMat = particlesRef.current.material as THREE.PointsMaterial;
            pMat.color.lerp(targetColor, 0.05);
        }
    });

    return (
        <group>
            {/* メインの幾何学ワイヤーフレームコア */}
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1.6, 2]} />
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* さらに内側の淡い発光 */}
            <mesh scale={0.88}>
                <icosahedronGeometry args={[1.6, 1]} />
                <meshBasicMaterial
                    color="#0088ff"
                    transparent
                    opacity={0.1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 周囲を漂うデータ粒子群 */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.02}
                    color="#ffffff"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        </group>
    );
}
