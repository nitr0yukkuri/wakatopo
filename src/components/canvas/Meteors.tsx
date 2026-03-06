import { useRef, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import anime from 'animejs';

// 1つの流星コンポーネント
function Meteor({ startPos, endPos, color = '#ffffff', scale = 1.0, onComplete }: any) {
    const meteorRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const tailRef = useRef<THREE.Mesh>(null);

    // Initial positioning
    useEffect(() => {
        if (meteorRef.current) {
            meteorRef.current.position.copy(startPos);

            // Calculate rotation to face the movement direction
            const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();

            // Default object faces Z+ axis. We need it to face the direction.
            // Using lookAt to orient the object.
            // We create a dummy object to use lookAt safely without messing up existing matrices in a weird state
            const dummy = new THREE.Object3D();
            dummy.position.copy(startPos);
            dummy.lookAt(startPos.clone().add(direction));

            const euler = dummy.rotation;

            if (headRef.current) headRef.current.rotation.copy(euler);
            if (tailRef.current) tailRef.current.rotation.copy(euler);
        }
    }, [startPos, endPos]);

    // Shape Geometry Memoization (Same as original repo)
    const { geometry, tailGeometry } = useMemo(() => {
        // Create Meteor Head (Star Shape)
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

        // Create Meteor Tail (Glow)
        // Adjusting cylinder rotation because cylinder default is Y-aligned
        const tGeom = new THREE.CylinderGeometry(0.02 * scale, 0.5 * scale, 5 * scale, 16);
        tGeom.rotateX(Math.PI / 2); // Make tail face Z axis to match lookAt
        tGeom.translate(0, 0, -2.5 * scale); // Offset behind the head

        return { geometry: geom, tailGeometry: tGeom };
    }, [scale]);

    useEffect(() => {
        if (meteorRef.current) {
            // Animate using anime.js exactly like original
            anime({
                targets: meteorRef.current.position,
                x: [startPos.x, endPos.x],
                y: [startPos.y, endPos.y],
                z: [startPos.z, endPos.z],
                duration: 2000,
                easing: 'linear',
                complete: () => {
                    if (onComplete) onComplete();
                }
            });
        }
    }, [startPos, endPos, onComplete]);


    return (
        <group ref={meteorRef}>
            <mesh ref={headRef} geometry={geometry}>
                <meshBasicMaterial color={color} />
            </mesh>
            <mesh ref={tailRef} geometry={tailGeometry}>
                <meshBasicMaterial
                    color={color}
                    transparent={true}
                    opacity={0.5}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

// Manager component that spawns meteors randomly over time
export default function Meteors({ isInteractive = false }) {
    const [meteors, setMeteors] = useState<any[]>([]);
    const nextId = useRef(0);

    // Auto-spawner (since we don't have socket.io yet in this template)
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.5) { // 50% chance every 1.5s
                spawnMeteor();
            }
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const spawnMeteor = () => {
        const id = nextId.current++;

        // Random positions matching the original logic context
        // Meteor comes from far top-right/left and shoots down-left/right
        const startX = (Math.random() - 0.5) * 60;
        const startY = 20 + Math.random() * 10;
        const startZ = -20 - Math.random() * 20;

        const endX = startX + (Math.random() > 0.5 ? 20 : -20);
        const endY = startY - 40;
        const endZ = startZ + 20;

        const newMeteor = {
            id,
            startPos: new THREE.Vector3(startX, startY, startZ),
            endPos: new THREE.Vector3(endX, endY, endZ),
            color: new THREE.Color().setHSL(Math.random(), 1.0, 0.7).getStyle(),
            scale: 0.5 + Math.random() * 1.5
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
                    onComplete={() => removeMeteor(m.id)}
                />
            ))}
        </group>
    );
}
