'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useStore, WeatherType } from '@/store';
import { useEffect, useRef, useState } from 'react';
import dynamicImport from 'next/dynamic';
import Image from 'next/image';

const TenchanCompanion = dynamicImport(() => import('@/components/TenchanCompanion'), { ssr: false });
const RainParticles = dynamicImport(
    () => import('@/components/canvas/RainTransitionCanvas').then((m) => m.RainParticles),
    { ssr: false },
);
const SnowCanvas = dynamicImport(() => import('@/components/canvas/effects/SnowCanvas'), { ssr: false });
const ThunderCanvas = dynamicImport(() => import('@/components/canvas/ThunderTransitionCanvas'), { ssr: false });

export const dynamic = 'force-dynamic';

// A simple CSS cloud decoration component
function CloudDecoration({ className, style, flip }: { className: string, style?: React.CSSProperties, flip?: boolean }) {
    return (
        <div className={`absolute pointer-events-none flex items-center justify-center ${className}`} style={style}>
            <svg viewBox="0 0 200 100" className={`w-full h-full drop-shadow-md ${flip ? 'transform -scale-x-100' : ''}`}>
                <path
                    fill="#ffffff"
                    stroke="#98adc2"
                    strokeWidth="3"
                    d="M 50 80 Q 20 80 20 55 Q 20 30 50 30 Q 60 10 90 10 Q 120 10 130 30 Q 170 30 170 55 Q 170 80 140 80 Z"
                />
            </svg>
        </div>
    );
}

// ── Weather-aware animated cursor ─────────────────────────────────────────────
// Reads weather from the Zustand store and draws a matching cursor motif.
// Motifs: Cloud (bob+squish) / Sun+Morning (spinning rays) / Rain (teardrop)
//         Snow (rotating snowflake) / Night (crescent moon) / Thunder (bolt)
function WeatherCursor() {
    const { weather } = useStore();
    const weatherRef = useRef(weather);
    useEffect(() => { weatherRef.current = weather; }, [weather]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
        x: -300, y: -300, rawX: -300, rawY: -300,
        vx: 0, vy: 0, raf: 0,
        // Clouds
        bobPhase: 0, squishX: 1.0, squishY: 1.0, lean: 0,
        // Clear / Morning
        sunRot: 0,
        // Snow
        snowRot: 0,
        // Rain
        rainStretch: 1.0, rainTilt: 0,
        // Night
        moonBobPhase: 0,
        // Thunder
        shakeX: 0, shakeY: 0, flashPhase: 0,
        // Click Fuwan
        clickScale: 0, clickVel: 0, ringRadius: 0, ringAlpha: 0,
    });

    // ── Mouse tracking ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const s = stateRef.current;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.rawX = e.clientX;
            s.rawY = e.clientY;
        };
        const onDown = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            s.clickScale = 0.35; // Expand jump!
            s.clickVel = 0;
            s.ringRadius = 8;
            s.ringAlpha = 0.8;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
        };
    }, []);

    // ── Canvas animation loop ─────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;
        const s = stateRef.current;

        const resize = () => {
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d')!;
        const dpr = window.devicePixelRatio;

        // ════════════════════════════════════════════════════════════════════
        //  CLOUD  ── same bezier path as CloudDecoration SVG
        // ════════════════════════════════════════════════════════════════════
        const drawCloud = (sqX: number, sqY: number, lean: number, bobY: number) => {
            const k = 0.30, kX = 0.22;
            const CX = 95 * kX, CY = 52 * k;
            ctx.save();
            ctx.translate(0, bobY); ctx.scale(sqX, sqY); ctx.rotate(lean); ctx.translate(-CX, -CY);
            ctx.shadowBlur = 10; ctx.shadowOffsetY = 3; ctx.shadowColor = 'rgba(120,160,200,0.28)';
            ctx.beginPath();
            ctx.moveTo(50 * kX, 80 * k);
            ctx.quadraticCurveTo(20 * kX, 80 * k, 20 * kX, 55 * k);
            ctx.quadraticCurveTo(20 * kX, 30 * k, 50 * kX, 30 * k);
            ctx.quadraticCurveTo(60 * kX, 10 * k, 90 * kX, 10 * k);
            ctx.quadraticCurveTo(120 * kX, 10 * k, 130 * kX, 30 * k);
            ctx.quadraticCurveTo(170 * kX, 30 * k, 170 * kX, 55 * k);
            ctx.quadraticCurveTo(170 * kX, 80 * k, 140 * kX, 80 * k);
            ctx.closePath();
            const g = ctx.createLinearGradient(20 * kX, 10 * k, 20 * kX, 80 * k);
            g.addColorStop(0, 'rgba(255,255,255,0.98)'); g.addColorStop(1, 'rgba(230,243,252,0.96)');
            ctx.fillStyle = g; ctx.fill();
            ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
            ctx.strokeStyle = '#98adc2'; ctx.lineWidth = 2.8 * k; ctx.stroke();
            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  SUN  ── spinning rays + pulsing circle body
        //  Colors: pastel warm yellow palette to match otenkigurashi soft tones
        // ════════════════════════════════════════════════════════════════════
        const drawSun = (t: number, sunRot: number) => {
            const pulse = 1 + Math.sin(t * 2.5) * 0.06;
            const BODY_R = 9 * pulse;
            const RAY_IN = 13 * pulse, RAY_OUT = 19 * pulse;
            const RAY_W = 2.2;
            ctx.save();
            ctx.rotate(sunRot);
            // Outer glow — very soft warm-white, barely visible
            const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
            glow.addColorStop(0, 'rgba(255,245,190,0.13)'); glow.addColorStop(1, 'rgba(255,230,130,0)');
            ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
            // 8 diamond rays — soft dusty gold
            for (let i = 0; i < 8; i++) {
                ctx.save();
                ctx.rotate((i / 8) * Math.PI * 2);
                const MID = (RAY_IN + RAY_OUT) / 2;
                ctx.beginPath();
                ctx.moveTo(0, -RAY_IN);
                ctx.lineTo(-RAY_W * 0.5, -MID);
                ctx.lineTo(0, -RAY_OUT);
                ctx.lineTo(RAY_W * 0.5, -MID);
                ctx.closePath();
                ctx.fillStyle = '#FFD88A'; ctx.fill();  // was #FFB347
                ctx.restore();
            }
            // Body circle — warm-white center → pastel golden → soft peach outer
            const bodyG = ctx.createRadialGradient(-3, -3, 0, 0, 0, BODY_R);
            bodyG.addColorStop(0, '#FFFDF0');   // was #FFF9C4 — brighter/warmer white
            bodyG.addColorStop(0.5, '#FFE57A'); // was #FFD700 — softer straw yellow
            bodyG.addColorStop(1, '#FFBA72');   // was #FF8C1A — soft peach instead of vivid orange
            ctx.beginPath(); ctx.arc(0, 0, BODY_R, 0, Math.PI * 2);
            ctx.fillStyle = bodyG; ctx.fill();
            ctx.strokeStyle = 'rgba(190,125,50,0.65)'; ctx.lineWidth = 1.1; ctx.stroke();
            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  RAIN  ── illustrated umbrella
        //  4 equal pie-panel dome · 3 rib lines · ferrule · J-handle
        //  Panels alternating light/dark for classic umbrella illustration look
        // ════════════════════════════════════════════════════════════════════
        const drawRain = (_stretch: number, tilt: number) => {
            const R = 14;  // dome radius → 28px wide
            ctx.save();
            ctx.rotate(tilt * 0.45);

            // ── Canopy: 4 equal pie-slice panels (45° each) ────────────────
            // Arc spans π→2π going through top (3π/2). Equal splits at π/4 intervals:
            //   π(left) | 5π/4(upper-left) | 3π/2(top) | 7π/4(upper-right) | 2π(right)
            const ANGLES = [Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4, 2 * Math.PI];
            const LIGHT = 'rgba(168,220,242,0.94)';  // lighter robin-egg blue
            const DARK = 'rgba(112,178,218,0.94)';  // deeper sky blue

            ctx.save();
            ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
            ctx.shadowColor = 'rgba(70,135,200,0.22)';
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, R, ANGLES[i], ANGLES[i + 1], false);  // fragment of dome arc
                ctx.closePath();   // line back to center → pie slice
                ctx.fillStyle = i % 2 === 0 ? LIGHT : DARK;
                ctx.fill();
            }
            ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

            // Outer dome arc outline (arc only, no flat base)
            ctx.beginPath();
            ctx.arc(0, 0, R, Math.PI, 2 * Math.PI, false);
            ctx.strokeStyle = 'rgba(82,152,205,0.88)'; ctx.lineWidth = 1.3; ctx.stroke();
            ctx.restore();

            // ── Ribs: center → rib endpoints at ANGLES[1,2,3] ─────────────
            ctx.strokeStyle = 'rgba(68,138,190,0.72)'; ctx.lineWidth = 1.0; ctx.lineCap = 'round';
            [ANGLES[1], ANGLES[2], ANGLES[3]].forEach(angle => {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(R * Math.cos(angle), R * Math.sin(angle));
                ctx.stroke();
            });

            // ── Ferrule: small filled circle at apex (0, −R) ───────────────
            ctx.beginPath(); ctx.arc(0, -R - 2, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(82,150,208,0.96)'; ctx.fill();

            // ── Handle: vertical shaft + J-hook curving right ──────────────
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, R + 4);       // shaft
            ctx.arc(3.5, R + 4, 3.5, Math.PI, 0);         // J-hook
            ctx.strokeStyle = 'rgba(82,145,205,0.87)';
            ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  SNOW  ── snowman, gentle sway and bounce
        // ════════════════════════════════════════════════════════════════════
        const drawSnow = (snowRot: number, t: number) => {
            const sway = Math.sin(t * 2.0) * 0.12;
            const pulse = 1 + Math.sin(t * 3.5) * 0.04;

            ctx.save();
            ctx.rotate(sway);
            ctx.scale(1, pulse);

            const bodyR = 12;
            const headR = 8.5;
            const bodyY = 6;
            const headY = -7;

            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor = 'rgba(152,173,194,0.3)';

            // --- Body ---
            ctx.beginPath();
            ctx.arc(0, bodyY, bodyR, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // --- Head ---
            ctx.beginPath();
            ctx.arc(0, headY, headR, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Outlines
            ctx.strokeStyle = 'rgba(152,173,194,0.6)';
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.arc(0, bodyY, bodyR, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, headY, headR, 0, Math.PI * 2); ctx.stroke();

            // --- Stick Arms ---
            ctx.strokeStyle = 'rgba(150,130,110,0.8)';
            ctx.lineWidth = 1.3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Left arm
            ctx.beginPath();
            ctx.moveTo(-10, bodyY - 2); ctx.lineTo(-16, bodyY - 5);
            ctx.moveTo(-13, bodyY - 3.5); ctx.lineTo(-15, bodyY - 1);
            ctx.stroke();
            // Right arm
            ctx.beginPath();
            ctx.moveTo(10, bodyY - 2); ctx.lineTo(16, bodyY - 5);
            ctx.moveTo(13, bodyY - 3.5); ctx.lineTo(15, bodyY - 1);
            ctx.stroke();

            // --- Scarf ---
            const scarfColor = '#fc8898';
            // Neck wrap
            ctx.beginPath();
            ctx.moveTo(-5.5, -0.5);
            ctx.lineTo(5.5, -0.5);
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = scarfColor;
            ctx.stroke();
            // Tail
            ctx.beginPath();
            ctx.moveTo(3, -0.5);
            ctx.lineTo(5.5, 9);
            ctx.lineTo(1.5, 7.5);
            ctx.closePath();
            ctx.fillStyle = scarfColor;
            ctx.fill();
            // Tail detail
            ctx.strokeStyle = '#e86a7a';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(2.5, 6); ctx.lineTo(4.5, 7.5);
            ctx.stroke();

            // --- Face ---
            const eyeColor = '#6b7a8d';
            // Eyes
            ctx.fillStyle = eyeColor;
            ctx.beginPath(); ctx.arc(-3, headY - 1, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, headY - 1, 1.2, 0, Math.PI * 2); ctx.fill();
            // Cheeks
            ctx.fillStyle = 'rgba(255, 120, 140, 0.25)';
            ctx.beginPath(); ctx.arc(-4.5, headY + 1.2, 1.6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(4.5, headY + 1.2, 1.6, 0, Math.PI * 2); ctx.fill();
            // Nose (carrot)
            ctx.fillStyle = '#ffb03a';
            ctx.beginPath();
            ctx.moveTo(0, headY + 0.5);
            ctx.lineTo(0, headY + 2.5);
            ctx.lineTo(-4, headY + 1.5);
            ctx.closePath();
            ctx.fill();

            // Highlights & Buttons
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(-2, bodyY - 4, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(-2, headY - 3, 1.0, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = eyeColor;
            ctx.beginPath(); ctx.arc(0, bodyY + 2, 1.1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, bodyY + 6, 1.1, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  MOON  ── crescent (outer circle minus offset inner), tiny stars
        //           Uses destination-out on the blank-after-clearRect canvas.
        // ════════════════════════════════════════════════════════════════════
        const drawMoon = (bobY: number, t: number) => {
            const OUTER = 13, INNER = 10.5, OX = 6, OY = -2.5;
            ctx.save();
            ctx.translate(0, bobY);
            // Crescent body
            ctx.beginPath(); ctx.arc(0, 0, OUTER, 0, Math.PI * 2);
            ctx.fillStyle = '#dce8ff'; ctx.fill();
            // Cut shadow side (destination-out only touches the canvas pixels we just drew)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); ctx.arc(OX, OY, INNER, 0, Math.PI * 2);
            ctx.fillStyle = 'black'; ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            // Soft rim glow
            const glow = ctx.createRadialGradient(0, 0, OUTER * 0.6, 0, 0, OUTER + 7);
            glow.addColorStop(0, 'rgba(167,196,245,0.10)');
            glow.addColorStop(1, 'rgba(167,196,245,0)');
            ctx.beginPath(); ctx.arc(0, 0, OUTER + 7, 0, Math.PI * 2);
            ctx.fillStyle = glow; ctx.fill();
            // Tiny twinkling stars nearby
            ([[-20, -11], [13, 15], [22, -4]] as [number, number][]).forEach(([sx, sy], i) => {
                const tw = 0.35 + 0.65 * Math.sin(t * 1.9 + i * 2.4);
                ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,232,255,${tw.toFixed(2)})`; ctx.fill();
            });
            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  THUNDER  ── storm cloud (dark version of Clouds shape) + small bolt
        //             Cloud flashes bright on lightning; bolt glows on flash.
        // ════════════════════════════════════════════════════════════════════
        const drawThunder = (shakeX: number, shakeY: number, flash: number) => {
            const k = 0.30, kX = 0.22;
            const CX = 95 * kX;   // = 20.9  (horizontal cloud center)
            const CY = 52 * k;    // = 15.6  (vertical cloud center)

            ctx.save();
            ctx.translate(shakeX, shakeY);

            // ── Storm cloud body ────────────────────────────────────────────
            ctx.save();
            ctx.translate(-CX, -CY);
            // Shadow brightens blue on flash
            ctx.shadowBlur = 10 + flash * 10;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor = `rgba(80,100,200,${(0.22 + flash * 0.35).toFixed(2)})`;
            // Same bezier path as the Clouds cursor
            ctx.beginPath();
            ctx.moveTo(50 * kX, 80 * k);
            ctx.quadraticCurveTo(20 * kX, 80 * k, 20 * kX, 55 * k);
            ctx.quadraticCurveTo(20 * kX, 30 * k, 50 * kX, 30 * k);
            ctx.quadraticCurveTo(60 * kX, 10 * k, 90 * kX, 10 * k);
            ctx.quadraticCurveTo(120 * kX, 10 * k, 130 * kX, 30 * k);
            ctx.quadraticCurveTo(170 * kX, 30 * k, 170 * kX, 55 * k);
            ctx.quadraticCurveTo(170 * kX, 80 * k, 140 * kX, 80 * k);
            ctx.closePath();
            // Dark storm fill — flashes lighter during lightning strike
            const r0 = Math.round(105 + flash * 90), g0 = Math.round(112 + flash * 90), b0 = Math.round(140 + flash * 75);
            const r1 = Math.round(48 + flash * 70), g1 = Math.round(55 + flash * 70), b1 = Math.round(82 + flash * 65);
            const cG = ctx.createLinearGradient(20 * kX, 10 * k, 20 * kX, 80 * k);
            cG.addColorStop(0, `rgba(${r0},${g0},${b0},0.96)`);
            cG.addColorStop(1, `rgba(${r1},${g1},${b1},0.97)`);
            ctx.fillStyle = cG; ctx.fill();
            ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
            ctx.strokeStyle = 'rgba(38,44,72,0.72)';
            ctx.lineWidth = 2.8 * k; ctx.stroke();
            ctx.restore();

            // ── Small bolt hanging from cloud bottom centre ─────────────────
            // Cloud bottom in outer-local coords: y = 80*k − CY ≈ 8.4
            const cloudBottom = 80 * k - CY;
            ctx.save();
            ctx.translate(0, cloudBottom + 0.5);
            // Electric glow appears during flash
            if (flash > 0.04) {
                const gA = flash * 0.65;
                const glw = ctx.createRadialGradient(0, 5, 0, 0, 5, 11);
                glw.addColorStop(0, `rgba(255,240,80,${gA.toFixed(2)})`);
                glw.addColorStop(1, 'rgba(255,200,50,0)');
                ctx.beginPath(); ctx.arc(0, 5, 11, 0, Math.PI * 2);
                ctx.fillStyle = glw; ctx.fill();
            }
            // Compact zigzag bolt
            ctx.beginPath();
            ctx.moveTo(2.0, 0);
            ctx.lineTo(-2.5, 5);
            ctx.lineTo(0.5, 5);
            ctx.lineTo(-3.0, 12);
            ctx.lineTo(3.5, 6);
            ctx.lineTo(0.5, 6);
            ctx.closePath();
            const bG = ctx.createLinearGradient(0, 0, 0, 12);
            bG.addColorStop(0, `rgba(255,230,80,${(0.88 + flash * 0.12).toFixed(2)})`);
            bG.addColorStop(1, '#F59E0B');
            ctx.fillStyle = bG; ctx.fill();
            ctx.strokeStyle = 'rgba(150,95,0,0.45)'; ctx.lineWidth = 0.6; ctx.stroke();
            ctx.restore();

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════════
        //  ANIMATION LOOP
        // ════════════════════════════════════════════════════════════════════
        let last = performance.now();
        const LERP_POS = 0.18;
        const VEL_DECAY = 0.88;

        const loop = (now: number) => {
            s.raf = requestAnimationFrame(loop);
            const dt = Math.min((now - last) / 16.67, 4);
            last = now;
            const t = now * 0.001;
            const w = weatherRef.current;

            // ── shared position + velocity ──────────────────────────────────
            const prevX = s.x, prevY = s.y;
            s.x += (s.rawX - s.x) * LERP_POS * dt;
            s.y += (s.rawY - s.y) * LERP_POS * dt;
            s.vx = s.vx * VEL_DECAY + (s.x - prevX) * (1 - VEL_DECAY);
            s.vy = s.vy * VEL_DECAY + (s.y - prevY) * (1 - VEL_DECAY);
            const speed = Math.hypot(s.vx, s.vy);

            // ── per-weather state update ────────────────────────────────────
            if (w === 'Clouds') {
                s.bobPhase += 0.038 * dt;
                const tSqX = 1 + Math.min(speed * 0.013, 0.22);
                s.squishX += (tSqX - s.squishX) * 0.14 * dt;
                s.squishY += ((1 / tSqX) - s.squishY) * 0.14 * dt;
                const tL = Math.max(-0.23, Math.min(0.23, s.vx * 0.055));
                s.lean += (tL - s.lean) * 0.10 * dt;
            } else if (w === 'Clear' || w === 'Morning') {
                s.sunRot += 0.018 * dt;
            } else if (w === 'Snow') {
                s.snowRot += 0.012 * dt;
            } else if (w === 'Rain') {
                const tStr = 1 + Math.min(speed * 0.028, 0.55);
                s.rainStretch += (tStr - s.rainStretch) * 0.14 * dt;
                const tTilt = Math.max(-0.45, Math.min(0.45, s.vx * 0.042));
                s.rainTilt += (tTilt - s.rainTilt) * 0.10 * dt;
            } else if (w === 'Night') {
                s.moonBobPhase += 0.022 * dt;
            } else if (w === 'Thunder') {
                if (Math.random() < 0.008) s.flashPhase = 1.0;
                s.flashPhase *= 0.88;
            }

            // ── click spring physics ────────────────────────────────────────
            const SPRING = 0.12;
            const DAMPING = 0.70;
            s.clickVel += (0 - s.clickScale) * SPRING * dt;
            s.clickVel *= Math.pow(DAMPING, dt);
            s.clickScale += s.clickVel * dt;

            // ring expansion
            if (s.ringAlpha > 0) {
                s.ringRadius += 4.5 * dt;
                s.ringAlpha -= 0.04 * dt;
            }

            // ── draw ────────────────────────────────────────────────────────
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.translate(s.x, s.y);

            // Ring effect
            if (s.ringAlpha > 0) {
                ctx.beginPath();
                ctx.arc(0, 0, s.ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, s.ringAlpha)})`;
                ctx.lineWidth = 2.5;
                ctx.stroke();
            }

            // Apply Fuwan scale
            const bs = 1.0 + Math.max(-0.5, s.clickScale);
            ctx.scale(bs, bs);

            if (w === 'Clouds') {
                const bobAmp = Math.max(1.2, 4.5 - speed * 0.5);
                drawCloud(s.squishX, s.squishY, s.lean, Math.sin(s.bobPhase * 1.6) * bobAmp);
            } else if (w === 'Clear' || w === 'Morning') {
                drawSun(t, s.sunRot);
            } else if (w === 'Snow') {
                drawSnow(s.snowRot, t);
            } else if (w === 'Rain') {
                drawRain(s.rainStretch, s.rainTilt);
            } else if (w === 'Night') {
                drawMoon(Math.sin(s.moonBobPhase * 1.0) * 3.2, t);
            } else if (w === 'Thunder') {
                drawThunder(0, 0, s.flashPhase);
            }

            ctx.restore();
        };

        s.raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(s.raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[9999] pointer-events-none"
            aria-hidden="true"
        />
    );
}

export default function OtenkiGurashiPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork, setWeather, weather } = useStore();
    const weatherParam = searchParams.get('weather');

    const copy = {
        ja: {
            react1: 'えへへ！',
            react2: 'おさんぽ行く？',
            react3: 'ふわああ…',
            react4: 'なになに？',
            react5: '今日もいいお天気！',
            lead: '天気予報を見ないあなたの、',
            lead2: 'いちばん優しいおまもり。',
            lead3: 'おてんきぐらし',
            lead4: 'は、',
            lead5: '現実の天気と連動するシミュレーションです。',
            conceptTitle: 'コンセプト',
            conceptClick: 'ゲームみたいに天気を楽しめるんだ！',
            conceptText: '天気予報の確認は面倒だけど、急な雨や気圧の変化はつらい… そんな方々のために生まれました。ゲーム性のある優しい世界を通して、面倒だった天気確認を「雨だから、ゲーム内で特別なことができるかも？」という、ポジティブな体験へと変えていきます。',
            f1Click: '大阪で雨なら、ゲームでも雨だよ！',
            f1Title: '☀ リアルタイム天気連動',
            f1Text: 'あなたのいる場所の「今」が、キャラクターの世界に直接反映されます。雨は雨粒、雷はフラッシュ、雪は降雪モーションとして画面に現れ、夜になればキャラクターも眠りにつきます。',
            f2Click: 'おさんぽで色んなアイテムを集めよう！',
            f2Title: '🚶 おさんぽ (Walking)',
            f2Text: 'キャラクターを「おさんぽ」に出すことができます。おさんぽ先の景色や、手に入るアイテムは天気によって変化。コレクションする楽しみが待っています。',
            f3Click: '思い出がたくさん記録されるよ！',
            f3Title: '✨ コレクション＆実績',
            f3Text: 'レベルアップのようなノルマはありません。「おさんぽ」で集めたアイテムを眺める「ずかん」や、「はじめて雨の日におさんぽした」といったキャラクターとの思い出を記録する「実績」が、あなたの毎日を彩ります。',
            techClick: 'Next.jsで作られてるよ！',
            openApp: 'アプリをひらく',
            viewGithub: 'GitHubをみる',
            backHome: 'おうちにもどる',
            logoAlt: 'OTENKI GURASHI Logo',
        },
        en: {
            react1: 'Hehe!',
            react2: 'Want to go for a walk?',
            react3: 'Yaaawn...',
            react4: 'What is it?',
            react5: 'Nice weather today too!',
            lead: 'For you who never checks the forecast,',
            lead2: 'the kindest little charm.',
            lead3: 'Otenkigurashi',
            lead4: 'is',
            lead5: 'a simulation linked to real-world weather.',
            conceptTitle: 'CONCEPT',
            conceptClick: 'You can enjoy weather like a game!',
            conceptText: 'Checking weather forecasts can be a hassle, and sudden rain or pressure changes can be tough. This app was born for that. Through a gentle game-like world, it turns weather checks from a chore into a positive experience: “It is raining, maybe I can do something special in-game.”',
            f1Click: 'If it rains in Osaka, it rains in the game too!',
            f1Title: '☀ Real-Time Weather Sync',
            f1Text: 'The “now” of your location is directly reflected in the character world. Rain appears as droplets, thunder as flashes, snow as falling motion, and at night the character goes to sleep.',
            f2Click: 'Let us collect items on a walk!',
            f2Title: '🚶 Walk Mode',
            f2Text: 'You can send your character on a walk. Scenery and obtainable items change with the weather, giving you a fun collection loop.',
            f3Click: 'So many memories get recorded!',
            f3Title: '✨ Collection & Achievements',
            f3Text: 'There are no level-up quotas. A “zukan” lets you look back at collected walk items, and achievements record memories with your character, like your first rainy-day walk.',
            techClick: 'It is built with Next.js!',
            openApp: 'Open App',
            viewGithub: 'View GitHub',
            backHome: 'Back Home',
            logoAlt: 'OTENKIGURASHI Logo',
        },
    } as const;
    const t = copy[lang];

    // スクロール検知用の状態とRef
    const [activeSection, setActiveSection] = useState<'hero' | 'concept' | 'features' | 'tech' | 'bottom'>('hero');
    const heroRef = useRef<HTMLDivElement>(null);
    const conceptRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const techRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // インタラクション（クリック）時のオーバーライド用状態
    type DialogType = { text: string; mood: "happy" | "neutral" | "sad" | "scared" | "sleepy" | "looking" | "surprised" | "talking" };
    const [overrideDialog, setOverrideDialog] = useState<DialogType | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showHeavyEffects, setShowHeavyEffects] = useState(false);
    // Hide native cursor on fine-pointer (mouse) devices — CloudCursor replaces it
    const [isFinePointer, setIsFinePointer] = useState(false);
    useEffect(() => { setIsFinePointer(window.matchMedia('(pointer: fine)').matches); }, []);

    const handleInteract = (text: string, mood: DialogType['mood']) => {
        setOverrideDialog({ text, mood });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOverrideDialog(null);
        }, 4000); // 4秒後に元のセリフに戻る
    };

    const handleTenchanClick = () => {
        const reactions: DialogType[] = [
            { text: t.react1, mood: "happy" },
            { text: t.react2, mood: "looking" },
            { text: t.react3, mood: "sleepy" },
            { text: t.react4, mood: "surprised" },
            { text: t.react5, mood: "talking" }
        ];
        const random = reactions[Math.floor(Math.random() * reactions.length)];
        handleInteract(random.text, random.mood);
    };

    useEffect(() => {
        const weatherByParam = weatherParam as WeatherType | null;
        const validWeather: WeatherType[] = ['Clear', 'Rain', 'Clouds', 'Snow', 'Night', 'Morning', 'Thunder'];
        if (weatherByParam && validWeather.includes(weatherByParam)) {
            setWeather(weatherByParam);
        }
    }, [setWeather, weatherParam]);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-30% 0px -40% 0px', // 画面の中央付近で検知する
            threshold: 0
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id as 'hero' | 'concept' | 'features' | 'tech' | 'bottom';
                    setActiveSection(id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        if (heroRef.current) observer.observe(heroRef.current);
        if (conceptRef.current) observer.observe(conceptRef.current);
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (techRef.current) observer.observe(techRef.current);
        if (bottomRef.current) observer.observe(bottomRef.current);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const reveal = () => {
            setShowHeavyEffects(true);
        };

        window.addEventListener('pointerdown', reveal, { once: true, passive: true });
        window.addEventListener('keydown', reveal, { once: true });
        window.addEventListener('scroll', reveal, { once: true, passive: true });
        const timer = window.setTimeout(reveal, 15000);

        return () => {
            window.removeEventListener('pointerdown', reveal);
            window.removeEventListener('keydown', reveal);
            window.removeEventListener('scroll', reveal);
            window.clearTimeout(timer);
        };
    }, []);

    const handleReturn = () => {
        setActiveWork(null); // ワープ状態をリセット
        router.push(`/?lang=${lang}`);
    };

    let bgGradient = "from-[#aee1f9] to-[#e0f4fc]"; // Default (Clear)
    let cardText = "text-gray-700";

    if (weather === 'Clouds') {
        bgGradient = "from-[#6b7a8d] via-[#8fa0b0] to-[#b5c2ca]";
    } else if (weather === 'Rain') {
        bgGradient = "from-[#60a5fa] to-[#bfdbfe] bg-gradient-to-t"; // Original Rain Gradient
    } else if (weather === 'Snow') {
        bgGradient = "bg-[#eef7fd]";
    } else if (weather === 'Thunder') {
        bgGradient = "from-[#1a1a2e] via-[#16213e] to-[#0f3460]";
        cardText = "text-gray-200";
    } else if (weather === 'Night') {
        bgGradient = "from-[#030915] via-[#071428] to-[#0b1f36]";
        cardText = "text-gray-200";
    }

    return (
        <>
            <WeatherCursor />
            <main className={`relative w-full min-h-[120dvh] ${weather !== 'Rain' && weather !== 'Snow' ? 'bg-gradient-to-b' : ''} ${bgGradient} ${weather === 'Thunder' || weather === 'Night' ? 'text-gray-200' : 'text-gray-700'} overflow-hidden font-sans pb-32 transition-colors duration-1000`} style={{ cursor: isFinePointer ? 'none' : 'auto' }}>

                <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10">
                    <button
                        onClick={handleReturn}
                        className="inline-flex items-center gap-3 rounded-full border border-white/35 bg-black/35 px-4 py-2 text-sm font-mono tracking-widest text-white backdrop-blur-sm hover:bg-black/50 transition-colors group"
                    >
                        <span className="w-6 h-px bg-white/90 transition-colors" />
                        {t.backHome}
                    </button>
                </nav>

                {/* Background Parallax Clouds Layer */}
                <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-1000 ${weather === 'Rain' ? 'opacity-8' : weather === 'Thunder' ? 'opacity-35' : weather === 'Snow' ? 'opacity-0' : weather === 'Clouds' ? 'opacity-100' : weather === 'Night' ? 'opacity-45' : 'opacity-30'}`}>
                    {/* --- 3. 奥のレイヤー（小さく、ゆっくり、薄い、左へ） --- */}
                    <CloudDecoration className="opacity-20 w-32 top-[5%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-10s' }} />
                    <CloudDecoration className="opacity-30 w-40 top-[40%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-40s' }} />
                    <CloudDecoration className="opacity-20 w-28 top-[25%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-110s' }} />
                    <CloudDecoration className="opacity-30 w-24 top-[70%] animate-cloud-scroll-left-slow" style={{ animationDelay: '-80s' }} />
                    <CloudDecoration className="opacity-20 w-36 top-[55%] animate-cloud-scroll-left-slow" flip style={{ animationDelay: '-130s' }} />
                    <CloudDecoration className="opacity-20 w-36 top-[85%] animate-cloud-scroll-left-slow" flip style={{ animationDelay: '-20s' }} />

                    {/* --- 2. 中間のレイヤー（普通サイズ、中速、少し薄め、右へ） --- */}
                    <CloudDecoration className="opacity-60 w-52 top-[5%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-5s' }} />
                    <CloudDecoration className="opacity-40 w-44 top-[20%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-35s' }} />
                    <CloudDecoration className="opacity-50 w-64 top-[35%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-50s' }} />
                    <CloudDecoration className="opacity-40 w-56 top-[50%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-15s' }} />
                    <CloudDecoration className="opacity-50 w-48 top-[60%] animate-cloud-scroll-right-medium" flip style={{ animationDelay: '-25s' }} />
                    <CloudDecoration className="opacity-40 w-60 top-[75%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-60s' }} />
                    <CloudDecoration className="opacity-60 w-56 bottom-[5%] animate-cloud-scroll-right-medium" style={{ animationDelay: '-70s' }} />

                    {/* --- 1. 手前のレイヤー（大きく、速く、不透明、左へ） --- */}
                    <CloudDecoration className="opacity-90 w-72 top-[10%] animate-cloud-scroll-left-fast filter blur-[1px]" style={{ animationDelay: '-15s' }} />
                    <CloudDecoration className="opacity-80 w-80 top-[30%] animate-cloud-scroll-left-fast filter blur-[1px]" flip style={{ animationDelay: '-45s' }} />
                    <CloudDecoration className="opacity-80 w-80 top-[50%] animate-cloud-scroll-left-fast filter blur-[1px]" flip style={{ animationDelay: '-35s' }} />
                    <CloudDecoration className="opacity-90 w-[22rem] top-[70%] animate-cloud-scroll-left-fast filter blur-[1px]" style={{ animationDelay: '-5s' }} />
                    <CloudDecoration className="opacity-95 w-96 bottom-[10%] animate-cloud-scroll-left-fast filter blur-[2px]" style={{ animationDelay: '-55s' }} />
                </div>

                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-32 flex flex-col items-center animate-fade-in-up">

                    {/* Pop Title Logo */}
                    <div id="hero" ref={heroRef} className="mb-8 md:mb-10 text-center scroll-mt-24 w-full flex justify-center">
                        <Image
                            src="/otenkigurashi-logo.png"
                            alt={t.logoAlt}
                            width={640}
                            height={220}
                            sizes="(max-width: 768px) 80vw, 448px"
                            priority
                            className="w-full max-w-xs md:max-w-md drop-shadow-md"
                        />
                    </div>

                    {/* Fluffy White Content Card */}
                    <div className={`${weather === 'Snow' ? 'bg-white/92' : 'bg-white/95'} ${weather === 'Snow' ? '' : 'backdrop-blur-sm'} border-4 ${weather === 'Snow' ? 'border-transparent' : 'border-white'} px-6 py-10 md:p-14 rounded-[2.5rem] md:rounded-[3rem] w-full ${weather === 'Snow' ? 'shadow-none' : 'shadow-[0_20px_60px_-15px_rgba(152,173,194,0.3)]'}`}>

                        <p className="text-lg md:text-2xl font-bold text-gray-600 mb-10 md:mb-12 leading-relaxed text-center">
                            {t.lead}<br className="md:hidden" />{t.lead2}<br />
                            <span className="text-[#ffb03a] text-xl md:text-3xl inline-block mt-2 font-black">{t.lead3}</span> {t.lead4}<br className="md:hidden" />{t.lead5}
                        </p>

                        <div className="space-y-12">
                            {/* Section 1: Concept */}
                            <section id="concept" ref={conceptRef} className="mb-32 animate-fade-in-up scroll-mt-32" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="text-4xl font-bold text-[#ffb03a]">01</span>
                                    <h2 className="text-2xl font-bold tracking-widest text-[#7ab8cc]">{t.conceptTitle}</h2>
                                </div>
                                <div
                                    onClick={() => handleInteract(t.conceptClick, "happy")}
                                    className="bg-white/90 backdrop-blur-md rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 border-4 border-white shadow-xl max-w-3xl cursor-pointer hover:border-[#ffb03a] hover:shadow-lg transition-all"
                                >
                                    <p className="text-base md:text-xl leading-relaxed text-gray-700 font-medium">
                                        {t.conceptText}
                                    </p>
                                </div>
                            </section>
                            <div id="features" ref={featuresRef} className="scroll-mt-32">
                                <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                    <span className="text-[#ffb03a]">02</span> FEATURES
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        onClick={() => handleInteract(t.f1Click, "talking")}
                                        className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                    >
                                        <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f1Title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {t.f1Text}
                                        </p>
                                    </div>
                                    <div
                                        onClick={() => handleInteract(t.f2Click, "happy")}
                                        className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1"
                                    >
                                        <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f2Title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {t.f2Text}
                                        </p>
                                    </div>
                                    <div
                                        onClick={() => handleInteract(t.f3Click, "surprised")}
                                        className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all hover:-translate-y-1 md:col-span-2"
                                    >
                                        <h3 className="text-[#ffb03a] font-bold text-lg mb-3">{t.f3Title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {t.f3Text}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* TECHNICAL STACK */}
                            <div id="tech" ref={techRef} className="scroll-mt-32">
                                <h2 className="text-xl font-black tracking-wider text-[#7ab8cc] mb-6 flex items-center gap-3 pl-2">
                                    <span className="text-[#ffb03a]">03</span> TECH STACK
                                </h2>
                                <div
                                    onClick={() => handleInteract(t.techClick, "surprised")}
                                    className="bg-white p-8 rounded-3xl border-2 border-[#e0f4fc] shadow-sm hover:border-[#ffb03a] cursor-pointer transition-all"
                                >
                                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 font-bold text-gray-700">
                                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />Next.js</li>
                                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />TypeScript</li>
                                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />Tailwind CSS</li>
                                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />OpenWeatherMap API</li>
                                        <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffb03a]" />PWA</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pop Buttons */}
                        <div id="bottom" ref={bottomRef} className="mt-16 pt-10 border-t border-[#e0f4fc] flex flex-col sm:flex-row items-center justify-center gap-4 scroll-mt-32">
                            <a
                                href="https://otenki-gurashi.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#ffb03a] text-white px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#e69a2e] hover:translate-y-[2px] hover:shadow-[0_4px_0_#e69a2e] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                            >
                                <span>{t.openApp}</span> ↗
                            </a>

                            <a
                                href="https://github.com/nitr0yukkuri/otenkigurashi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-[#7ab8cc] border-2 border-[#e0f4fc] px-8 py-4 rounded-full font-bold text-base shadow-[0_6px_0_#d1effa] hover:translate-y-[2px] hover:border-[#7ab8cc] hover:shadow-[0_4px_0_#a0e1fa] active:translate-y-[6px] active:shadow-none transition-all flex items-center gap-2"
                            >
                                <span>{t.viewGithub}</span> ↗
                            </a>
                        </div>
                    </div>
                </div>

                {/* Additional Screen Effects based on Weather */}
                {(weather === 'Clear' || weather === 'Morning') && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-0">
                            <div
                                className="absolute right-[8%] top-[9%] w-24 h-24 md:w-32 md:h-32 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle at 35% 35%, rgba(255,245,180,0.96) 0%, rgba(255,213,112,0.92) 38%, rgba(255,170,58,0.92) 100%)',
                                    boxShadow: '0 0 45px rgba(255,205,110,0.55), 0 0 110px rgba(255,187,82,0.35)',
                                    animation: 'sun-soft-pulse 4.6s ease-in-out infinite',
                                }}
                            />
                            <div
                                className="absolute right-[3%] top-[2%] w-44 h-44 md:w-64 md:h-64 rounded-full"
                                style={{
                                    background: 'radial-gradient(circle, rgba(255,220,150,0.36) 0%, rgba(255,220,150,0.08) 42%, rgba(255,220,150,0.0) 74%)',
                                    animation: 'sun-aura-spin 16s linear infinite',
                                }}
                            />
                        </div>
                        <style>{`
                        @keyframes sun-soft-pulse {
                            0%, 100% { transform: scale(1); opacity: 0.94; }
                            50% { transform: scale(1.05); opacity: 1; }
                        }
                        @keyframes sun-aura-spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                    </>
                )}
                {(weather === 'Rain' || weather === 'Thunder') && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-0">
                            <RainParticles />
                        </div>
                        <div className="fixed inset-0 pointer-events-none z-0 opacity-45" style={{
                            background: 'linear-gradient(180deg, rgba(52,95,145,0.24) 0%, rgba(67,123,188,0.18) 35%, rgba(18,52,90,0.24) 100%)',
                        }} />
                    </>
                )}
                {weather === 'Snow' && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-20">
                            <SnowCanvas density={1.45} />
                        </div>
                    </>
                )}
                {weather === 'Clouds' && (
                    <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
                        <div className="w-full h-full" style={{
                            background: 'radial-gradient(ellipse 80% 40% at 50% 10%, rgba(100,120,140,0.4), rgba(100,120,140,0))',
                        }} />
                    </div>
                )}
                {weather === 'Night' && (
                    <>
                        <div className="fixed inset-0 pointer-events-none z-0">
                            {/* 夜空の深み */}
                            <div className="absolute inset-0" style={{
                                background: 'radial-gradient(ellipse 75% 45% at 50% 8%, rgba(132,173,235,0.12), transparent 60%)',
                            }} />

                            {/* 右上の三日月 */}
                            <div className="absolute right-[10%] top-[10%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#dce8ff] opacity-90 shadow-[0_0_35px_rgba(167,196,245,0.38)]" />
                            <div className="absolute right-[7.7%] top-[8.6%] w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#081325] opacity-95" />

                            {/* 小さな星 */}
                            <div className="absolute inset-0 opacity-60" style={{
                                backgroundImage: 'radial-gradient(circle at 12% 18%, rgba(220,235,255,0.95) 0 1px, transparent 2px), radial-gradient(circle at 24% 34%, rgba(220,235,255,0.85) 0 1px, transparent 2px), radial-gradient(circle at 41% 12%, rgba(220,235,255,0.92) 0 1px, transparent 2px), radial-gradient(circle at 62% 22%, rgba(220,235,255,0.86) 0 1px, transparent 2px), radial-gradient(circle at 76% 30%, rgba(220,235,255,0.94) 0 1px, transparent 2px), radial-gradient(circle at 88% 14%, rgba(220,235,255,0.80) 0 1px, transparent 2px)',
                                animation: 'night-twinkle 5s ease-in-out infinite',
                            }} />
                        </div>
                        <style>{`
                        @keyframes night-twinkle {
                            0%, 100% { opacity: 0.45; }
                            50% { opacity: 0.9; }
                        }
                    `}</style>
                    </>
                )}
                {weather === 'Thunder' && (
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <ThunderCanvas continuous={true} />
                    </div>
                )}

                {/* Ten-chan Companion */}
                {showHeavyEffects && (
                    <TenchanCompanion
                        lang={lang}
                        section={activeSection}
                        overrideDialog={overrideDialog}
                        onClick={handleTenchanClick}
                    />
                )}
            </main>
        </>
    );
}
