'use client'

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function MouseRepulsion({ particleCount = 60, repulsionRadius = 4, repulsionForce = 0.8 }) {
    const groupRef = useRef<THREE.Group>(null);
    const particlesRef = useRef<{ pos: THREE.Vector3; vel: THREE.Vector3; life: number }[]>([]);
    const { camera, gl } = useThree();
    const mousePos = useRef(new THREE.Vector2(0, 0));
    const raycaster = useRef(new THREE.Raycaster());

    // マウスイベントリスナー設定
    useMemo(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        const canvas = gl.domElement;
        canvas?.addEventListener('mousemove', handleMouseMove);
        return () => canvas?.removeEventListener('mousemove', handleMouseMove);
    }, [gl]);

    // 粒子の初期化
    useMemo(() => {
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ),
            vel: new THREE.Vector3(0, 0, 0),
            life: 1,
        }));
    }, [particleCount]);

    useFrame(() => {
        if (!groupRef.current) return;

        // レイキャスターでマウスのワールド座標を計算
        raycaster.current.setFromCamera(mousePos.current, camera);
        const direction = raycaster.current.ray.direction;

        // カメラから少し前方のマウス位置ワールド座標
        const mouseWorldPos = new THREE.Vector3(
            camera.position.x + direction.x * 10,
            camera.position.y + direction.y * 10,
            camera.position.z + direction.z * 10
        );

        particlesRef.current.forEach((particle, i) => {
            // マウスへの距離を計算
            const diff = new THREE.Vector3().subVectors(particle.pos, mouseWorldPos);
            const distance = diff.length();

            // 反発力の計算
            if (distance < repulsionRadius) {
                const strength = (1 - distance / repulsionRadius) * repulsionForce;
                diff.normalize().multiplyScalar(strength);
                particle.vel.add(diff);
            }

            // 速度の減衰
            particle.vel.multiplyScalar(0.92);

            // 位置更新
            particle.pos.add(particle.vel);

            // 画面外の場合、ランダムに戻す
            if (Math.abs(particle.pos.x) > 15 || Math.abs(particle.pos.y) > 15 || Math.abs(particle.pos.z) > 15) {
                particle.pos.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                );
                particle.vel.set(0, 0, 0);
            }

            // メッシュの位置を更新
            if (groupRef.current?.children[i]) {
                const mesh = groupRef.current.children[i] as THREE.Mesh;
                mesh.position.copy(particle.pos);
            }
        });
    });

    return (
        <group ref={groupRef}>
            {Array.from({ length: particleCount }).map((_, i) => (
                <mesh key={i} scale={0.06}>
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshPhongMaterial
                        color={new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.6)}
                        emissive={new THREE.Color().setHSL(0.6 + Math.random() * 0.1, 0.8, 0.4)}
                    />
                </mesh>
            ))}
        </group>
    );
}
