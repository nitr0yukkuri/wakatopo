export const sunVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const sunFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uSunColor;
  uniform vec3 uRayColor;
  
  #define PI 3.14159265359

  // SDF for a circle
  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  // 2D Rotation matrix
  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    // Center UVs from -1.0 to 1.0
    vec2 p = (vUv - 0.5) * 2.0;

    // --- Sun Body ---
    // Smooth circle for the main sun body
    float dSun = sdCircle(p, 0.4);
    // Anti-aliased step for crisp illustration edge
    float sunMask = 1.0 - smoothstep(0.0, 0.01, dSun);

    // --- Sun Rays ---
    // Rotate UV space slowly over time for the rays
    vec2 pRays = rot(uTime * 0.2) * p;
    
    // Calculate polar coordinates for rays
    float angle = atan(pRays.y, pRays.x);
    float radius = length(pRays);
    
    // Create 8 rays using sine wave on the angle
    // smoothstep creates the gap between rays
    float rayPattern = sin(angle * 8.0);
    float rayMask = smoothstep(0.6, 0.65, rayPattern);
    
    // Distance limits for rays (start outside sun, end further out)
    float distanceMask = smoothstep(0.45, 0.5, radius) * (1.0 - smoothstep(0.7, 0.8, radius));
    
    // Make the ray ends rounded (approximate by modifying the distance mask based on angle)
    float finalRayMask = rayMask * distanceMask;

    // Combine colors
    // We want a transparent background where there is neither sun nor rays
    vec3 color = vec3(0.0);
    float alpha = 0.0;

    if (sunMask > 0.0) {
        color = uSunColor;
        alpha = sunMask;
    } else if (finalRayMask > 0.0) {
        color = uRayColor;
        alpha = finalRayMask;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;
