export const freezeVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const freezeFragmentShader = `
uniform float uTime;
uniform vec3 uColor1; // Deep Ice Blue
uniform vec3 uColor2; // Frost White
varying vec2 vUv;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st = rot * st * 2.0 + shift;
        amplitude *= 0.5;
    }
    return value;
}

float crystalLine(vec2 uv, vec2 a, vec2 b, float width) {
    vec2 pa = uv - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return 1.0 - smoothstep(width, width + 0.01, length(pa - ba * h));
}

void main() {
    vec2 st = vUv;
    float distFromCenter = distance(st, vec2(0.5)) * 2.0; 
    float freezeProgress = uTime * 1.5;
    float frostPattern = fbm(st * 15.0);
    float frostPatternLarge = fbm(st * 3.0);
    float detail = (frostPattern * 0.68 + frostPatternLarge * 0.32);
    float threshold = freezeProgress - (1.0 - distFromCenter * 0.52) - detail * 0.38;
    float frozenMask = 1.0 - smoothstep(-0.08, 0.26, -threshold);
    float crystalA = crystalLine(st, vec2(0.18, 0.82), vec2(0.45, 0.46), 0.004);
    float crystalB = crystalLine(st, vec2(0.72, 0.20), vec2(0.48, 0.54), 0.003);
    float crystalC = crystalLine(st, vec2(0.12, 0.52), vec2(0.34, 0.58), 0.0025);
    float crystals = max(crystalA * 0.55, max(crystalB * 0.46, crystalC * 0.34));
    float cloudyCore = smoothstep(0.22, 0.92, frostPatternLarge) * (1.0 - smoothstep(0.0, 0.7, distFromCenter));
    vec3 baseIce = mix(uColor2, vec3(0.72, 0.88, 0.98), detail * 0.55);
    vec3 depthTint = mix(baseIce, uColor1, distFromCenter * 0.42 + detail * 0.16);
    vec3 color = mix(baseIce, depthTint, frozenMask * 0.65);
    color += vec3(0.90, 0.97, 1.0) * crystals * frozenMask * 0.42;
    color += vec3(0.82, 0.92, 1.0) * cloudyCore * frozenMask * 0.18;
    float glow = 1.0 - smoothstep(0.0, 0.085, abs(threshold));
    float alpha = frozenMask * 0.34 + glow * 0.16 + crystals * frozenMask * 0.08;
    gl_FragColor = vec4(color + glow * uColor2 * 0.35, clamp(alpha, 0.0, 0.5));
}
`;
