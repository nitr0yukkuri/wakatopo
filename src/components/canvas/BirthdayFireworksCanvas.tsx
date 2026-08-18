'use client';

import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float segmentDistance(vec2 point, vec2 startPoint, vec2 endPoint) {
    vec2 direction = endPoint - startPoint;
    float lengthSquared = max(dot(direction, direction), 0.000001);
    float projection = clamp(dot(point - startPoint, direction) / lengthSquared, 0.0, 1.0);
    return length(point - mix(startPoint, endPoint, projection));
}

vec3 burst(vec2 uv, vec2 origin, float clock, vec3 tint, float seed) {
    float cycle = mod(clock, 7.2);
    float launch = 1.0 - smoothstep(0.0, 0.92, cycle);
    float travelProgress = smoothstep(0.0, 0.92, cycle);
    vec2 launchStart = origin + vec2(0.0, -0.52);
    vec2 launchPoint = mix(launchStart, origin, travelProgress);
    vec3 result = vec3(0.0);

    // The projectile rises first, with a fading line behind its head.
    vec2 launchVector = launchPoint - launchStart;
    float launchLength = max(dot(launchVector, launchVector), 0.0001);
    float trailPosition = clamp(dot(uv - launchStart, launchVector) / launchLength, 0.0, 1.0);
    float trailDistance = segmentDistance(uv, launchStart, launchPoint);
    float trailBehind = 1.0 - smoothstep(max(0.0, travelProgress - 0.18), max(0.001, travelProgress), trailPosition);
    float trail = exp(-pow(trailDistance / 0.0045, 2.0)) * launch * trailBehind * 0.62;
    float ember = exp(-pow(length(uv - launchPoint) / 0.010, 2.0)) * launch;
    result += tint * (trail + ember);

    // Each firework is made from independent sparks with slight gravity and drag,
    // not perfect radial spokes.
    float explosion = clamp((cycle - 0.92) / 4.9, 0.0, 1.0);
    float fade = smoothstep(0.0, 0.10, explosion) * (1.0 - smoothstep(0.64, 1.0, explosion));
    for (int i = 0; i < 32; i++) {
        float particle = float(i);
        float randomAngle = hash21(vec2(particle + seed * 31.0, seed * 17.0));
        float randomSpeed = hash21(vec2(particle + seed * 47.0, seed * 23.0));
        float randomGravity = hash21(vec2(particle + seed * 59.0, seed * 29.0));
        float angle = randomAngle * 6.2831853;
        vec2 direction = vec2(cos(angle), sin(angle));
        float speed = 0.065 + randomSpeed * 0.155;
        float gravity = 0.060 + randomGravity * 0.055;
        float currentTime = explosion;
        float previousTime = max(0.0, currentTime - 0.045 - randomSpeed * 0.018);
        vec2 head = origin + direction * (speed * currentTime) + vec2(0.0, -gravity * currentTime * currentTime);
        vec2 tail = origin + direction * (speed * previousTime) + vec2(0.0, -gravity * previousTime * previousTime);
        float headGlow = exp(-pow(length(uv - head) / 0.0065, 2.0));
        float tailGlow = exp(-pow(segmentDistance(uv, tail, head) / 0.0038, 2.0));
        float twinkle = 0.68 + 0.32 * sin(uTime * (9.0 + randomGravity * 8.0) + particle * 2.7 + seed * 20.0);
        vec3 particleColor = mix(tint, vec3(1.0, 0.91, 0.68), 0.18 + randomAngle * 0.30);
        result += particleColor * (headGlow * 0.95 + tailGlow * 0.42) * twinkle * fade;
    }

    // A restrained central glow ties the individual sparks together.
    float halo = exp(-length(uv - origin) * 22.0) * fade * 0.10;
    return result + tint * halo;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    vec3 color = vec3(0.0);

    color += burst(centered, vec2((0.21 - 0.5) * aspect, 0.68 - 0.5), uTime, vec3(1.0, 0.67, 0.32), 0.17) * vec3(1.0, 0.56, 0.25);
    color += burst(centered, vec2((0.79 - 0.5) * aspect, 0.72 - 0.5), uTime + 2.35, vec3(0.24, 0.72, 1.0), 0.61) * vec3(0.32, 0.72, 1.0);
    color += burst(centered, vec2((0.56 - 0.5) * aspect, 0.61 - 0.5), uTime + 4.65, vec3(0.82, 0.34, 1.0), 0.89) * vec3(0.75, 0.38, 1.0);

    float alpha = clamp(max(max(color.r, color.g), color.b), 0.0, 0.72);
    gl_FragColor = vec4(color * 1.2, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export default function BirthdayFireworksCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
        if (!gl) return;

        const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return;
        }

        const buffer = gl.createBuffer();
        if (!buffer) {
            gl.deleteProgram(program);
            return;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

        const position = gl.getAttribLocation(program, 'aPosition');
        const resolution = gl.getUniformLocation(program, 'uResolution');
        const time = gl.getUniformLocation(program, 'uTime');
        let frame = 0;
        const start = performance.now();

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = Math.max(1, Math.floor(window.innerWidth * dpr));
            const height = Math.max(1, Math.floor(window.innerHeight * dpr));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
            }
        };

        const render = (now: number) => {
            resize();
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(resolution, canvas.width, canvas.height);
            gl.uniform1f(time, (now - start) / 1000);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frame = window.requestAnimationFrame(render);
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        window.addEventListener('resize', resize);
        frame = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            window.removeEventListener('resize', resize);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, []);

    return <canvas ref={canvasRef} data-testid="birthday-fireworks" className="pointer-events-none fixed inset-0 z-1 h-full w-full" aria-hidden="true" />;
}
