import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1つの流星コンポーネント
function Meteor({ startPos, endPos, color = '#ffffff', scale = 1.0, duration = 2.0, onComplete }: any) {
    const meteorRef = useRef<THREE.Group>(null);
    const headMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
    const tailMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
    const timeRef = useRef(0);

    // Initial positioning and rotation
    useMemo(() => {
        // We only want to compute this once per meteor
        const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
        const dummy = new THREE.Object3D();
        dummy.position.copy(startPos);
        dummy.lookAt(startPos.clone().add(direction));
        return { initialRotation: dummy.rotation };
    }, [startPos, endPos]);

    // Shape Geometry Memoization
    const { geometry, tailGeometry } = useMemo(() => {
        const starShape = new THREE.Shape();
        const outerRadius = 0.5 * scale;
        const innerRadius = 0.2 * scale;
        const spikes = 5;

        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / spikes) * i;
            const x = Math.sin(angle) * radius;
            const y = Math.cos(angle) * radius;
            if (i === 0) starShape.moveTo(x, y);
            else starShape.lineTo(x, y);
        }

        const geom = new THREE.ExtrudeGeometry(starShape, { depth: 0.2 * scale, bevelEnabled: false });

        // もっと細くて、シュッと長い尾を引くように変更
        const tGeom = new THREE.CylinderGeometry(0.005 * scale, 0.1 * scale, 12 * scale, 16);
        tGeom.rotateX(Math.PI / 2);
        tGeom.translate(0, 0, -6.0 * scale);

        return { geometry: geom, tailGeometry: tGeom };
    }, [scale]);

    // Animation via useFrame instead of anime.js
    useFrame((state, delta) => {
        if (!meteorRef.current) return;

        timeRef.current += delta;
        const progress = Math.min(timeRef.current / duration, 1.0);

        // Linear interpolation from start to end
        meteorRef.current.position.lerpVectors(startPos, endPos, progress);

        // Make sure it faces the right way
        const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
        const targetPoint = meteorRef.current.position.clone().add(direction);
        meteorRef.current.lookAt(targetPoint);

        // 流れ星らしく、最後にかけてフェードアウト（燃え尽きる）
        if (headMaterialRef.current && tailMaterialRef.current) {
            const easeOut = 1.0 - progress * progress; // 二乗で後半一気に消える
            headMaterialRef.current.opacity = easeOut;
            tailMaterialRef.current.opacity = easeOut * 0.8;
        }

        if (progress >= 1.0 && onComplete) {
            onComplete();
        }
    });

    return (
        <group ref={meteorRef} position={startPos}>
            <mesh geometry={geometry}>
                <meshBasicMaterial ref={headMaterialRef} color={color} transparent={true} fog={false} />
            </mesh>
            <mesh geometry={tailGeometry}>
                <meshBasicMaterial
                    ref={tailMaterialRef}
                    color={color}
                    transparent={true}
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    fog={false}
                />
            </mesh>
        </group>
    );
}

// Manager component that spawns meteors randomly over time
export default function Meteors() {
    const [meteors, setMeteors] = useState<any[]>([]);
    const nextId = useRef(0);
    const timeSinceLastSpawn = useRef(0);

    useFrame((state, delta) => {
        timeSinceLastSpawn.current += delta;
        // Spawn every ~0.8 seconds (roughly matches the setInterval logic)
        if (timeSinceLastSpawn.current > 0.8) {
            if (Math.random() > 0.3) {
                spawnMeteor();
            }
            timeSinceLastSpawn.current = 0;
        }
    });

    const spawnMeteor = () => {
        const id = nextId.current++;

        const isRight = Math.random() > 0.5;

        // 流れ星らしく、かなり遠く(X=40付近)から、宇宙の奥深くより斜めに高速で突っ込んでくる
        const startX = isRight ? (35 + Math.random() * 15) : (-35 - Math.random() * 15);
        const startY = 20 + Math.random() * 10;
        const startZ = -15 - Math.random() * 20;

        // 画面の反対側へ一気に突き抜ける
        const endX = isRight ? (-20 - Math.random() * 20) : (20 + Math.random() * 20);
        const endY = startY - 20 - Math.random() * 15; // やや下へ
        const endZ = startZ + 10 + Math.random() * 10;

        const newMeteor = {
            id,
            startPos: new THREE.Vector3(startX, startY, startZ),
            endPos: new THREE.Vector3(endX, endY, endZ),
            // 星空に映える、さまざまな明るい色をランダムに選択（白、青、ピンク、緑、黄色など）
            color: ['#ffffff', '#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff8800', '#8888ff'][Math.floor(Math.random() * 7)],
            // 星のサイズを元の 1/4 ~ 1/3 まで小さくして「巨大な物体感」をなくす
            scale: 0.15 + Math.random() * 0.15,
            // 0.8 ~ 1.4秒くらいかけてゆっくり流れるように変更
            duration: 0.8 + Math.random() * 0.6
        };

        setMeteors(prev => [...prev, newMeteor]);
    };

    const removeMeteor = (idToRemove: number) => {
        setMeteors(prev => prev.filter(m => m.id !== idToRemove));
    };

    return (
        <group>
            {meteors.map(m => (
                <Meteor
                    key={m.id}
                    startPos={m.startPos}
                    endPos={m.endPos}
                    color={m.color}
                    scale={m.scale}
                    duration={m.duration}
                    onComplete={() => removeMeteor(m.id)}
                />
            ))}
        </group>
    );
}
