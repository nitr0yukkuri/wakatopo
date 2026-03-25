export const vertexShader = `
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float uTime;
uniform float uActivity;
uniform float uIntro;
uniform float uHover;
uniform float uActive;
uniform float uGeomDensity;
uniform float uFacet;

// Simple Perlin Noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // 非常に細かいノイズ（結晶のような輝き用）
  float freq = mix(7.0, 18.0, uGeomDensity);
  float noise = snoise(position * freq + uTime * 0.05);
  float bands = mix(4.0, 24.0, uFacet);
  float faceted = floor((noise * 0.5 + 0.5) * bands) / bands;
  faceted = faceted * 2.0 - 1.0;
  float geomNoise = mix(noise, faceted, uFacet);
  
  // ホバー時とアクティブ時でノイズの強さを変える（触ると波立つ感じ）
  float dynamicActivity = uActivity * 0.03 + uHover * 0.015 + uActive * 0.03;
  vDisplacement = geomNoise * (0.01 + dynamicActivity + (uGeomDensity * 0.01));
  
  // 触った時に少し膨らむ
  float scale = 0.8 + 0.2 * uIntro + uActive * 0.02 + uHover * 0.01;
  vec3 animatedPos = position * scale;
  vec3 newPosition = animatedPos + normal * vDisplacement;
  
  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const fragmentShader = `
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIntro;
uniform float uHover;
uniform float uActive;
uniform float uEdgeBoost;
uniform float uGridDensity;
uniform float uSparkle;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // 極細のフレネル（エッジ強調）
  // ホバーやアクティブでフチの光を鋭く・太くする
  float fresnelPower = 5.0 - (uHover * 1.5) - (uActive * 2.5) - (uEdgeBoost * 1.3);
  float fresnel = pow(1.0 - dot(normal, viewDir), max(1.0, fresnelPower));
  
  // 走査線グリッド（Kajita風デザイン）
  // 触るとグリッドが光る
  float gridFreq = mix(90.0, 240.0, uGridDensity);
  float gridThresh = 0.985 - (uHover * 0.005) - (uActive * 0.01) - (uGridDensity * 0.01);
  float grid = step(gridThresh, fract(vUv.y * gridFreq)) * (0.2 + uHover * 0.2 + uActive * 0.5 + uGridDensity * 0.22);
  float gridV = step(0.99 - uGridDensity * 0.01, fract(vUv.x * (gridFreq * 0.9))) * (0.1 + uHover * 0.1 + uActive * 0.3 + uGridDensity * 0.12);
  
  // 半透明のクリスタル感
  vec3 baseColor = mix(uColorA, uColorB, 0.1);
  
  // 発光色をインタラクションで強調
  vec3 glowColor = mix(uColorB, vec3(1.0, 1.0, 1.0), uHover * 0.5); // ホバーで白っぽく
  glowColor = mix(glowColor, vec3(0.5, 1.0, 0.8), uActive * 0.8);      // タッチで明るいシアングリーンに
  
  float sparkle = smoothstep(0.84, 1.0, sin((vUv.x + vUv.y + uTime * 0.12) * 34.0) * 0.5 + 0.5) * uSparkle;
  vec3 finalColor = baseColor + (glowColor * fresnel * (2.2 + uEdgeBoost));
  finalColor += (grid + gridV) * glowColor;
  finalColor += glowColor * sparkle * 0.45;
  
  // 導入時のフェード
  float alpha = (fresnel * (0.75 + uEdgeBoost * 0.3) + 0.1 + uHover * 0.2 + uActive * 0.4) * uIntro;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;