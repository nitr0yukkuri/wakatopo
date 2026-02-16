'use client'

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '@/store';

// === シェーダー定義 (画面付着エフェクト用) ===

// 画面全体を覆う Vertex Shader
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  // カメラの動きを無視して画面全体に貼り付ける
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// ノスタルジックな濡れ方を表現する Fragment Shader
const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

// 乱数生成
float N21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

// 水滴レイヤー関数
float Layer(vec2 uv, float t) {
    vec2 aspect = vec2(2.0, 1.0);
    vec2 uv2 = uv * aspect * 5.0;
    uv2.y += t * 0.25; 
    vec2 gv = fract(uv2) - 0.5;
    vec2 id = floor(uv2);
    float n = N21(id);
    t += n * 6.2831;
    
    // 水滴の形状と動き
    float w = uv.y * 10.0;
    float x = (n - 0.5) * 0.8;
    x += (0.4 - abs(x)) * sin(3.0 * w) * pow(sin(w), 6.0) * 0.45;
    float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.45;
    y -= (gv.x - x) * (gv.x - x);
    
    // ドロップ（水滴本体）：輪郭を少しぼかして柔らかく
    vec2 dropPos = (gv - vec2(x, y)) / aspect;
    float drop = smoothstep(0.05, 0.02, length(dropPos));
    
    // トレイル（軌跡）：長く残り、滲むように
    vec2 trailPos = (gv - vec2(x, t * 0.25)) / aspect;
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trail = smoothstep(0.03, 0.01, length(trailPos));
    
    // 軌跡の残像感を強める
    trail *= smoothstep(-0.05, 0.05, dropPos.y);
    trail *= smoothstep(0.5, y, gv.y);
    
    return drop + trail;
}

void main() {
    vec2 uv = vUv;
    float t = uTime;
    
    // 複数のレイヤーで奥行きのある濡れ方を表現
    float drops = Layer(uv, t);
    drops += Layer(uv * 1.23 + 7.54, t);
    drops += Layer(uv * 0.57 + 1.23, t) * 0.5; // 小さな水滴
    
    // ノイズ（フィルムグレイン・結露感）
    float noise = N21(uv + t * 0.05);
    
    // 画面全体を少し「湿気」で曇らせる（Base Fog）
    float condensation = smoothstep(0.0, 1.0, noise) * 0.15;
    
    // 色収差（Chromatic Aberration）のシミュレーション
    // 水滴のエッジにわずかにRGBのズレを生じさせて、ガラス越しの質感を出す
    vec3 rainColor = vec3(0.8, 0.9, 0.95);
    float aberration = drops * 0.02;
    vec3 col = vec3(0.0);
    
    col.r = smoothstep(0.0, 1.0, drops + aberration);
    col.g = smoothstep(0.0, 1.0, drops);
    col.b = smoothstep(0.0, 1.0, drops - aberration);
    
    // 色味の調整（シアン・ブルー寄りの冷たい色）
    col *= vec3(0.7, 0.9, 1.0); 
    
    // ビネット効果（画面端を暗く、濡れたレンズのように）
    float vig = 1.0 - length(uv * 2.0 - 1.0) * 0.6;
    
    // 最終的なアルファとカラー合成
    // 水滴がない部分も完全な透明にせず、湿気（condensation）を残す
    float alpha = (drops * 0.6) + (condensation * 0.4); 
    alpha = clamp(alpha, 0.0, 0.8); // 濃くなりすぎないように制限
    
    // 背景を暗く落とすフィルター効果
    vec3 finalColor = mix(vec3(0.05, 0.1, 0.15), col, drops); 
    finalColor += (noise * 0.05); // グレインを加算

    gl_FragColor = vec4(finalColor * vig, alpha * vig);
}
`;

export default function Weather() {
    const { weather } = useStore();

    const linesRef = useRef<THREE.LineSegments>(null);
    const screenRef = useRef<THREE.ShaderMaterial>(null);

    // === 1. 空間の雨 (Spatial Rain) ===
    // より繊細で鋭い雨に変更
    const count = 800;
    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 2 * 3);
        const vels = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 60;
            // 長さを長く、針のように
            const length = 2.0 + Math.random() * 3.0;
            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;
            pos[i * 6 + 3] = x;
            pos[i * 6 + 4] = y - length;
            pos[i * 6 + 5] = z;
            // 速度差をつけて奥行きを出す
            vels[i] = 0.8 + Math.random() * 0.8;
        }
        return { positions: pos, velocities: vels };
    }, []);

    useFrame((state) => {
        if (weather !== 'Rain') return;
        const time = state.clock.getElapsedTime();

        // A. 空間の雨のアニメーション
        if (linesRef.current) {
            const positionsAttribute = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const array = positionsAttribute.array as Float32Array;
            for (let i = 0; i < count; i++) {
                const vel = velocities[i];
                array[i * 6 + 1] -= vel;
                array[i * 6 + 4] -= vel;
                if (array[i * 6 + 1] < -20) {
                    const resetY = 20 + Math.random() * 10;
                    const length = array[i * 6 + 1] - array[i * 6 + 4];
                    array[i * 6 + 1] = resetY;
                    array[i * 6 + 4] = resetY - length;
                }
            }
            positionsAttribute.needsUpdate = true;
        }

        // B. 画面の水滴のアニメーション
        if (screenRef.current) {
            screenRef.current.uniforms.uTime.value = time;
        }
    });

    return (
        <group visible={weather === 'Rain'}>
            {/* 1. 空間に降る雨：鋭いシアンの針 */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#ccffff"
                    transparent
                    opacity={0.3} // 薄くして背景を邪魔しない
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </lineSegments>

            {/* 2. 画面に張り付く水滴フィルター */}
            <mesh frustumCulled={false}>
                <planeGeometry args={[2, 2]} />
                <shaderMaterial
                    ref={screenRef}
                    transparent
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={{ uTime: { value: 0 } }}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}