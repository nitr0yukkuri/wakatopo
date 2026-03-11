export const waveVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const waveFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
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

void main() {
    vec2 st = vUv;
    vec2 distVec = st - vec2(0.5);
    // Expand to fit wider screens cleanly
    distVec.x *= 2.0; 
    float dist = length(distVec);
    
    // Wave ripples expanding outwards
    // Distance field with time offset
    float waveDist = dist * 20.0 - (uTime * 15.0);
    float wave = sin(waveDist) * 0.5 + 0.5;
    
    // Glitch / frequency effect overlay
    float freq = noise(vec2(st.y * 50.0, uTime * 10.0));
    wave *= smoothstep(0.2, 0.8, freq);
    
    // Progress of the transition (0.0 -> 1.0)
    // Scale time so it floods the screen by t=1.5
    float progress = smoothstep(0.0, 1.5, uTime); 
    
    // Flood the screen from center
    float flood = smoothstep(progress * 1.5, progress * 1.5 - 0.2, dist);
    
    // Combine
    float alpha = max(wave * (1.0 - flood) * smoothstep(0.0, 0.2, progress), flood);
    
    vec3 finalColor = mix(vec3(0.0), uColor, alpha);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;
