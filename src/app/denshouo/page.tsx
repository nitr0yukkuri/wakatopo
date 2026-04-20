'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { waveVertexShader, waveFragmentShader } from '@/shaders/wave';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const bubbleSpecs = [
    { left: '8%', top: '18%', size: 16, delay: 0.0, duration: 8.0 },
    { left: '18%', top: '68%', size: 10, delay: 1.2, duration: 7.2 },
    { left: '31%', top: '44%', size: 22, delay: 0.6, duration: 9.5 },
    { left: '52%', top: '72%', size: 14, delay: 1.8, duration: 8.8 },
    { left: '66%', top: '22%', size: 18, delay: 0.3, duration: 10.0 },
    { left: '81%', top: '56%', size: 12, delay: 1.0, duration: 7.8 },
    { left: '90%', top: '28%', size: 24, delay: 2.0, duration: 11.0 },
];

const fishSpecs = [
    { top: '20%', left: '12%', width: 72, delay: 0.0, duration: 18 },
    { top: '58%', left: '68%', width: 56, delay: 1.4, duration: 16 },
    { top: '74%', left: '24%', width: 42, delay: 2.1, duration: 14 },
];

const overviewFishSpecs = [
    { width: 84, duration: 18, src: '/clownfish.png', alt: 'clownfish' },
    { width: 92, duration: 22, src: '/ocean-sunfish.png', alt: 'ocean sunfish' },
    { width: 100, duration: 20, src: '/needlefish.png', alt: 'needlefish' },
    { width: 76, duration: 16, src: '/medaka.png', alt: 'medaka' },
    { width: 88, duration: 24, src: '/tuna.png', alt: 'tuna' },
    { width: 94, duration: 26, src: '/anglerfish.png', alt: 'anglerfish' },
    { width: 98, duration: 28, src: '/frilled-shark.png', alt: 'frilled shark' },
    { width: 102, duration: 27, src: '/hammerhead-shark.png', alt: 'hammerhead shark' },
];

// ── Animated swimming fish cursor ─────────────────────────────────────────────
// Draws a procedurally animated fish on a canvas overlay.
// The fish body bends with a travelling sine wave, tail fans,
// and the whole fish rotates toward the velocity vector.
function FishCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef  = useRef({
        // current display position (smoothed toward raw)
        x: -200, y: -200,
        // raw mouse position
        rawX: -200, rawY: -200,
        // velocity (pixels/frame, exponential moving average)
        vx: 0, vy: 0,
        // true = fish faces left (horizontal mirror via scale(-1,1))
        facingLeft: false,
        // pitch angle: up/down tilt in radians (capped ±π/2, always right-side-up)
        pitchAngle: 0,
        // swim phase (drives sine wave)
        phase: 0,
        // mouth open (click)
        mouthOpen: false,
        // is fine pointer
        fine: false,
        // raf id
        raf: 0,
    });

    useEffect(() =>
    {
        const s = stateRef.current;
        s.fine = window.matchMedia('(pointer: fine)').matches;
        if (!s.fine) return;

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.rawX = e.clientX;
            s.rawY = e.clientY;
        };
        const onDown = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.mouthOpen = true;
        };
        const onUp = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.mouthOpen = false;
        };
        window.addEventListener('pointermove',   onMove,  { passive: true });
        window.addEventListener('pointerdown',   onDown,  { passive: true });
        window.addEventListener('pointerup',     onUp,    { passive: true });
        window.addEventListener('pointercancel', onUp,    { passive: true });
        return () => {
            window.removeEventListener('pointermove',   onMove);
            window.removeEventListener('pointerdown',   onDown);
            window.removeEventListener('pointerup',     onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const s = stateRef.current;
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const resize = () => {
            canvas.width  = window.innerWidth  * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width  = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio;

        // ── Drawing helpers ──────────────────────────────────────────────────
        const drawFish = (t: number, mouthOpen: boolean) => {
            // Fish is drawn pointing RIGHT in local space (mouth at right).
            // We rotate the canvas so it faces the velocity direction.
            // ALL coords are in logical pixels; we apply dpr via scale.

            const SCALE = 1.5;   // apparent size multiplier
            const S     = SCALE;

            const swingAmp   = Math.max(0.18, Math.min(0.9, Math.hypot(s.vx, s.vy) * 0.04)); // amplitude scales with speed
            const tailSwing  = Math.sin(t * 7.0 + s.phase) * swingAmp;   // tail oscillation
            const bodyBend   = Math.sin(t * 7.0 + s.phase + 0.8) * swingAmp * 0.35; // body

            ctx.save();

            // ── Tail (drawn first, behind body) ───────
            // Tail root is at local x=−11*S, spans outward to x=−22*S
            const tailAngle  = tailSwing * 1.4;         // total fan angle
            const tailLength = 13 * S;
            const tailRoot   = -11 * S;

            ctx.save();
            ctx.rotate(bodyBend * 0.6);  // body bend affects tail root
            ctx.beginPath();
            ctx.moveTo(tailRoot, 0);
            ctx.lineTo(
                tailRoot - Math.cos(tailAngle + 0.5) * tailLength,
                 Math.sin(tailAngle + 0.5) * tailLength * 1.15
            );
            ctx.lineTo(
                tailRoot - Math.cos(tailAngle - 0.5) * tailLength,
                 Math.sin(tailAngle - 0.5) * tailLength * 1.15
            );
            ctx.closePath();
            const tailGrad = ctx.createLinearGradient(tailRoot, 0, tailRoot - tailLength, 0);
            tailGrad.addColorStop(0, 'rgba(180,80,0,0.95)');
            tailGrad.addColorStop(1, 'rgba(140,55,0,0.6)');
            ctx.fillStyle = tailGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(20,8,0,0.7)';
            ctx.lineWidth = 0.9;
            ctx.stroke();
            ctx.restore();

            // ── Body (ellipse, slightly bent) ─────────
            ctx.save();
            ctx.rotate(bodyBend);          // tilt whole body
            const bx = 0, by = 0;
            const rx = 13 * S, ry = 8 * S;

            // Body gradient: orange → warm highlight
            const bodyGrad = ctx.createRadialGradient(-2*S, -3*S, 1, bx, by, rx);
            bodyGrad.addColorStop(0, '#FFB347');
            bodyGrad.addColorStop(0.55, '#FF8C1A');
            bodyGrad.addColorStop(1, '#C46200');
            ctx.beginPath();
            ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = bodyGrad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(13,5,0,0.75)';
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // ── Stripes ───────────────────────────────
            ctx.save();
            ctx.clip(); // clip stripes inside body ellipse
            ctx.beginPath(); ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
            ctx.clip();

            // Stripe 1 (wide, near center)
            ctx.fillStyle = 'rgba(255,255,255,0.82)';
            ctx.beginPath();
            ctx.ellipse(-1*S, by, 1.6*S, ry * 0.92, 0, 0, Math.PI * 2);
            ctx.fill();
            // Stripe 2 (narrower)
            ctx.fillStyle = 'rgba(255,255,255,0.68)';
            ctx.beginPath();
            ctx.ellipse(5*S, by, 1.1*S, ry * 0.87, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // ── Eye ───────────────────────────────────
            const eyeX = 9 * S;
            const eyeY = -2.5 * S;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 2.6 * S, 0, Math.PI * 2);
            ctx.fillStyle = '#111';
            ctx.fill();
            // Catch-light
            ctx.beginPath();
            ctx.arc(eyeX + 0.7*S, eyeY - 0.7*S, 0.8*S, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();

            // ── Mouth ─────────────────────────────────
            const mouthX = 13 * S;
            const mouthY = 1.5 * S;
            if (mouthOpen) {
                ctx.beginPath();
                ctx.moveTo(mouthX, mouthY);
                ctx.lineTo(mouthX - 5*S,  mouthY - 4*S);
                ctx.lineTo(mouthX - 5*S,  mouthY + 4*S);
                ctx.closePath();
                ctx.fillStyle = 'rgba(26,5,0,0.95)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(13,5,0,0.8)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // ── Dorsal fin (Removed as per request - "eyebrow") ───────
            /*
            ctx.beginPath();
            ctx.moveTo(2*S, -ry+1);
            ctx.quadraticCurveTo(5*S, -ry - 5*S, 9*S, -ry+1);
            ctx.closePath();
            const finGrad = ctx.createLinearGradient(2*S, -ry, 9*S, -ry-5*S);
            finGrad.addColorStop(0, 'rgba(200,100,0,0.8)');
            finGrad.addColorStop(1, 'rgba(180,70,0,0.4)');
            ctx.fillStyle = finGrad;
            ctx.fill();
            */

            ctx.restore();  // body bend restore
            ctx.restore();  // outer save
        };

        // ── Animation loop ───────────────────────────────────────────────────
        let last = performance.now();

        const LERP_POS   = 0.28;   // position follow speed
        const LERP_PITCH = 0.09;   // pitch (up/down tilt) smoothing
        const VEL_DECAY  = 0.82;   // velocity decay per frame
        // Hysteresis thresholds for left/right flip — prevents flickering at zero
        const FLIP_TO_LEFT_VX  = -1.2;  // flip to face-left when vx drops below this
        const FLIP_TO_RIGHT_VX =  1.2;  // flip to face-right when vx rises above this

        const loop = (now: number) => {
            s.raf = requestAnimationFrame(loop);
            const dt = Math.min((now - last) / 16.67, 4); // normalised to 60 fps
            last = now;
            const t = now * 0.001;

            // Smooth position
            const prevX = s.x, prevY = s.y;
            s.x += (s.rawX - s.x) * LERP_POS * dt;
            s.y += (s.rawY - s.y) * LERP_POS * dt;

            // Velocity (pixels / normalised-frame at 60 fps)
            const frameVX = (s.x - prevX);
            const frameVY = (s.y - prevY);
            s.vx = s.vx * VEL_DECAY + frameVX * (1 - VEL_DECAY);
            s.vy = s.vy * VEL_DECAY + frameVY * (1 - VEL_DECAY);

            // Advance swim phase proportional to speed
            const speed = Math.hypot(s.vx, s.vy);
            s.phase += speed * 0.18 * dt;

            // ── Facing direction (hysteresis flip) ──────────────────────────
            // Fish always stays right-side-up; we mirror it with scale(-1,1)
            // to face left instead of rotating 180° (which would flip the dorsal fin).
            if (s.vx < FLIP_TO_LEFT_VX)  s.facingLeft = true;
            if (s.vx > FLIP_TO_RIGHT_VX) s.facingLeft = false;

            // ── Pitch angle: up/down tilt ───────────────────────────────────
            // Compute target pitch relative to the fish's current facing direction
            // so tilting up/down works correctly regardless of left/right.
            let targetPitch = 0;
            if (speed > 0.4) {
                const signedVx = s.facingLeft ? -s.vx : s.vx; // always positive when moving forward
                targetPitch = Math.atan2(s.vy, signedVx + 0.01) * 0.72; // dampen full tilt
            }
            // Smooth pitch
            let dp = targetPitch - s.pitchAngle;
            while (dp >  Math.PI) dp -= Math.PI * 2;
            while (dp < -Math.PI) dp += Math.PI * 2;
            s.pitchAngle += dp * LERP_PITCH * dt;

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.translate(s.x, s.y);
            // Apply facing direction THEN pitch so dorsal fin stays on top always
            if (s.facingLeft) ctx.scale(-1, 1);
            ctx.rotate(s.pitchAngle);
            drawFish(t, s.mouthOpen);
            ctx.restore();
        };

        s.raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(s.raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Fine pointer only — on touch devices just render nothing (canvas stays invisible)
    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[9999] pointer-events-none"
            aria-hidden="true"
        />
    );
}

const bubbleVertexShader = `
uniform float uTime;
attribute float scale;
attribute float speed;
attribute float seed;
varying float vAlpha;

void main() {
    vec3 pos = position;
    float rise = mod(uTime * speed + seed * 16.0, 24.0) - 12.0;
    pos.y += rise;
    pos.x += sin(uTime * 0.65 + seed * 7.0) * 0.22;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vAlpha = smoothstep(-22.0, -5.0, mvPosition.z) * (1.0 - smoothstep(-2.0, 2.0, mvPosition.z));

    gl_PointSize = scale * (120.0 / max(0.1, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
}
`;

const bubbleFragmentShader = `
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float r = length(uv);
    if (r > 0.5) discard;

    float ring = smoothstep(0.5, 0.34, r) - smoothstep(0.34, 0.2, r);
    float core = smoothstep(0.34, 0.0, r);
    float alpha = (ring * 0.50 + core * 0.12) * vAlpha;

    vec3 col = mix(vec3(0.70, 0.94, 0.98), vec3(0.94, 1.0, 1.0), ring);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.30));
}
`;

function OceanSurface() {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorDeep: { value: new THREE.Color('#0b3a49') },
        uColorShallow: { value: new THREE.Color('#5acfd9') },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uRipples: { value: new Float32Array(30) }
    }), []);

    const ripplesRef = useRef<{ x: number; y: number; time: number }[]>(
        Array.from({ length: 10 }, () => ({ x: -1, y: -1, time: 999.0 }))
    );
    const rippleIdx = useRef(0);
    const lastPos = useRef({ x: -999, y: -999 });

    useEffect(() => {
        const updateResolution = () => {
            uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        };
        updateResolution();
        window.addEventListener('resize', updateResolution);

        const addRipple = (clientX: number, clientY: number) => {
            const x = clientX / window.innerWidth;
            const y = 1.0 - (clientY / window.innerHeight);
            ripplesRef.current[rippleIdx.current] = { x, y, time: 0.0 };
            rippleIdx.current = (rippleIdx.current + 1) % 10;
        };

        const onPointerDown = (e: PointerEvent) => {
            lastPos.current = { x: e.clientX, y: e.clientY };
            addRipple(e.clientX, e.clientY);
        };

        window.addEventListener('pointerdown', onPointerDown, { passive: true });

        return () => {
            window.removeEventListener('resize', updateResolution);
            window.removeEventListener('pointerdown', onPointerDown);
        };
    }, []);

    useFrame((state, delta) => {
        uniforms.uTime.value = state.clock.getElapsedTime() * 0.85;

        const flatRipples = uniforms.uRipples.value;
        for (let i = 0; i < 10; i++) {
            const r = ripplesRef.current[i];
            r.time += delta;

            flatRipples[i * 3 + 0] = r.x;
            flatRipples[i * 3 + 1] = r.y;
            flatRipples[i * 3 + 2] = r.time;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -1]}>
            <planeGeometry args={[100, 100]} />
            <shaderMaterial
                vertexShader={waveVertexShader}
                fragmentShader={waveFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
            />
        </mesh>
    );
}

function OceanBubbles() {
    const count = 100;
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const { positions, scales, speeds, seeds } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);
        const sp = new Float32Array(count);
        const sd = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 20;
            p[i * 3 + 1] = (Math.random() - 0.5) * 14;
            p[i * 3 + 2] = -Math.random() * 12 - 1.2;
            s[i] = Math.random() * 2.0 + 0.8;
            sp[i] = Math.random() * 0.9 + 0.5;
            sd[i] = Math.random();
        }

        return { positions: p, scales: s, speeds: sp, seeds: sd };
    }, [count]);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
                <bufferAttribute attach="attributes-speed" args={[speeds, 1]} />
                <bufferAttribute attach="attributes-seed" args={[seeds, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={bubbleVertexShader}
                fragmentShader={bubbleFragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function OceanBackdrop() {
    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-0 bg-[#041116]" />

            <div className="fixed inset-0 pointer-events-none z-1">
                <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
                    <color attach="background" args={['#041116']} />
                    <OceanSurface />
                    <OceanBubbles />
                </Canvas>
            </div>

            <div
                className="fixed inset-0 pointer-events-none z-2"
                style={{
                    background: 'radial-gradient(circle at 20% 18%, rgba(120, 247, 225, 0.10) 0%, rgba(120, 247, 225, 0.02) 20%, transparent 42%), radial-gradient(circle at 78% 20%, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.02) 24%, transparent 46%), linear-gradient(180deg, rgba(7,33,42,0.35) 0%, rgba(4,17,22,0.28) 45%, rgba(2,10,14,0.62) 100%)',
                }}
            />

            <motion.div
                className="fixed inset-0 pointer-events-none z-2 opacity-40"
                animate={{ opacity: [0.24, 0.46, 0.24], x: ['-3%', '2%', '-3%'] }}
                transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    background: 'radial-gradient(ellipse 44% 26% at 18% 28%, rgba(170, 246, 255, 0.20) 0%, rgba(170, 246, 255, 0.06) 40%, rgba(170,246,255,0.0) 100%), radial-gradient(ellipse 40% 24% at 74% 36%, rgba(137, 227, 255, 0.18) 0%, rgba(137, 227, 255, 0.05) 42%, rgba(137,227,255,0.0) 100%)',
                }}
            />

            <motion.div
                className="fixed inset-0 pointer-events-none z-2 opacity-50"
                animate={{ backgroundPosition: ['0px 0px', '96px -52px', '0px 0px'] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                style={{
                    background: 'repeating-linear-gradient(165deg, rgba(255,255,255,0.00) 0px, rgba(255,255,255,0.00) 34px, rgba(135, 245, 229, 0.035) 35px, rgba(135, 245, 229, 0.00) 64px)',
                }}
            />

            {bubbleSpecs.map((bubble, index) => (
                <motion.div
                    key={index}
                    className="fixed pointer-events-none z-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
                    style={{
                        left: bubble.left,
                        top: bubble.top,
                        width: bubble.size,
                        height: bubble.size,
                        boxShadow: 'inset 0 0 18px rgba(255,255,255,0.12), 0 0 24px rgba(94,234,212,0.08)',
                    }}
                    animate={{
                        y: [-6, -34, -6],
                        x: [0, 6, -4, 0],
                        opacity: [0.22, 0.48, 0.18],
                    }}
                    transition={{
                        duration: bubble.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: bubble.delay,
                    }}
                />
            ))}

            {fishSpecs.map((fish, index) => (
                <motion.div
                    key={index}
                    className="fixed pointer-events-none z-2"
                    style={{ left: fish.left, top: fish.top, width: fish.width }}
                    animate={{ x: [0, 36, 0], y: [0, -10, 0], opacity: [0.10, 0.18, 0.10] }}
                    transition={{ duration: fish.duration, repeat: Infinity, ease: 'easeInOut', delay: fish.delay }}
                >
                    <div className="relative h-6 w-full">
                        <div className="absolute left-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-linear-to-r from-teal-200/0 via-teal-200/20 to-cyan-100/10" style={{ width: fish.width }} />
                        <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-8 border-y-transparent border-l-14 border-l-cyan-100/10" />
                    </div>
                </motion.div>
            ))}

            <div
                className="fixed inset-x-0 bottom-0 h-[32vh] pointer-events-none z-2"
                style={{
                    background: 'linear-gradient(to top, rgba(2,10,14,0.94) 0%, rgba(4,17,22,0.74) 42%, rgba(4,17,22,0) 100%)',
                }}
            />
        </>
    );
}

export default function DenshouoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork } = useStore();
    const [showBackdrop, setShowBackdrop] = useState(false);
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number; isHover: boolean }>>([]);
    const rippleIdRef = useRef(0);
    const lastHoverRippleAtRef = useRef(0);
    // isFinePointer — hide native cursor only on mouse devices
    const [isFinePointer, setIsFinePointer] = useState(false);
    useEffect(() => { setIsFinePointer(window.matchMedia('(pointer: fine)').matches); }, []);

    useEffect(() => {
        const reveal = () => {
            setShowBackdrop(true);
        };

        const addRipple = (event: PointerEvent, isHover = false) => {
            if (event.pointerType !== 'mouse') return;

            if (isHover) {
                const now = window.performance.now();
                if (now - lastHoverRippleAtRef.current < 120) return;
                lastHoverRippleAtRef.current = now;
            }

            const id = rippleIdRef.current;
            rippleIdRef.current += 1;

            setRipples((current) => [
                ...current,
                {
                    id,
                    x: (event.clientX / window.innerWidth) * 100,
                    y: (event.clientY / window.innerHeight) * 100,
                    size: isHover ? 96 + Math.random() * 28 : 120 + Math.random() * 40,
                    isHover,
                },
            ]);
        };
        const handlePointerMove = (event: PointerEvent) => addRipple(event, true);

        window.addEventListener('pointerdown', reveal, { once: true, passive: true });
        window.addEventListener('pointerdown', addRipple, { passive: true });
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('keydown', reveal, { once: true });
        window.addEventListener('scroll', reveal, { once: true, passive: true });
        const timer = window.setTimeout(reveal, 15000);

        return () => {
            window.removeEventListener('pointerdown', reveal);
            window.removeEventListener('pointerdown', addRipple);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('keydown', reveal);
            window.removeEventListener('scroll', reveal);
            window.clearTimeout(timer);
        };
    }, []);



    const copy = {
        ja: {
            returnToOrbit: 'うみからでる',
            lead: 'つぶやくほどでもない小さな幸せを魚に乗せて流し、みんなでゆるく分かち合う SNS。',
            overview: '小さな幸せをおさかなに乗せて流し、時間が経つとどこかへ泳いでいく、気軽さ重視の投稿体験を目指したアプリです。「気兼ねなく流せること」と「ちょっとした幸せを誰かと分かち合えること」を中心に設計しました。',
            smallHappiness: '大げさな発信ではなく、日常の小さな幸せを軽く流せることを重視。時間経過で投稿が流れていくため、心理的ハードルを下げています。',
            lightShadow: '幸せだけでなく、少しダークな感情も含めて海に流せる世界観を持たせ、単なるメモアプリではない情緒を加えました。',
            frontend: 'React、TypeScript、Vite、Tailwind CSS を中心に構築。魚ごとのコンポーネント管理を行い、時間が足りない場面では CSS アニメーションも併用して完成度を優先しました。',
            backend: 'ハッカソン開発での学習コストと速度を考慮し、バックエンドとデータベースを兼ねられる Supabase を採用。定期実行ジョブを使い、時間差でデータが消える仕様も実現しました。',
            context: '2025 年の技育CAMP Vol.10 にて開発。チームメンバーは全員 1 回生で、使う技術の多くが初挑戦という状態からスタートしました。その中で、学習コストと実装速度のバランスを取りながら形にし、優秀賞を受賞したプロジェクトです。',
        },
        en: {
            returnToOrbit: 'Exit the Sea',
            lead: 'A gentle SNS where small moments of happiness are sent away on fish and shared loosely with others.',
            overview: 'This app focuses on lightweight posting: place a small happy moment on a fish and let it swim away over time. It was designed around two ideas: being easy to post without pressure, and sharing small moments of joy with someone.',
            smallHappiness: 'Instead of dramatic broadcasting, it emphasizes casually sharing tiny daily happiness. Posts drift away over time, which lowers the psychological barrier to posting.',
            lightShadow: 'The world also accepts slightly darker emotions, not only happy ones, adding emotional depth beyond a simple memo app.',
            frontend: 'Built mainly with React, TypeScript, Vite, and Tailwind CSS. We managed fish-based components and used CSS animations pragmatically where needed to maximize polish within time constraints.',
            backend: 'Considering learning cost and development speed in a hackathon setting, we chose Supabase to cover both backend and database. Scheduled jobs were used to implement delayed data disappearance behavior.',
            context: 'Developed at GeekCamp Vol.10 in 2025. All team members were first-year students, and many technologies were first-time challenges. We balanced learning cost with implementation speed and completed the project to an Excellence Award level.',
        },
    } as const;
    const t = copy[lang];
    const [randomizedOverviewFishSpecs, setRandomizedOverviewFishSpecs] = useState(() =>
        overviewFishSpecs.map((fish, index) => {
            const fromLeft = index % 2 === 0;
            const isDeepSeaFish = fish.src === '/anglerfish.png' || fish.src === '/frilled-shark.png' || fish.src === '/hammerhead-shark.png';
            const top = isDeepSeaFish ? 70 + (index % 3) * 6 : 10 + (index % 6) * 8;
            return {
                ...fish,
                top: `${top.toFixed(1)}%`,
                start: fromLeft ? '-24%' : '112%',
                direction: fromLeft ? 1 : -1,
                delay: index * 0.25,
            };
        })
    );

    useEffect(() => {
        setRandomizedOverviewFishSpecs(
            overviewFishSpecs.map((fish) => {
                const fromLeft = Math.random() < 0.5;
                const isDeepSeaFish = fish.src === '/anglerfish.png' || fish.src === '/frilled-shark.png' || fish.src === '/hammerhead-shark.png';
                const top = isDeepSeaFish ? 70 + Math.random() * 20 : 8 + Math.random() * 44;
                return {
                    ...fish,
                    top: `${top.toFixed(1)}%`,
                    start: fromLeft ? '-24%' : '112%',
                    direction: fromLeft ? 1 : -1,
                    delay: Math.random() * 3,
                };
            })
        );
    }, []);

    const handleReturn = () => {
        setActiveWork(null);
        router.push(`/?lang=${lang}`);
    };

    return (
        <>
        <FishCursor />
        <main
            className="relative min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_bottom,rgba(20,184,166,0.12),transparent_35%),#041116] text-white overflow-x-hidden"
            style={{ cursor: isFinePointer ? 'none' : 'auto' }}
        >
            {showBackdrop && <OceanBackdrop />}

            <div className="pointer-events-none fixed inset-0 z-4 overflow-hidden" aria-hidden="true">
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="absolute rounded-full border border-cyan-100/55 bg-cyan-50/5"
                        style={{
                            left: `${ripple.x}%`,
                            top: `${ripple.y}%`,
                            width: ripple.size,
                            height: ripple.size,
                            x: '-50%',
                            y: '-50%',
                            boxShadow: ripple.isHover
                                ? '0 0 0 1px rgba(167, 243, 208, 0.14), 0 0 22px rgba(45, 212, 191, 0.12)'
                                : '0 0 0 1px rgba(167, 243, 208, 0.18), 0 0 34px rgba(45, 212, 191, 0.18)',
                        }}
                        initial={{ scale: ripple.isHover ? 0.18 : 0.15, opacity: ripple.isHover ? 0.32 : 0.5 }}
                        animate={{ scale: ripple.isHover ? 1.45 : 1.9, opacity: 0 }}
                        transition={{ duration: ripple.isHover ? 0.85 : 1.1, ease: 'easeOut' }}
                        onAnimationComplete={() => {
                            setRipples((current) => current.filter((item) => item.id !== ripple.id));
                        }}
                    />
                ))}
            </div>

            <div className="pointer-events-none fixed inset-0 z-3 opacity-55" aria-hidden="true">
                {randomizedOverviewFishSpecs.map((fish, index) => (
                    <motion.div
                        key={`overview-fish-${index}`}
                        className="fixed"
                        style={{ top: fish.top, left: fish.start, width: fish.width }}
                        animate={{
                            x: fish.direction === 1 ? [0, 1500] : [0, -1500],
                            opacity: [0, 0.28, 0.28, 0],
                        }}
                        transition={{
                            duration: fish.duration,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: fish.delay,
                        }}
                    >
                        <Image
                            src={fish.src}
                            alt={fish.alt}
                            width={320}
                            height={200}
                            className="h-auto w-full"
                            style={{ transform: fish.direction === 1 ? 'scaleX(-1)' : 'scaleX(1)' }}
                        />
                    </motion.div>
                ))}
            </div>

            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-12 mix-blend-exclusion">
                <button onClick={handleReturn} className="inline-flex items-center gap-3 text-sm font-mono tracking-widest text-[#ecfeff] hover:text-teal-200 transition-colors group">
                    <span className="w-6 h-px bg-[#ecfeff] group-hover:bg-teal-200 transition-colors" />
                    {t.returnToOrbit}
                </button>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-36 pb-24">
                <div className="text-center mb-20">
                    <span className="inline-block border border-teal-300/30 bg-teal-300/10 text-teal-200 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest mb-8">
                        REACT / SUPABASE
                    </span>
                    <Image
                        src="/denshouo-logo.png"
                        alt="でんしょうお ロゴ"
                        width={640}
                        height={220}
                        sizes="(max-width: 768px) 80vw, 448px"
                        priority
                        className="w-full max-w-xs md:max-w-md mx-auto"
                    />
                    <p className="mt-6 text-lg md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                        {t.lead}
                    </p>
                </div>

                <div className="space-y-10">
                    <section className="relative overflow-hidden bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="relative z-10 text-xs font-mono tracking-widest text-teal-200 mb-6 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            01 / OVERVIEW
                        </h2>
                        <p className="relative z-10 text-gray-200 leading-relaxed text-base md:text-lg">
                            {t.overview}
                        </p>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            02 / CONCEPT
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">SMALL HAPPINESS</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.smallHappiness}
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">LIGHT AND SHADOW</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.lightShadow}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            03 / TECHNICAL NOTES
                        </h2>
                        <div className="space-y-6">
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">FRONTEND</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.frontend}
                                </p>
                            </div>
                            <div className="bg-black/20 border border-teal-100/10 rounded-2xl p-6">
                                <h3 className="text-white font-bold mb-3">BACKEND / DB</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {t.backend}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">React</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">TypeScript</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vite</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Tailwind CSS</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Supabase</span>
                                <span className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-xs font-mono text-gray-300">Vercel</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/4.5 border border-teal-100/10 rounded-4xl p-8 md:p-12 backdrop-blur-xl shadow-[0_20px_80px_rgba(2,18,25,0.55)]">
                        <h2 className="text-xs font-mono tracking-widest text-teal-200 mb-8 flex items-center gap-4">
                            <span className="w-12 h-px bg-teal-300" />
                            04 / DEVELOPMENT CONTEXT
                        </h2>
                        <p className="text-gray-300 leading-relaxed">
                            {t.context}
                        </p>
                    </section>

                    <div className="mt-16 pt-10 border-t border-teal-100/10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://oikomi-front.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-teal-300/50 text-teal-200 font-mono text-sm bg-teal-300/10 hover:bg-teal-300/20 transition-colors"
                        >
                            OPEN APP
                        </a>
                        <a
                            href="https://x.com/geek_pjt/status/1954474531743232383?t=03zVZf-zya95vP3PMc1VOQ&s=19"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-4 rounded-full border border-white/15 text-gray-300 font-mono text-sm bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            RELATED LINK
                        </a>
                    </div>
                </div>
            </div>
        </main>
        </>
    );
}