import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WeatherType } from '@/store';
import { CORE_VISUALS } from './coreVisuals';
import type { CoreParticleState } from './useCoreParticles';

type UseCoreAnimationParams = {
    weather: WeatherType;
    githubActivityLevel: number;
    hovered: boolean;
    active: boolean;
    hitPointRef: React.MutableRefObject<THREE.Vector3 | null>;
    meshRef: React.RefObject<THREE.Mesh | null>;
    innerRef: React.RefObject<THREE.Mesh | null>;
    particlesRef: React.RefObject<THREE.Points | null>;
    ring1Ref: React.RefObject<THREE.Mesh | null>;
    ring2Ref: React.RefObject<THREE.Mesh | null>;
    wireframe2Ref: React.RefObject<THREE.Mesh | null>;
    particleState: CoreParticleState;
};

export const useCoreAnimation = ({
    weather,
    githubActivityLevel,
    hovered,
    active,
    hitPointRef,
    meshRef,
    innerRef,
    particlesRef,
    ring1Ref,
    ring2Ref,
    wireframe2Ref,
    particleState,
}: UseCoreAnimationParams) => {
    const interactionValues = useRef({ hoverLevel: 0, activeLevel: 0 });
    const blendedVisualRef = useRef({
        meshOpacity: CORE_VISUALS[weather].meshOpacity,
        wireOpacity: CORE_VISUALS[weather].wireOpacity,
        innerOpacity: CORE_VISUALS[weather].innerOpacity,
        ringPulse: CORE_VISUALS[weather].ringPulse,
        orbitTilt: CORE_VISUALS[weather].orbitTilt,
        particleSize: CORE_VISUALS[weather].particleSize,
    });
    const blendedBaseColorRef = useRef(new THREE.Color(CORE_VISUALS[weather].baseColor));
    const blendedHoverColorRef = useRef(new THREE.Color(CORE_VISUALS[weather].hoverColor));
    const blendedActiveColorRef = useRef(new THREE.Color(CORE_VISUALS[weather].activeColor));

    const tempColor = useMemo(() => new THREE.Color(), []);
    const tempVec3A = useMemo(() => new THREE.Vector3(), []);
    const tempVec3B = useMemo(() => new THREE.Vector3(), []);
    const tempLocalPos = useMemo(() => new THREE.Vector3(), []);

    const visual = CORE_VISUALS[weather] ?? CORE_VISUALS.Clear;
    const baseColorHolo = useMemo(() => new THREE.Color(visual.baseColor), [visual.baseColor]);
    const hoverColor = useMemo(() => new THREE.Color(visual.hoverColor), [visual.hoverColor]);
    const activeColor = useMemo(() => new THREE.Color(visual.activeColor), [visual.activeColor]);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();

        interactionValues.current.hoverLevel = THREE.MathUtils.lerp(interactionValues.current.hoverLevel, hovered ? 1 : 0, 0.1);
        interactionValues.current.activeLevel = THREE.MathUtils.lerp(interactionValues.current.activeLevel, active ? 1 : 0, 0.15);

        const { hoverLevel, activeLevel } = interactionValues.current;
        const weatherBlend = 1 - Math.exp(-delta * 3.2);
        blendedBaseColorRef.current.lerp(baseColorHolo, weatherBlend);
        blendedHoverColorRef.current.lerp(hoverColor, weatherBlend);
        blendedActiveColorRef.current.lerp(activeColor, weatherBlend);

        blendedVisualRef.current.meshOpacity = THREE.MathUtils.lerp(blendedVisualRef.current.meshOpacity, visual.meshOpacity, weatherBlend);
        blendedVisualRef.current.wireOpacity = THREE.MathUtils.lerp(blendedVisualRef.current.wireOpacity, visual.wireOpacity, weatherBlend);
        blendedVisualRef.current.innerOpacity = THREE.MathUtils.lerp(blendedVisualRef.current.innerOpacity, visual.innerOpacity, weatherBlend);
        blendedVisualRef.current.ringPulse = THREE.MathUtils.lerp(blendedVisualRef.current.ringPulse, visual.ringPulse, weatherBlend);
        blendedVisualRef.current.orbitTilt = THREE.MathUtils.lerp(blendedVisualRef.current.orbitTilt, visual.orbitTilt, weatherBlend);
        blendedVisualRef.current.particleSize = THREE.MathUtils.lerp(blendedVisualRef.current.particleSize, visual.particleSize, weatherBlend);

        const blendedVisual = blendedVisualRef.current;

        tempColor
            .copy(blendedBaseColorRef.current)
            .lerp(blendedHoverColorRef.current, hoverLevel)
            .lerp(blendedActiveColorRef.current, activeLevel);
        const currentColor = tempColor;

        if (meshRef.current) {
            const rotSpeedY = 0.05 + githubActivityLevel * 0.1 + hoverLevel * 1.5 + activeLevel * 4.0;
            const rotSpeedX = 0.03 + hoverLevel * 1.0 + activeLevel * 2.0;

            meshRef.current.rotation.y += rotSpeedY * delta;
            meshRef.current.rotation.x += rotSpeedX * delta;

            const scale = 1.0 + activeLevel * 0.05 + Math.sin(time * (2.2 + blendedVisual.ringPulse)) * 0.02 * (1 + activeLevel);
            meshRef.current.scale.set(scale, scale, scale);

            const mat = meshRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.2);
            mat.opacity = THREE.MathUtils.lerp(blendedVisual.meshOpacity, blendedVisual.meshOpacity + 0.18, hoverLevel + activeLevel);
        }

        if (wireframe2Ref.current) {
            wireframe2Ref.current.rotation.y -= (0.07 + hoverLevel * 0.5 + activeLevel * 2.0) * delta;
            wireframe2Ref.current.rotation.z += (0.04 + activeLevel * 1.0) * delta;

            const wfScale = 0.9 + blendedVisual.ringPulse * 0.05 + Math.sin(time * (1.3 + blendedVisual.ringPulse)) * 0.01;
            wireframe2Ref.current.scale.set(wfScale, wfScale, wfScale);

            const mat = wireframe2Ref.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.2);
            mat.opacity = THREE.MathUtils.lerp(blendedVisual.wireOpacity, blendedVisual.wireOpacity + 0.14, hoverLevel + activeLevel);
        }

        if (innerRef.current) {
            const innerScale = 0.84 + Math.sin(time * (4.0 + blendedVisual.ringPulse)) * 0.035 + activeLevel * 0.15;
            innerRef.current.scale.set(innerScale, innerScale, innerScale);
            const mat = innerRef.current.material as THREE.MeshBasicMaterial;
            mat.color.lerp(currentColor, 0.2);
            mat.opacity = THREE.MathUtils.lerp(blendedVisual.innerOpacity, blendedVisual.innerOpacity + 0.2, hoverLevel + activeLevel * 0.5);
        }

        if (ring1Ref.current && ring2Ref.current) {
            ring1Ref.current.rotation.z += (0.18 + blendedVisual.ringPulse * 0.14 + activeLevel * 1.0) * delta;
            ring2Ref.current.rotation.z -= (0.14 + blendedVisual.ringPulse * 0.1 + hoverLevel * 0.5 + activeLevel * 1.5) * delta;

            const r1Scale = 1.0 + blendedVisual.ringPulse * 0.03 + hoverLevel * 0.02 + activeLevel * 0.1;
            const r2Scale = 1.0 + blendedVisual.ringPulse * 0.05 + hoverLevel * 0.05 + activeLevel * 0.2;

            ring1Ref.current.scale.lerp(tempVec3A.set(r1Scale, r1Scale, r1Scale), 0.1);
            ring2Ref.current.scale.lerp(tempVec3B.set(r2Scale, r2Scale, r2Scale), 0.1);

            (ring1Ref.current.material as THREE.MeshBasicMaterial).color.lerp(currentColor, 0.2);
            (ring2Ref.current.material as THREE.MeshBasicMaterial).color.lerp(currentColor, 0.2);
        }

        if (particlesRef.current) {
            particlesRef.current.rotation.y += (0.05 + hoverLevel * 0.2 + activeLevel * 1.0) * delta;

            particlesRef.current.rotation.x = THREE.MathUtils.lerp(
                particlesRef.current.rotation.x,
                Math.PI * blendedVisual.orbitTilt + hoverLevel * 0.04 - activeLevel * 0.04,
                0.05,
            );
            particlesRef.current.rotation.z = THREE.MathUtils.lerp(
                particlesRef.current.rotation.z,
                -Math.PI * 0.05 + activeLevel * 0.2,
                0.05,
            );

            const mouseLocal = hitPointRef.current
                ? particlesRef.current.worldToLocal(tempLocalPos.copy(hitPointRef.current))
                : null;

            const posAttr = particlesRef.current.geometry.attributes.position;
            const pos = posAttr.array as Float32Array;
            const expansionForce = activeLevel * 0.03;
            const { particleCount, randoms, baseRadii, baseYs } = particleState;

            for (let i = 0; i < particleCount; i++) {
                const offset = Math.sin(time * 2.0 + randoms[i] * Math.PI * 2) * 0.002;

                const x = pos[i * 3];
                const y = pos[i * 3 + 1];
                const z = pos[i * 3 + 2];
                const radius = Math.sqrt(x * x + z * z);

                const safeRadius = Math.max(radius, 0.0001);
                const expandX = (x / safeRadius) * expansionForce;
                const expandZ = (z / safeRadius) * expansionForce;

                let mouseRepelX = 0;
                let mouseRepelY = 0;
                let mouseRepelZ = 0;

                if (mouseLocal && activeLevel > 0.02) {
                    const dx = x - mouseLocal.x;
                    const dy = y - mouseLocal.y;
                    const dz = z - mouseLocal.z;
                    const distToMouseSq = dx * dx + dy * dy + dz * dz;

                    if (distToMouseSq < 4.0) {
                        const distToMouse = Math.max(Math.sqrt(distToMouseSq), 0.0001);
                        const force = Math.pow(2.0 - distToMouse, 2) * 0.15;
                        mouseRepelX = (dx / distToMouse) * force;
                        mouseRepelY = (dy / distToMouse) * force;
                        mouseRepelZ = (dz / distToMouse) * force;
                    }
                }

                const originalR = baseRadii[i];
                const originalY = baseYs[i];
                const springForce = (originalR - radius) * 0.05;
                const springForceY = (originalY - y) * 0.05;

                const forceX = expandX + (x / safeRadius) * springForce + mouseRepelX;
                const forceZ = expandZ + (z / safeRadius) * springForce + mouseRepelZ;
                const forceY = springForceY + mouseRepelY;

                pos[i * 3] += forceX;
                pos[i * 3 + 1] += forceY + offset + (activeLevel * (randoms[i] - 0.5) * 0.02);
                pos[i * 3 + 2] += forceZ;
            }
            posAttr.needsUpdate = true;

            const pMat = particlesRef.current.material as THREE.PointsMaterial;
            pMat.color.lerp(currentColor, 0.24);
            pMat.size = THREE.MathUtils.lerp(blendedVisual.particleSize, blendedVisual.particleSize + 0.02, activeLevel);
        }
    });
};
