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
    
    // 風の影響で水を右斜め下へ流す（雨の降る角度「0.4」と完全に一致させる）
    uv.x += uv.y * 0.4; 
    
    vec2 uv2 = uv * aspect * 4.0; // グリッドを少し大きくして密度調整
    
    // ベースとなる落下スピード（絶対に上にいかないよう単調に増やす）
    uv2.y += t * 0.25; 
    
    vec2 gv = fract(uv2) - 0.5;
    vec2 id = floor(uv2);
    float n = N21(id);
    t += n * 6.2831;
    
    // 水滴の蛇行揺らぎ用の変数
    float w = uv2.y * 10.0;
    float x = (n - 0.5) * 0.8; 
    
    // ★水滴の不規則な速度変化
    // t + sin(t) は導関数が 1 + cos(t) なので絶対にマイナス（逆流）にならない
    float fallSpeed = t * 1.5 + sin(t * 1.5) * 0.8;
    
    // -fract でセルの上から下に落ちてループ
    float y = -fract(fallSpeed) * 1.5 + 0.5; 
    
    // 左右の揺れ（重力に逆らう小さな摩擦を表現）
    x += (0.4 - abs(x)) * sin(3.0 * w + n * 10.0) * pow(sin(w), 6.0) * 0.3;
    
    // 水滴の形状を少し重力で下膨れに変形させる
    y -= (gv.x - x) * (gv.x - x) * 2.0;
    
    // ----------------------------
    // 1. メインのドロップの描画（法線マップ風フェイクによる超リアルな質感）
    // ----------------------------
    vec2 dropPos = (gv - vec2(x, y)) / aspect;
    dropPos.y *= 1.3; // 縦長に
    float dropDist = length(dropPos);
    
    // スムースステップの幅を狭くしてシャープな輪郭に
    float dropMask = smoothstep(0.04, 0.01, dropDist);
    
    // 球体のような法線をフェイク生成してレンズ効果を作る
    vec2 normal = dropPos * 25.0; 
    float nz = sqrt(clamp(1.0 - dot(normal, normal), 0.0, 1.0));
    vec3 nVec = normalize(vec3(normal, nz));
    
    // 光源のベクトル（斜め上奥から）
    vec3 lightDir = normalize(vec3(-0.5, 0.5, 0.6));
    float diffuse = max(dot(nVec, lightDir), 0.0);
    // 鋭いスペキュラー（ハイライト）
    float specular = pow(max(dot(reflect(-lightDir, nVec), vec3(0.0, 0.0, 1.0)), 0.0), 40.0);
    
    // 環境光によるエッジの暗みき（全反射の表現でガラス感を出す）
    float rim = smoothstep(0.5, 1.0, 1.0 - max(dot(nVec, vec3(0.0, 0.0, 1.0)), 0.0));
    
    // 質感を合成
    float drop = dropMask * (diffuse * 0.5 + specular * 2.0 - rim * 0.4);
    drop = clamp(drop, 0.0, 1.0);

    // ----------------------------
    // 2. トレイル（軌跡）の描画：細かな残滓の水滴たち
    // ----------------------------
    vec2 trailPos = (gv - vec2(x, t * 0.2)) / aspect;
    trailPos.y = (fract(trailPos.y * 8.0) - 0.5) / 8.0;
    float trailDist = length(trailPos);
    
    float trailMask = smoothstep(0.015, 0.005, trailDist);
    
    // トレイルにも小さなスペキュラーを適用
    vec2 trNormal = trailPos * 40.0;
    float trNz = sqrt(clamp(1.0 - dot(trNormal, trNormal), 0.0, 1.0));
    vec3 trNVec = normalize(vec3(trNormal, trNz));
    float trSpecular = pow(max(dot(reflect(-lightDir, trNVec), vec3(0.0, 0.0, 1.0)), 0.0), 30.0);
    
    float trail = trailMask * (0.2 + trSpecular * 1.5);
    
    float trailWobble = sin(gv.y * 30.0 + n * 10.0) * 0.5 + 0.5;
    trail *= trailWobble * 0.8 + 0.2;
    
    trail *= smoothstep(-0.05, 0.05, dropPos.y);  // 本体の上だけにトレイルを出す
    trail *= smoothstep(0.4, y, gv.y);            // 長すぎないようにカット
    
    // 動いているときだけトレイルを濃くする
    float speedDerivative = 1.5 + 1.2 * cos(t * 1.5);
    trail *= clamp(speedDerivative * 0.5, 0.1, 1.0);
    
    return drop + trail;
}

void main() {
    vec2 uv = vUv;
    float t = uTime * 0.8; // 全体的に少し早送り気味だったので0.8倍で落ち着かせる
    
    // 複数のレイヤーで奥行き・大小のあるリアルな濡れ方を表現
    float drops = Layer(uv, t); // メインの大きな水滴
    drops += Layer(uv * 1.35 + 7.54, t * 1.3) * 0.8; // 少し早い層
    drops += Layer(uv * 2.5 + 1.23, t * 0.8) * 0.4; // 細かく遅い層
    
    // 背景の微細なノイズ（フィルムグレイン・結露感）
    float noise = N21(uv * 5.0 + t * 0.01);
    float condensation = smoothstep(0.0, 1.0, noise) * 0.15; // 曇りを薄く
    
    // 色収差（水滴のレンズによる光の分散）
    float aberration = drops * 0.05;
    vec3 col = vec3(0.0);
    
    float brightness = drops * 1.5;
    
    // 水滴らしいクリーンな色（雪っぽさを消し、青白く澄んだ光に）
    col.r = smoothstep(0.0, 1.0, brightness + aberration);
    col.g = smoothstep(0.0, 1.0, brightness);
    col.b = smoothstep(0.0, 1.0, brightness - aberration * 2.5); // 青の屈折を強めに
    
    // 全体的な水の色味（クリアなシアンブルー寄り）
    col *= vec3(0.85, 0.95, 1.0); 
    
    // ビネット効果（四隅を暗く）
    vec2 centerUv = uv * 2.0 - 1.0;
    float vig = 1.0 - length(centerUv) * 0.7;
    float edgeSoft = smoothstep(1.5, 0.0, length(centerUv));
    vig = smoothstep(0.0, 1.2, vig) * edgeSoft;
    
    // ▼ ここで「湖底（Lake Bottom）」の効果を下部に追加 ▼
    float bottomDist = uv.y;
    float wave = sin(uv.x * 10.0 + t * 2.0) * cos(uv.x * 20.0 - t * 1.5) * 0.02;
    float lakeBottom = smoothstep(0.25 + wave, 0.0, bottomDist); 
    
    // 湖底の色（深くて青い光）
    vec3 lakeColor = vec3(0.0, 0.2, 0.45) + vec3(0.0, 0.1, 0.2) * sin(uv.x * 30.0 + t * 5.0);
    
    // 水滴のアルファ（透明度）を調整（ベースが透明になるように）
    float alpha = (drops * 0.9) + condensation; 
    alpha = clamp(alpha, 0.0, 0.9);
    
    alpha = max(alpha, lakeBottom * 0.7);

    // デフォルトの背景色（暗い空間の色）
    vec3 baseColor = mix(vec3(0.05, 0.07, 0.1), lakeColor, lakeBottom);
    
    // 光のきらめき（湖底の水面反射）
    float caustics = smoothstep(0.1, 0.3, lakeBottom) * smoothstep(0.3, 0.5, sin(uv.x * 40.0 + t * 4.0)) * 0.5;
    col += caustics * vec3(0.5, 0.8, 1.0) * lakeBottom;

    // ベース色に水滴の光沢を加算合成
    vec3 finalColor = mix(baseColor, col, clamp(drops * 2.0 + lakeBottom * 0.5, 0.0, 1.0)); 
    
    // フィルムグレインの加算
    finalColor += (noise * 0.05); 
    finalColor = smoothstep(0.0, 1.1, finalColor);

    gl_FragColor = vec4(finalColor * vig, alpha * vig);
}
`;

export default function Weather() {
    const { weather } = useStore();

    const linesRef = useRef<THREE.LineSegments>(null);
    const screenRef = useRef<THREE.ShaderMaterial>(null);

    // Memoize uniforms to avoid recreating on every render
    const screenUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
    const stepAccumulatorRef = useRef(0);
    const targetStep = 1 / 30;

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
            const windX = 0.4; // 風の影響(右方向) - 水滴シェーダーの角度 0.4 と完全に合わせる
            const windZ = 0.1; // 奥方向への風

            // 軌跡は進行方向と完全に一致させる（y2が下ならx2は右）
            pos[i * 6] = x;
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = z;
            pos[i * 6 + 3] = x + windX * length;
            pos[i * 6 + 4] = y - length;
            pos[i * 6 + 5] = z + windZ * length;

            // 速度差をつけて奥行きを出す
            vels[i] = 1.0 + Math.random() * 1.5;
        }
        return { positions: pos, velocities: vels };
    }, []);

    useFrame((state, delta) => {
        if (weather !== 'Rain') return;
        const time = state.clock.getElapsedTime();

        // Keep shader motion smooth even when heavy spatial updates are throttled.
        if (screenRef.current) {
            screenRef.current.uniforms.uTime.value = time;
        }

        stepAccumulatorRef.current += delta;
        if (stepAccumulatorRef.current < targetStep) return;
        const stepDelta = stepAccumulatorRef.current;
        stepAccumulatorRef.current = 0;

        // A. 空間の雨のアニメーション
        if (linesRef.current) {
            const positionsAttribute = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const array = positionsAttribute.array as Float32Array;
            for (let i = 0; i < count; i++) {
                const frameScale = stepDelta * 60;
                const velY = velocities[i] * frameScale;
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
                    uniforms={screenUniforms}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}