'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/planet';
import { useStore } from '@/store';

export default function Planet() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { githubActivityLevel, weather } = useStore();
    // Reusable color to avoid per-frame allocation
    const _tempColor = useMemo(() => new THREE.Color(), []);

    // インタラクション用のステート
    const [hovered, setHovered] = useState(false);
    const [active, setActive] = useState(false);

    // カーソル制御
    useEffect(() => {
        document.body.style.cursor = hovered ? (active ? 'grabbing' : 'grab') : 'auto';
        return () => {
            document.body.style.cursor = 'auto'; // クリーンアップ
        };
    }, [hovered, active]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uActivity: { value: 0 },
            uIntro: { value: 0 },
            uHover: { value: 0 },   // 光や膨張のホバー用
            uActive: { value: 0 },  // 触っている（ドラッグ中）用
            uColorA: { value: new THREE.Color('#ffffff') }, // ベースは白
            uColorB: { value: new THREE.Color('#00ffff') }, // 鋭いシアン
        }),
        []
    );

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const material = meshRef.current.material as THREE.ShaderMaterial;
        const time = state.clock.getElapsedTime();

        material.uniforms.uTime.value = time;
        material.uniforms.uIntro.value = THREE.MathUtils.lerp(material.uniforms.uIntro.value, 1.0, 0.03);
        material.uniforms.uActivity.value = THREE.MathUtils.lerp(material.uniforms.uActivity.value, githubActivityLevel, 0.05);

        // インタラクションの見た目を滑らかに補間
        material.uniforms.uHover.value = THREE.MathUtils.lerp(material.uniforms.uHover.value, hovered ? 1 : 0, 0.1);
        material.uniforms.uActive.value = THREE.MathUtils.lerp(material.uniforms.uActive.value, active ? 1 : 0, 0.15);

        _tempColor.set(weather === 'Rain' ? '#ffffff' : '#00ffff');
        material.uniforms.uColorB.value.lerp(_tempColor, 0.05);

        // 自転のスピードを、触っているときに少し早くする（回している感）
        const baseSpeed = 0.1;
        const interactionSpeed = active ? 0.8 : (hovered ? 0.3 : 0.0);
        meshRef.current.rotation.y += (baseSpeed + interactionSpeed) * delta;
    });

    return (
        <group
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => { setHovered(false); setActive(false); }}
            onPointerDown={(e) => { e.stopPropagation(); setActive(true); }}
            onPointerUp={() => setActive(false)}
        >
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            {/* インナーコア */}
            <mesh scale={0.98}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}