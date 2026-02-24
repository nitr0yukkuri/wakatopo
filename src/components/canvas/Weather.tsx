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

// 乱数生成（複数用意してバリエーションを出す）
float N21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}

// より有機的でリアルな水滴の動き
float Layer(vec2 uv, float t) {
    vec2 aspect = vec2(2.0, 1.0);
    vec2 uv2 = uv * aspect * 4.0; // グリッドを少し大きくして密度調整
    uv2.y += t * 0.15; // 全体の落ちる基本速度を少し遅く（重さ・粘度の表現）
    vec2 gv = fract(uv2) - 0.5;
    vec2 id = floor(uv2);
    float n = N21(id);
    t += n * 6.2831;
    
    // 水滴が蛇行しながら落ちる動き（より不規則に）
    float w = uv.y * 10.0;
    float x = (n - 0.5) * 0.8; 
    
    // スピードに緩急をつける（途中で一瞬引っかかるような動き）
    float fallSpeed = t + sin(t + sin(t) * 0.5) * 0.8;
    float y = -sin(fallSpeed) * 0.45;
    
    // 左右の揺れ（重力に逆らう小さな摩擦を表現）
    x += (0.4 - abs(x)) * sin(3.0 * w + n * 10.0) * pow(sin(w), 6.0) * 0.3;
    
    // 水滴の形状を少し重力で下膨れに変形させる
    y -= (gv.x - x) * (gv.x - x) * 2.0;
    
    // ドロップ本体（ハイライトを少し鋭く、エッジをシャープに）
    vec2 dropPos = (gv - vec2(x, y)) / aspect;
    dropPos.y *= 1.2; // 縦長に
    float drop = smoothstep(0.04, 0.01, length(dropPos));
    
    // ドロップ内部のハイライト反射っぽさ
    float highlight = smoothstep(0.02, 0.005, length(dropPos - vec2(-0.01, 0.01))) * drop;
    drop += highlight * 0.5;

    // トレイル（軌跡）：かすれながら残り、滲むように（よりリアルな水筋）
    vec2 trailPos = (gv - vec2(x, t * 0.15)) / aspect;
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trail = smoothstep(0.02, 0.005, length(trailPos));
    
    // 軌跡が途切れたり、太さが変わるような不規則性
    float trailWobble = sin(gv.y * 30.0 + n * 10.0) * 0.5 + 0.5;
    trail *= trailWobble * 0.8 + 0.2;
    
    // 軌跡の残像感を強める
    trail *= smoothstep(-0.05, 0.05, dropPos.y); 
    trail *= smoothstep(0.4, y, gv.y); 
    
    return drop + trail * 0.6; // トレイルは本滴より少し薄く
}

void main() {
    vec2 uv = vUv;
    float t = uTime;
    
    // 複数のレイヤーで奥行き・大小のあるリアルな濡れ方を表現
    float drops = Layer(uv, t); // メインの大きな水滴
    drops += Layer(uv * 1.35 + 7.54, t * 1.2) * 0.8; // 中くらいの水滴（少し速い）
    drops += Layer(uv * 2.5 + 1.23, t * 0.8) * 0.5; // 小さな細かい水滴（遅い）
    
    // 背景の微細なノイズ（フィルムグレイン・結露感）
    float noise = N21(uv * 5.0 + t * 0.01);
    
    // 画面全体を少し「湿気」で曇らせる（Base Fog）
    float condensation = smoothstep(0.0, 1.0, noise) * 0.3;
    
    // 色収差（Chromatic Aberration）と屈折のシミュレーション
    // 古いレンズ越しのような強めのRGBズレと歪曲
    float aberration = drops * 0.06;
    vec3 col = vec3(0.0);
    
    // 水滴部分を少し明るくしてハイライトを強調
    float brightness = drops * 1.2;
    
    col.r = smoothstep(0.0, 1.0, brightness + aberration);
    col.g = smoothstep(0.0, 1.0, brightness);
    col.b = smoothstep(0.0, 1.0, brightness - aberration * 1.5); // 青のズレを少し大きく
    
    // 色味の調整（ノスタルジック、少し色褪せたセピア/アンバー調）
    col *= vec3(1.1, 0.85, 0.65); 
    
    // ビネット効果（画面端を暗く、古いレンズの色落ちのように）
    vec2 centerUv = uv * 2.0 - 1.0;
    float vig = 1.0 - length(centerUv) * 0.7;
    // 画面端の滲み（ぼやけ感の代用として暗さを追加）
    float edgeSoft = smoothstep(1.5, 0.0, length(centerUv));
    vig = smoothstep(0.0, 1.2, vig) * edgeSoft;
    
    // 最終的なアルファとカラー合成
    // 水滴がない部分も完全な透明にせず、湿気（condensation）を残す
    float alpha = (drops * 0.85) + (condensation * 0.6); 
    alpha = clamp(alpha, 0.0, 0.9); // 濃くなりすぎないように制限
    
    // 背景を暗く落とすフィルター効果（ウォームグレー基調で古いフィルム感を出す）
    vec3 baseColor = vec3(0.15, 0.11, 0.08); // 少し茶褐色寄り
    vec3 finalColor = mix(baseColor, col, clamp(drops * 1.5, 0.0, 1.0)); 
    
    // フィルムグレインの加算
    finalColor += (noise * 0.1); 
    
    // コントラスト調整（少しパキッとさせる）
    finalColor = smoothstep(0.0, 1.1, finalColor);

    gl_FragColor = vec4(finalColor * vig, alpha * vig);
}
`;

export default function Weather() {
    const { weather } = useStore();

    const linesRef = useRef<THREE.LineSegments>(null);
    const screenRef = useRef<THREE.ShaderMaterial>(null);

    // === 1. 空間の雨 (Spatial Rain) ===
    // ノスタルジックな雰囲気を出すための調整
    const count = 1200; // 雨の量を増やす
    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 2 * 3);
        const vels = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 60;

            // 長さと風の影響（斜めに降る）
            const length = 1.5 + Math.random() * 2.5;
            const windX = 0.4 + Math.random() * 0.2; // 右方向への風
            const windZ = 0.1 + Math.random() * 0.1; // 奥方向への風

            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;
            pos[i * 6 + 3] = x - windX * length;  // 始点と終点をずらして斜めに
            pos[i * 6 + 4] = y - length;
            pos[i * 6 + 5] = z - windZ * length;

            // 速度差をつけて奥行きを出す
            vels[i] = 1.0 + Math.random() * 1.5;
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
                const velY = velocities[i];
                const velX = velY * 0.4; // 速度に応じた横移動
                const velZ = velY * 0.1; // 速度に応じた奥移動

                array[i * 6 + 0] += velX; // x1
                array[i * 6 + 1] -= velY; // y1
                array[i * 6 + 2] += velZ; // z1
                array[i * 6 + 3] += velX; // x2
                array[i * 6 + 4] -= velY; // y2
                array[i * 6 + 5] += velZ; // z2

                if (array[i * 6 + 1] < -20) {
                    const resetY = 20 + Math.random() * 10;
                    const lengthX = array[i * 6 + 0] - array[i * 6 + 3];
                    const lengthY = array[i * 6 + 1] - array[i * 6 + 4];
                    const lengthZ = array[i * 6 + 2] - array[i * 6 + 5];

                    // xとzもリセットして範囲内に収める
                    const resetX = (Math.random() - 0.5) * 60;
                    const resetZ = (Math.random() - 0.5) * 60;

                    array[i * 6 + 0] = resetX;
                    array[i * 6 + 1] = resetY;
                    array[i * 6 + 2] = resetZ;
                    array[i * 6 + 3] = resetX - lengthX;
                    array[i * 6 + 4] = resetY - lengthY;
                    array[i * 6 + 5] = resetZ - lengthZ;
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
            {/* 1. 空間に降る雨：ノスタルジックな暖色 */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <lineBasicMaterial
                    color="#e0d8c8"
                    transparent
                    opacity={0.4}
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