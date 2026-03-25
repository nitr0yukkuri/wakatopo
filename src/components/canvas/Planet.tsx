'use client'

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '@/shaders/planet';
import { useStore } from '@/store';

type WeatherVisualProfile = {
    colorA: string;
    colorB: string;
    geomDensity: number;
    facet: number;
    edgeBoost: number;
    gridDensity: number;
    sparkle: number;
};

const WEATHER_VISUALS: Record<string, WeatherVisualProfile> = {
    Clear: {
        colorA: '#ffe0a8',
        colorB: '#d6ff7a',
        geomDensity: 0.45,
        facet: 0.18,
        edgeBoost: 0.4,
        gridDensity: 0.48,
        sparkle: 0.38,
    },
    Morning: {
        colorA: '#ffcba3',
        colorB: '#ffe18f',
        geomDensity: 0.35,
        facet: 0.12,
        edgeBoost: 0.32,
        gridDensity: 0.4,
        sparkle: 0.44,
    },
    Clouds: {
        colorA: '#d4d6de',
        colorB: '#b2c3d9',
        geomDensity: 0.62,
        facet: 0.38,
        edgeBoost: 0.56,
        gridDensity: 0.58,
        sparkle: 0.2,
    },
    Rain: {
        colorA: '#8fb9d8',
        colorB: '#a8ffd3',
        geomDensity: 0.72,
        facet: 0.56,
        edgeBoost: 0.66,
        gridDensity: 0.74,
        sparkle: 0.26,
    },
    Thunder: {
        colorA: '#7f9a55',
        colorB: '#e7ff85',
        geomDensity: 0.92,
        facet: 0.85,
        edgeBoost: 0.95,
        gridDensity: 0.9,
        sparkle: 0.6,
    },
    Snow: {
        colorA: '#ecf8ff',
        colorB: '#bff6ff',
        geomDensity: 0.58,
        facet: 0.28,
        edgeBoost: 0.52,
        gridDensity: 0.5,
        sparkle: 0.78,
    },
    Night: {
        colorA: '#5f6f8f',
        colorB: '#d5ff90',
        geomDensity: 0.82,
        facet: 0.68,
        edgeBoost: 0.86,
        gridDensity: 0.86,
        sparkle: 0.34,
    },
};

export default function Planet() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { githubActivityLevel, weather } = useStore();
    // Reusable color to avoid per-frame allocation
    const _tempColorA = useMemo(() => new THREE.Color(), []);
    const _tempColorB = useMemo(() => new THREE.Color(), []);

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
            uGeomDensity: { value: 0.4 },
            uFacet: { value: 0.2 },
            uEdgeBoost: { value: 0.4 },
            uGridDensity: { value: 0.5 },
            uSparkle: { value: 0.3 },
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

        const visual = WEATHER_VISUALS[weather] ?? WEATHER_VISUALS.Clear;

        _tempColorA.set(visual.colorA);
        _tempColorB.set(visual.colorB);
        material.uniforms.uColorA.value.lerp(_tempColorA, 0.05);
        material.uniforms.uColorB.value.lerp(_tempColorB, 0.05);

        material.uniforms.uGeomDensity.value = THREE.MathUtils.lerp(material.uniforms.uGeomDensity.value, visual.geomDensity, 0.05);
        material.uniforms.uFacet.value = THREE.MathUtils.lerp(material.uniforms.uFacet.value, visual.facet, 0.05);
        material.uniforms.uEdgeBoost.value = THREE.MathUtils.lerp(material.uniforms.uEdgeBoost.value, visual.edgeBoost, 0.05);
        material.uniforms.uGridDensity.value = THREE.MathUtils.lerp(material.uniforms.uGridDensity.value, visual.gridDensity, 0.05);
        material.uniforms.uSparkle.value = THREE.MathUtils.lerp(material.uniforms.uSparkle.value, visual.sparkle, 0.05);

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