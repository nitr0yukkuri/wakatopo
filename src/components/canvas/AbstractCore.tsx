'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

export default function AbstractCore() {
    const { size } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Points>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const wireframe2Ref = useRef<THREE.Mesh>(null);

    const isMobile = size.width < 768;

    const { githubActivityLevel, weather } = useStore();

    // インタラクション用のステート
    const [hovered, setHovered] = useState(false);
    const [active, setActive] = useState(false);

    // インタラクション時の滑らかな補間用のRef
    const interactionValues = useRef({ hoverLevel: 0, activeLevel: 0 });
    const hitPointRef = useRef<THREE.Vector3 | null>(null);

    // カーソル制御とグローバルなPointerUp監視
    useEffect(() => {
        document.body.style.cursor = hovered ? (active ? 'crosshair' : 'pointer') : 'auto';

        // 画面外やOrbitControlsによってドラッグ状態が解除された時用にグローバルで監視
        const handlePointerUp = () => setActive(false);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            document.body.style.cursor = 'auto';
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [hovered, active]);

    // Reusable temp objects to avoid per-frame GC pressure
    const _tempColor = useMemo(() => new THREE.Color(), []);
    const _tempVec3A = useMemo(() => new THREE.Vector3(), []);
    const _tempVec3B = useMemo(() => new THREE.Vector3(), []);
    const _tempLocalPos = useMemo(() => new THREE.Vector3(), []);

    // コアの周囲を漂うデータ粒子（土星のリング状・軌道帯）の生成
    const particleCount = 1200;
    const { positions, randoms, baseRadii, baseYs } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const rnd = new Float32Array(particleCount);
        const br = new Float32Array(particleCount);
        const by = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            // 2つのリング帯を作る
            const isInnerRing = Math.random() > 0.5;
            const r = isInnerRing ? (2.1 + Math.random() * 0.4) : (2.8 + Math.random() * 0.8);

            // リングの厚みを変える
            const thickness = isInnerRing ? 0.05 : 0.2;
            const y = (Math.random() - 0.5) * thickness;

            pos[i * 3] = r * Math.cos(theta);
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = r * Math.sin(theta);

            rnd[i] = Math.random();
            br[i] = r;
            by[i] = y;
        }
        return { positions: pos, randoms: rnd, baseRadii: br, baseYs: by };
    }, []);

    // 天候に応じた色合い
    // ホログラム感を出すために少しトーンをいじる
    const baseColorHolo = weather === 'Rain' ? new THREE.Color('#aaddff') : new THREE.Color('#00eeff');
    const hoverColor = weather === 'Rain' ? new THREE.Color('#e0f0ff') : new THREE.Color('#33ddee');
    const activeColor = new THREE.Color('#d900bb'); // 発光を少し抑えめに調整

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();

        // インタラクションレベルの滑らかな補間
        interactionValues.current.hoverLevel = THREE.MathUtils.lerp(interactionValues.current.hoverLevel, hovered ? 1 : 0, 0.1);
        interactionValues.current.activeLevel = THREE.MathUtils.lerp(interactionValues.current.activeLevel, active ? 1 : 0, 0.15);

        const { hoverLevel, activeLevel } = interactionValues.current;

        // メイン色 (reuse temp color to avoid allocation)
        _tempColor.copy(baseColorHolo)
            .lerp(hoverColor, hoverLevel)
            .lerp(activeColor, activeLevel);
        const currentColor = _tempColor;

        // 1. 中心ワイヤーフレームのアニメーション
        if (meshRef.current) {
            const rotSpeedY = 0.05 + githubActivityLevel * 0.1 + hoverLevel * 1.5 + activeLevel * 4.0;
            const rotSpeedX = 0.03 + hoverLevel * 1.0 + activeLevel * 2.0;

            meshRef.current.rotation.y += rotSpeedY * delta;
            meshRef.current.rotation.x += rotSpeedX * delta;

            const scale = 1.0 + activeLevel * 0.05 + Math.sin(time * 3.0) * 0.02 * (1 + activeLevel);
            meshRef.current.scale.set(scale, scale, scale);

            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.1);
            mat.opacity = THREE.MathUtils.lerp(0.15, 0.35, hoverLevel + activeLevel);
        }

        // 2. 内側の複雑な幾何学（逆回転・高密度）
        if (wireframe2Ref.current) {
            wireframe2Ref.current.rotation.y -= (0.07 + hoverLevel * 0.5 + activeLevel * 2.0) * delta;
            wireframe2Ref.current.rotation.z += (0.04 + activeLevel * 1.0) * delta;

            const mat = wireframe2Ref.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.1);
            mat.opacity = THREE.MathUtils.lerp(0.1, 0.25, hoverLevel + activeLevel);
        }

        // 3. インナーコア（パルス光）
        if (innerRef.current) {
            const innerScale = 0.85 + Math.sin(time * 5.0) * 0.03 + activeLevel * 0.15;
            innerRef.current.scale.set(innerScale, innerScale, innerScale);
            const mat = innerRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.1);
            mat.opacity = THREE.MathUtils.lerp(0.05, 0.3, hoverLevel + activeLevel * 0.5);
        }

        // 4, 5. 外側のデータリング（細い円環）
        if (ring1Ref.current && ring2Ref.current) {
            ring1Ref.current.rotation.z += (0.2 + activeLevel * 1.0) * delta;
            ring2Ref.current.rotation.z -= (0.15 + hoverLevel * 0.5 + activeLevel * 1.5) * delta;

            // クリック時にリングが展開するような挙動
            const r1Scale = 1.0 + hoverLevel * 0.02 + activeLevel * 0.1;
            const r2Scale = 1.0 + hoverLevel * 0.05 + activeLevel * 0.2;

            ring1Ref.current.scale.lerp(_tempVec3A.set(r1Scale, r1Scale, r1Scale), 0.1);
            ring2Ref.current.scale.lerp(_tempVec3B.set(r2Scale, r2Scale, r2Scale), 0.1);

            (ring1Ref.current.material as THREE.MeshBasicMaterial).color.lerp(currentColor, 0.1);
            (ring2Ref.current.material as THREE.MeshBasicMaterial).color.lerp(currentColor, 0.1);
        }

        // 6. パーティクルのアニメーション（土星の輪のように回転）
        if (particlesRef.current) {
            // リング全体としての自転
            particlesRef.current.rotation.y += (0.05 + hoverLevel * 0.2 + activeLevel * 1.0) * delta;

            // リング全体を少し傾けてかっこよく見せる
            particlesRef.current.rotation.x = THREE.MathUtils.lerp(particlesRef.current.rotation.x, Math.PI * 0.1 + hoverLevel * 0.1 - activeLevel * 0.1, 0.05);
            particlesRef.current.rotation.z = THREE.MathUtils.lerp(particlesRef.current.rotation.z, -Math.PI * 0.05 + activeLevel * 0.2, 0.05);

            // マウスの正確な3Dワールド交差座標をローカル座標に変換 (reuse vector)
            const mouseLocal = hitPointRef.current
                ? particlesRef.current.worldToLocal(_tempLocalPos.copy(hitPointRef.current))
                : null;

            const posAttr = particlesRef.current.geometry.attributes.position;
            const pos = posAttr.array as Float32Array;

            // 各パーティクルの揺らぎと拡張
            const expansionForce = activeLevel * 0.03;
            for (let i = 0; i < particleCount; i++) {
                const offset = Math.sin(time * 2.0 + randoms[i] * Math.PI * 2) * 0.002;

                const x = pos[i * 3];
                const y = pos[i * 3 + 1];
                const z = pos[i * 3 + 2];
                const radius = Math.sqrt(x * x + z * z);

                // 縦方向の揺らぎと拡張
                const expandX = (x / radius) * expansionForce;
                const expandZ = (z / radius) * expansionForce;

                // --- 新規: マウスからの反発力（磁力のように逃げる） ---
                let mouseRepelX = 0;
                let mouseRepelY = 0;
                let mouseRepelZ = 0;

                if (mouseLocal) {
                    const dx = x - mouseLocal.x;
                    const dy = y - mouseLocal.y;
                    const dz = z - mouseLocal.z;
                    const distToMouseSq = dx * dx + dy * dy + dz * dz;

                    // 影響範囲を広げる（半径 2.0 -> 距離の2乗 4.0）
                    if (distToMouseSq < 4.0) {
                        const distToMouse = Math.sqrt(distToMouseSq);
                        // 中心に近いほど指数関数的に強く弾く
                        const force = Math.pow(2.0 - distToMouse, 2) * 0.15;
                        mouseRepelX = (dx / distToMouse) * force;
                        mouseRepelY = (dy / distToMouse) * force;
                        mouseRepelZ = (dz / distToMouse) * force;
                    }
                }

                // --- 元の軌道（半径と高さ）に戻るバネの力 ---
                const originalR = baseRadii[i];
                const originalY = baseYs[i];
                const springForce = (originalR - radius) * 0.05;
                const springForceY = (originalY - y) * 0.05;

                const forceX = expandX + (x / radius) * springForce + mouseRepelX;
                const forceZ = expandZ + (z / radius) * springForce + mouseRepelZ;
                const forceY = springForceY + mouseRepelY;

                // 座標を更新 (アクティブ時はランダムな乱れも加える)
                pos[i * 3] += forceX;
                pos[i * 3 + 1] += forceY + offset + (activeLevel * (randoms[i] - 0.5) * 0.05);
                pos[i * 3 + 2] += forceZ;
            }
            posAttr.needsUpdate = true;

            const pMat = particlesRef.current.material as THREE.PointsMaterial;
            pMat.color.lerp(currentColor, 0.1);
            pMat.size = THREE.MathUtils.lerp(0.025, 0.05, activeLevel);
        }
    });

    return (
        <group scale={isMobile ? 0.74 : 1}>
            {/* 当たり判定用の透明な球体（ワイヤーフレームは当たり判定が拾えないため） */}
            <mesh
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={(e) => { e.stopPropagation(); setHovered(false); setActive(false); hitPointRef.current = null; }}
                onPointerDown={(e) => { e.stopPropagation(); setActive(true); }}
                onPointerUp={(e) => { e.stopPropagation(); setActive(false); }}
                onPointerMove={(e) => { e.stopPropagation(); hitPointRef.current = e.point; }}
            >
                {/* 軌道上のパーティクル範囲ではなく、コア本体付近に当たり判定を絞る */}
                <sphereGeometry args={[1.8, 32, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.0} depthWrite={false} />
            </mesh>
            {/* 1. 外側のメインワイヤーフレーム（粗め） */}
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

            {/* 2. 内側のワイヤーフレーム（密度高め・逆回転） */}
            <mesh ref={wireframe2Ref} scale={0.9}>
                <icosahedronGeometry args={[1.5, 3]} />
                <meshBasicMaterial
                    color="#00ffff"
                    wireframe
                    transparent
                    opacity={0.1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 3. コアの淡い発光（ソリッド） */}
            <mesh ref={innerRef} scale={0.88}>
                <icosahedronGeometry args={[1.6, 2]} />
                <meshBasicMaterial
                    color="#0088ff"
                    transparent
                    opacity={0.05}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 4. データ軌道リング 1（斜め） */}
            <mesh ref={ring1Ref} rotation={[-Math.PI / 2.5, Math.PI / 8, 0]}>
                <torusGeometry args={[2.5, 0.002, 16, 128]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 5. データ軌道リング 2（逆斜め・少し大きい） */}
            <mesh ref={ring2Ref} rotation={[-Math.PI / 2.2, -Math.PI / 10, 0]}>
                <torusGeometry args={[3.0, 0.005, 16, 128]} />
                <meshBasicMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* 6. 周囲の軌道パーティクル群（土星の輪スタイル・ディスク状） */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial
                    size={0.025}
                    color="#00ffff"
                    transparent
                    opacity={0.85}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>
        </group>
    );
}