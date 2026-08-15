'use client';

import { useEffect, useRef } from 'react';
import type { SeasonType, WeatherType } from '@/store';
import { useWorldState } from '@/components/WorldStateProvider';
import { getWorldVisualProfile } from '@/lib/worldVisualProfile';

export default function WeatherCursor({ weatherOverride, seasonOverride }: { weatherOverride?: WeatherType; seasonOverride?: SeasonType } = {}) {
    const worldState = useWorldState();
    const weather = weatherOverride ?? worldState.weather;
    const season = seasonOverride ?? worldState.season;
    const weatherRef = useRef(weather);
    const seasonRef = useRef(season);
    const seasonEventRef = useRef(worldState.seasonEvent);
    useEffect(() => { weatherRef.current = weather; }, [weather]);
    useEffect(() => { seasonRef.current = season; }, [season]);
    useEffect(() => { seasonEventRef.current = worldState.seasonEvent; }, [worldState.seasonEvent]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef({
        x: -300, y: -300, rawX: -300, rawY: -300,
        vx: 0, vy: 0, raf: 0,
        // Clouds
        bobPhase: 0, squishX: 1.0, squishY: 1.0, lean: 0,
        // Clear / Morning
        sunRot: 0,
        // Spring / Clear
        sakuraRot: 0,
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

        //  SAKURA  ・five soft petals with a warm center for spring cursor
        const drawSakura = (t: number, sakuraRot: number) => {
            const pulse = 1 + Math.sin(t * 2.2) * 0.05;
            ctx.save();
            ctx.rotate(sakuraRot);
            ctx.scale(pulse, pulse);
            ctx.shadowBlur = 7;
            ctx.shadowColor = 'rgba(231,139,176,0.34)';

            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.rotate((i / 5) * Math.PI * 2);
                ctx.beginPath();
                ctx.ellipse(0, -7.2, 4.2, 6.2, 0, 0, Math.PI * 2);
                const petal = ctx.createLinearGradient(0, -13, 0, -1);
                petal.addColorStop(0, 'rgba(255,244,249,0.98)');
                petal.addColorStop(0.68, 'rgba(247,181,207,0.96)');
                petal.addColorStop(1, 'rgba(231,139,176,0.92)');
                ctx.fillStyle = petal;
                ctx.fill();
                ctx.strokeStyle = 'rgba(180,102,139,0.58)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
                ctx.restore();
            }

            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(239,166,77,0.28)';
            ctx.beginPath();
            ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffd784';
            ctx.fill();
            ctx.strokeStyle = 'rgba(190,125,50,0.62)';
            ctx.lineWidth = 0.75;
            ctx.stroke();

            // Two tiny drifting petals make the cursor read as sakura in motion.
            const drift = Math.sin(t * 1.8) * 1.8;
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(244,164,197,0.82)';
            ctx.beginPath();
            ctx.ellipse(-15 + drift, -8, 1.8, 2.8, -0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(14 - drift, 9, 1.5, 2.3, 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        //  MOMIJI — same fixed hair ornament shape as TenchanCompanion
        const drawMomiji = () => {
            ctx.save();
            ctx.rotate(12 * Math.PI / 180);
            ctx.scale(0.78, 0.78);

            ctx.beginPath();
            ctx.moveTo(0, 14);
            ctx.bezierCurveTo(-1, 10, -1, 6, -1, 3);
            ctx.bezierCurveTo(-5, 6, -10, 8, -14, 7);
            ctx.bezierCurveTo(-12, 4, -9, 1, -6, -1);
            ctx.bezierCurveTo(-10, -1, -13, -3, -14, -5);
            ctx.bezierCurveTo(-11, -7, -7, -8, -4, -7);
            ctx.bezierCurveTo(-4, -11, -2, -14, 0, -16);
            ctx.bezierCurveTo(2, -14, 4, -11, 4, -7);
            ctx.bezierCurveTo(7, -8, 11, -7, 14, -5);
            ctx.bezierCurveTo(13, -3, 10, -1, 6, -1);
            ctx.bezierCurveTo(9, 1, 12, 4, 14, 7);
            ctx.bezierCurveTo(10, 8, 5, 6, 1, 3);
            ctx.bezierCurveTo(1, 6, 1, 10, 0, 14);
            ctx.closePath();
            ctx.fillStyle = '#e6a14d';
            ctx.fill();
            ctx.strokeStyle = '#b86f32';
            ctx.lineWidth = 1.2;
            ctx.lineJoin = 'round';
            ctx.stroke();

            ctx.strokeStyle = '#f7d27d';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, 11); ctx.lineTo(0, -9);
            ctx.moveTo(0, 1); ctx.lineTo(-6, -2);
            ctx.moveTo(0, 1); ctx.lineTo(6, -2);
            ctx.stroke();
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
            const visualProfile = getWorldVisualProfile({
                weather: w,
                season: seasonRef.current,
                seasonEvent: seasonEventRef.current,
            });
            const isSpringClear = visualProfile.showSpring;
            const isAutumnClear = visualProfile.showAutumn;
            if (w === 'Clouds') {
                s.bobPhase += 0.038 * dt;
                const tSqX = 1 + Math.min(speed * 0.013, 0.22);
                s.squishX += (tSqX - s.squishX) * 0.14 * dt;
                s.squishY += ((1 / tSqX) - s.squishY) * 0.14 * dt;
                const tL = Math.max(-0.23, Math.min(0.23, s.vx * 0.055));
                s.lean += (tL - s.lean) * 0.10 * dt;
            } else if (w === 'Clear' || w === 'Morning') {
                s.sunRot += 0.018 * dt;
                if (isSpringClear) s.sakuraRot += 0.012 * dt;
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
                if (isSpringClear) {
                    drawSakura(t, s.sakuraRot);
                } else if (isAutumnClear) {
                    drawMomiji();
                } else {
                    drawSun(t, s.sunRot);
                }
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
