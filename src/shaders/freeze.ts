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

void main() {
    vec2 st = vUv;
    
    // Distance from edges (0.0 at edge, 1.0 at center)
    // We want frost to start at 0.0 (edge) and move to 1.0
    float distFromCenter = distance(st, vec2(0.5)) * 2.0; 
    
    // uTime represents freezing progress (0.0 to ~2.0)
    // Scale uTime so it quickly covers the screen
    float freezeProgress = uTime * 1.5;
    
    // Generate complex frost crystal patterns
    float frostPattern = fbm(st * 15.0);
    float frostPatternLarge = fbm(st * 3.0);
    
    // Combined detail
    float detail = (frostPattern * 0.7 + frostPatternLarge * 0.3);
    
    // Calculate if this specific pixel is frozen based on distance from center + noise
    // Progress starts at edges (distFromCenter = 1.0) and moves inward (distFromCenter = 0.0)
    // We use freezeProgress to overcome the distance constraint
    
    float threshold = freezeProgress - (1.0 - distFromCenter * 0.5) - detail * 0.4;
    
    // frozen = 1 when threshold > 0, else 0
    float frozenAlpha = 1.0 - smoothstep(0.0, 0.3, -threshold);
    
    // Ice color mix (Frost white edges, deep blue center/solid ice)
    vec3 mixColor = mix(uColor2, uColor1, distFromCenter * 0.5 + detail * 0.2);
    
    // Add glowing frost tips
    float glow = 1.0 - smoothstep(0.0, 0.1, abs(threshold));
    
    // Total alpha: 1.0 if frozen, else 0.0, with soft bright edges
    float alpha = max(frozenAlpha, glow * 1.2);
    
    gl_FragColor = vec4(mixColor + glow * uColor2, alpha);
}
`;
