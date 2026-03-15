export const waveVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const waveFragmentShader = `
uniform float uTime;
uniform vec3 uColorDeep;
uniform vec3 uColorShallow;
varying vec2 vUv;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    vec2 u = f*f*(3.0-2.0*f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float fbm(in vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(st);
        st = rot * st * 2.0 + vec2(19.0, 27.0);
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    vec2 st = vUv;
    float t = uTime * 0.28;

    // Gentle sea surface distortion
    vec2 flow = vec2(
        sin(st.y * 7.5 + t * 3.2) * 0.022,
        cos(st.x * 8.5 - t * 2.4) * 0.018
    );
    vec2 uv = st + flow;

    // Depth gradient (top: light, bottom: deep)
    float depth = smoothstep(0.0, 1.0, uv.y);

    // Slow wave bands
    float swellA = sin((uv.x * 10.0) + t * 5.4 + sin(uv.y * 6.0 + t)) * 0.5 + 0.5;
    float swellB = sin((uv.y * 12.5) - t * 3.3 + sin(uv.x * 5.0 - t * 0.7)) * 0.5 + 0.5;
    float swell = mix(swellA, swellB, 0.45);

    // Soft caustics
    float caustic = fbm(uv * 6.0 + vec2(t * 1.0, -t * 0.8));
    caustic += fbm(uv * 12.0 - vec2(t * 1.7, t * 1.2)) * 0.45;
    caustic = smoothstep(0.58, 1.15, caustic);

    vec3 ocean = mix(uColorShallow, uColorDeep, depth * 0.9);
    ocean = mix(ocean, uColorShallow, swell * 0.12);
    ocean += vec3(0.74, 0.94, 0.96) * caustic * 0.18;

    // Vignette for underwater immersion
    vec2 d = uv - vec2(0.5);
    d.x *= 1.15;
    float vignette = smoothstep(0.95, 0.22, length(d));
    ocean *= vignette + 0.08;

    // Transition fill timing: quick but smooth
    float fill = smoothstep(0.02, 0.85, uTime);
    float alpha = 0.92 * fill;

    gl_FragColor = vec4(ocean, alpha);
}
`;
