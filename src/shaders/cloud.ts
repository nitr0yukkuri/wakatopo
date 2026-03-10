export const cloudVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // For billboarding (always facing camera), we remove the rotation from the modelViewMatrix
    // and rely on InstancedMesh positions to place the quads flat to the screen.
    // We assume the InstancedMesh only provides translation and scale in instanceMatrix,
    // and we want it to face the camera directly.
    
    // Standard instanced positioning
    mat4 instanceMVP = projectionMatrix * viewMatrix * instanceMatrix * modelMatrix;
    gl_Position = instanceMVP * vec4(position, 1.0);
    
    // Alternatively, for perfect billboarding we could reconstruct the matrix,
    // but applying standard rendering to PlaneGeometry with no rotation works if the parent doesn't rotate them wildly.
  }
`;

export const cloudFragmentShader = `
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uOutlineColor;

  float sdCircle( vec2 p, float r ) {
    return length(p) - r;
  }

  // Smooth min for blending shapes together organically
  float smin( float a, float b, float k ) {
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
  }

  void main() {
    // UV centered -1 to 1 based on Plane/Quad
    vec2 p = (vUv - 0.5) * 2.0;
    
    // Subtle waving motion to make the clouds feel "alive" but gentle
    p.y += sin(p.x * 2.0 + uTime * 0.5) * 0.05;
    p.x += cos(p.y * 2.0 + uTime * 0.5) * 0.05;

    // Construct a cloud shape using several SDF circles
    // Base fluffy parts
    float d1 = sdCircle(p - vec2(-0.35, 0.1), 0.35);
    float d2 = sdCircle(p - vec2(0.35, 0.1), 0.35);
    float d3 = sdCircle(p - vec2(0.0, 0.3), 0.45);
    
    // Bottom filler parts
    float d4 = sdCircle(p - vec2(-0.2, -0.1), 0.3);
    float d5 = sdCircle(p - vec2(0.2, -0.1), 0.3);

    // Combine them smoothly
    float dCloud = smin(d1, d2, 0.1);
    dCloud = smin(dCloud, d3, 0.1);
    dCloud = smin(dCloud, d4, 0.1);
    dCloud = smin(dCloud, d5, 0.1);

    // Flatten bottom slightly if needed, but smin usually looks good enough for a fluffy shape.
    
    // Outline thickness
    float outlineWidth = 0.06;
    
    // Anti-aliased edges
    float aa = 0.02;
    
    // Cloud interior mask
    float innerMask = 1.0 - smoothstep(0.0, aa, dCloud);
    
    // Outline mask (slightly larger distance)
    float outerMask = 1.0 - smoothstep(0.0, aa, dCloud - outlineWidth);
    
    // The outline is where outerMask is 1 but innerMask is 0
    float outline = outerMask - innerMask;
    
    vec3 finalColor = vec3(0.0);
    float finalAlpha = 0.0;

    if (innerMask > 0.01) {
        finalColor = uBaseColor;
        finalAlpha = innerMask;
    } else if (outerMask > 0.01) {
        finalColor = uOutlineColor;
        finalAlpha = outerMask;
    }

    if (finalAlpha < 0.01) discard;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;
