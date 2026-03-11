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

// Simple 2D noise for the frost texture
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

// Fractal Brownian Motion for frosty details
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

void main() {
    vec2 st = vUv;
    vec2 center = vec2(0.5);
    float dist = distance(st, center) * 2.0; // 0.0 at center, 1.0 at edges

    // Frost crystallization growing outward
    // uTime controls the growth speed (0.0 to ~2.0)
    float growth = uTime * 1.2; 
    
    // Add fractal noise for jagged, crystal-like edges
    float frostPattern = fbm(st * 10.0);
    
    // The "front" of the freezing wave creates an icy ring
    float freezeFront = smoothstep(growth - 0.4, growth, dist - frostPattern * 0.3);
    float frozen = 1.0 - smoothstep(growth - 0.1, growth, dist - frostPattern * 0.3);
    
    // As it freezes, it transitions from transparent to Frost White (icing over),
    // and then settles into a Deep Ice Blue
    vec3 mixColor = mix(uColor2, uColor1, frozen * 0.8);
    
    // Calculate final alpha
    // Transparent where not frozen yet, opaque where frozen
    float alpha = 1.0 - smoothstep(growth - 0.2, growth, dist - frostPattern * 0.3);
    
    // Add a glowing icy edge
    float distFromGrowth = abs(dist - frostPattern * 0.3 - growth);
    float glow = 1.0 - smoothstep(0.0, 0.1, distFromGrowth);
               
    alpha = max(alpha, glow * 1.5);

    gl_FragColor = vec4(mixColor + glow * uColor2, alpha);
}
`;
