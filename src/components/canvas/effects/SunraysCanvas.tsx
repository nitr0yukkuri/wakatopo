'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle { x: number; y: number; vx: number; vy: number; r: number; life: number; phase: number; tone: number; }

type SunraysVariant = 'default' | 'summer-clear' | 'geshi-clear' | 'spring-clear' | 'autumn-clear';

export default function SunraysCanvas({ variant = 'default' }: { variant?: SunraysVariant }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isSummerClear = variant === 'summer-clear';
    const isGeshiClear = variant === 'geshi-clear';
    const isHotClear = isSummerClear || isGeshiClear;
    const isSpringClear = variant === 'spring-clear';
    const isAutumnClear = variant === 'autumn-clear';

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        let raf: number;
        let t = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // 浮遊ダスト粒子
        const particles: Particle[] = Array.from({ length: isGeshiClear ? 0 : isHotClear ? 128 : isSpringClear ? 124 : isAutumnClear ? 128 : 90 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: isSpringClear
                ? Math.random() * 0.22 + 0.04
                : isAutumnClear
                    ? Math.random() * 0.24 + 0.06
                    : (Math.random() - 0.5) * (isHotClear ? 0.42 : 0.25),
            vy: isSpringClear
                ? Math.random() * 0.34 + 0.16
                : isAutumnClear
                    ? Math.random() * 0.28 + 0.1
                    : -(Math.random() * (isHotClear ? 0.58 : 0.45) + 0.08),
            r: Math.random() * (isHotClear ? 2.2 : isSpringClear ? 2.6 : isAutumnClear ? 2.6 : 1.8) + 0.3,
            life: Math.random(),
            phase: Math.random() * Math.PI * 2,
            tone: Math.random(),
        }));

        function draw() {
            t += 0.004;
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            // 右上の太陽本体
            const sunX = w * 0.88;
            const sunY = h * 0.08;
            const sunR = Math.max(34, Math.min(w, h) * 0.055);
            const sunAuraScale = isGeshiClear ? 3.85 : isSummerClear ? 3.45 : isSpringClear ? 2.75 : isAutumnClear ? 2.75 : 2.65;

            const sunAura = ctx.createRadialGradient(sunX, sunY, sunR * 0.16, sunX, sunY, sunR * sunAuraScale);
            if (isGeshiClear) {
                sunAura.addColorStop(0, 'rgba(255,255,255,0.68)');
                sunAura.addColorStop(0.22, 'rgba(255,244,188,0.3)');
                sunAura.addColorStop(0.58, 'rgba(255,226,126,0.13)');
                sunAura.addColorStop(1, 'rgba(255,226,126,0)');
            } else if (isSummerClear) {
                sunAura.addColorStop(0, 'rgba(255,255,255,0.62)');
                sunAura.addColorStop(0.24, 'rgba(255,238,168,0.28)');
                sunAura.addColorStop(0.58, 'rgba(68,176,255,0.19)');
                sunAura.addColorStop(1, 'rgba(21,128,220,0)');
            } else if (isSpringClear) {
                sunAura.addColorStop(0, 'rgba(255,252,250,0.58)');
                sunAura.addColorStop(0.2, 'rgba(255,214,224,0.34)');
                sunAura.addColorStop(0.48, 'rgba(255,176,205,0.2)');
                sunAura.addColorStop(1, 'rgba(255,176,205,0)');
            } else if (isAutumnClear) {
                sunAura.addColorStop(0, 'rgba(255,255,248,0.52)');
                sunAura.addColorStop(0.26, 'rgba(246,228,170,0.2)');
                sunAura.addColorStop(0.68, 'rgba(204,176,108,0.055)');
                sunAura.addColorStop(1, 'rgba(204,176,108,0)');
            } else {
                sunAura.addColorStop(0, 'rgba(255,238,188,0.4)');
                sunAura.addColorStop(0.5, 'rgba(255,214,146,0.2)');
                sunAura.addColorStop(1, 'rgba(255,190,132,0)');
            }
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR * sunAuraScale, 0, Math.PI * 2);
            ctx.fillStyle = sunAura;
            ctx.fill();

            const sunBody = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, sunR * 0.18, sunX, sunY, sunR);
            if (isGeshiClear) {
                sunBody.addColorStop(0, 'rgba(255,255,255,1)');
                sunBody.addColorStop(0.46, 'rgba(255,254,240,0.99)');
                sunBody.addColorStop(1, 'rgba(255,235,152,0.92)');
            } else if (isSummerClear) {
                sunBody.addColorStop(0, 'rgba(255,255,255,1)');
                sunBody.addColorStop(0.5, 'rgba(255,253,238,0.99)');
                sunBody.addColorStop(1, 'rgba(255,232,156,0.9)');
            } else if (isSpringClear) {
                sunBody.addColorStop(0, 'rgba(255,255,255,1)');
                sunBody.addColorStop(0.28, 'rgba(255,248,244,0.99)');
                sunBody.addColorStop(0.58, 'rgba(255,220,215,0.96)');
                sunBody.addColorStop(1, 'rgba(255,184,210,0.88)');
            } else if (isAutumnClear) {
                sunBody.addColorStop(0, 'rgba(255,255,255,1)');
                sunBody.addColorStop(0.24, 'rgba(255,253,230,0.98)');
                sunBody.addColorStop(0.56, 'rgba(239,216,148,0.82)');
                sunBody.addColorStop(1, 'rgba(190,160,94,0.42)');
            } else {
                sunBody.addColorStop(0, 'rgba(255,252,236,0.98)');
                sunBody.addColorStop(0.45, 'rgba(255,236,180,0.98)');
                sunBody.addColorStop(1, 'rgba(255,198,116,0.95)');
            }
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
            ctx.fillStyle = sunBody;
            ctx.fill();

            // ダストパーティクル
            for (const p of particles) {
                p.x += p.vx + Math.sin(t * (isSpringClear ? 0.9 : isAutumnClear ? 0.82 : 0.55) + p.phase) * (isSpringClear ? 0.18 : isAutumnClear ? 0.2 : 0.1);
                p.y += isSpringClear || isAutumnClear ? p.vy : p.vy * 0.85;
                p.life += isSpringClear ? 0.002 : isAutumnClear ? 0.0021 : 0.0035;
                if (p.life > 1) {
                    p.life = 0;
                    if (!isSpringClear && !isAutumnClear) {
                        p.y = canvas.height + 5;
                        p.x = Math.random() * canvas.width;
                    }
                }
                if (isSpringClear && (p.y > canvas.height + 8 || p.x > canvas.width + 8)) { p.y = -8; p.x = Math.random() * canvas.width; }
                if (isAutumnClear && (p.y > canvas.height + 8 || p.x > canvas.width + 8)) { p.y = -8; p.x = Math.random() * canvas.width; }
                if (!isSpringClear && !isAutumnClear && p.y < -5) { p.y = canvas.height + 5; }
                const a = Math.sin(p.life * Math.PI) * (isHotClear ? 0.52 : isSpringClear ? 0.36 : isAutumnClear ? 0.38 : 0.42);
                if (isSpringClear) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.sin(t * 1.4 + p.phase) * 0.7 + p.phase);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.r * 1.8, p.r * 0.72, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255,198,216,${a * 0.74})`;
                    ctx.fill();
                    ctx.restore();
                } else if (isAutumnClear) {
                    const leafColor = p.tone > 0.72
                        ? `rgba(205,126,52,${a * 0.72})`
                        : p.tone > 0.38
                            ? `rgba(222,172,55,${a * 0.72})`
                            : `rgba(238,207,82,${a * 0.66})`;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(Math.sin(t * 1.1 + p.phase) * 0.5 + p.phase);
                    ctx.beginPath();
                    ctx.moveTo(0, -p.r * 1.55);
                    ctx.bezierCurveTo(p.r * 1.55, -p.r * 1.0, p.r * 1.35, p.r * 0.72, p.r * 0.18, p.r * 1.45);
                    ctx.bezierCurveTo(-p.r * 1.05, p.r * 0.9, -p.r * 1.62, -p.r * 0.62, 0, -p.r * 1.55);
                    ctx.fillStyle = leafColor;
                    ctx.fill();
                    ctx.strokeStyle = `rgba(132,92,42,${a * 0.24})`;
                    ctx.lineWidth = Math.max(0.45, p.r * 0.2);
                    ctx.stroke();
                    ctx.strokeStyle = `rgba(255,239,166,${a * 0.36})`;
                    ctx.lineWidth = Math.max(0.38, p.r * 0.15);
                    ctx.beginPath();
                    ctx.moveTo(0, -p.r * 1.05);
                    ctx.lineTo(p.r * 0.1, p.r * 1.05);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(p.r * 0.06, p.r * 1.04);
                    ctx.lineTo(p.r * 0.42, p.r * 1.55);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = isGeshiClear
                        ? `rgba(236,250,255,${a * 0.68})`
                        : isSummerClear
                            ? `rgba(248,253,255,${a * 0.76})`
                            : `rgba(255,244,216,${a * 0.82})`;
                    ctx.fill();
                }
            }

            raf = requestAnimationFrame(draw);
        }
        draw();

        return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
    }, [isAutumnClear, isGeshiClear, isHotClear, isSpringClear, isSummerClear]);

    const baseGlow = isGeshiClear
        ? 'radial-gradient(ellipse 70% 54% at 86% -10%, rgba(255,246,192,0.18) 0%, rgba(118,202,255,0.13) 30%, rgba(43,154,240,0.14) 54%, transparent 78%)'
        : isSummerClear
        ? 'radial-gradient(ellipse 66% 54% at 86% -10%, rgba(84,183,255,0.22) 0%, rgba(255,230,156,0.08) 24%, rgba(40,153,238,0.11) 44%, transparent 74%)'
        : isSpringClear
            ? 'radial-gradient(ellipse 62% 50% at 86% -10%, rgba(255,232,214,0.2) 0%, rgba(255,196,214,0.12) 34%, transparent 72%)'
        : isAutumnClear
            ? 'radial-gradient(ellipse 62% 50% at 86% -10%, rgba(255,238,172,0.16) 0%, rgba(218,184,94,0.08) 38%, transparent 74%)'
        : 'radial-gradient(ellipse 62% 50% at 86% -10%, rgba(255,228,172,0.18) 0%, rgba(255,205,150,0.08) 38%, transparent 72%)';
    const pulseGlow = isGeshiClear
        ? 'radial-gradient(ellipse 62% 48% at 86% -14%, rgba(255,252,224,0.16) 0%, rgba(105,199,255,0.13) 44%, transparent 76%)'
        : isSummerClear
        ? 'radial-gradient(ellipse 58% 46% at 86% -14%, rgba(255,248,216,0.18) 0%, rgba(91,195,255,0.12) 44%, transparent 76%)'
        : isSpringClear
            ? 'radial-gradient(ellipse 58% 46% at 86% -14%, rgba(255,244,228,0.16) 0%, rgba(255,190,210,0.1) 44%, transparent 76%)'
        : isAutumnClear
            ? 'radial-gradient(ellipse 58% 46% at 86% -14%, rgba(255,242,190,0.12) 0%, rgba(214,178,88,0.075) 46%, transparent 76%)'
        : 'radial-gradient(ellipse 56% 44% at 86% -14%, rgba(255,236,188,0.16) 0%, rgba(255,214,160,0.06) 44%, transparent 76%)';
    const wash = isGeshiClear
        ? 'linear-gradient(to bottom, rgba(56,166,245,0.12) 0%, rgba(118,205,255,0.065) 36%, transparent 74%)'
        : isSummerClear
        ? 'linear-gradient(to bottom, rgba(39,157,245,0.11) 0%, rgba(98,192,255,0.055) 34%, transparent 72%)'
        : isSpringClear
            ? 'linear-gradient(to bottom, rgba(255,215,225,0.07) 0%, rgba(255,236,216,0.035) 34%, transparent 72%)'
        : isAutumnClear
            ? 'linear-gradient(to bottom, rgba(214,178,86,0.052) 0%, rgba(238,214,140,0.028) 36%, transparent 74%)'
        : 'linear-gradient(to bottom, rgba(255,222,180,0.07) 0%, rgba(255,215,170,0.03) 34%, transparent 72%)';
    const summerAtmosphere = 'radial-gradient(ellipse 78% 46% at 48% 4%, rgba(90,184,255,0.14) 0%, rgba(92,177,235,0.08) 42%, rgba(92,177,235,0) 72%), linear-gradient(to bottom, rgba(71,165,235,0.08) 0%, rgba(71,165,235,0.03) 38%, transparent 66%)';
    const geshiAtmosphere = 'radial-gradient(ellipse 82% 48% at 48% 4%, rgba(98,196,255,0.16) 0%, rgba(72,174,245,0.095) 44%, rgba(72,174,245,0) 74%), linear-gradient(to bottom, rgba(54,163,240,0.09) 0%, rgba(118,205,255,0.045) 42%, transparent 70%)';
    const geshiFarHaze = 'linear-gradient(90deg, transparent 0%, rgba(245,252,255,0.032) 18%, rgba(150,220,255,0.044) 46%, rgba(245,252,255,0.028) 72%, transparent 100%)';
    const geshiSunHaze = 'radial-gradient(ellipse at center, rgba(255,255,255,0.036) 0%, rgba(168,226,255,0.052) 36%, rgba(168,226,255,0.018) 62%, transparent 78%)';
    const springGroundHaze = 'radial-gradient(ellipse 78% 34% at 50% 100%, rgba(255,236,242,0.18) 0%, rgba(255,198,218,0.12) 32%, rgba(255,244,236,0.07) 58%, transparent 82%), linear-gradient(to top, rgba(255,216,228,0.09) 0%, rgba(255,239,232,0.045) 38%, transparent 76%)';
    const autumnGroundHaze = 'radial-gradient(ellipse 78% 32% at 50% 100%, rgba(232,202,112,0.12) 0%, rgba(196,151,74,0.07) 34%, rgba(248,226,154,0.045) 60%, transparent 84%), linear-gradient(to top, rgba(199,157,78,0.06) 0%, rgba(238,213,139,0.028) 40%, transparent 78%)';

    return (
        <motion.div
            className="fixed inset-0 z-10 pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
        >
            {/* 朝日のやわらかい暖色グロー */}
            {isHotClear && (
                <div
                    className="absolute inset-0"
                    style={{ background: isGeshiClear ? geshiAtmosphere : summerAtmosphere }}
                />
            )}
            <div
                className="absolute inset-0"
                style={{ background: baseGlow }}
            />
            <motion.div
                className="absolute inset-0"
                style={{ background: pulseGlow }}
                animate={{ opacity: isSummerClear ? [0.62, 1, 0.72] : [0.55, 0.92, 0.64] }}
                transition={{ duration: isSummerClear ? 4.8 : 6.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
                className="absolute inset-0"
                style={{ background: wash }}
            />
            {isGeshiClear && (
                <>
                    <motion.div
                        className="absolute left-[18%] top-[14%] h-[18%] w-[58%] rounded-[50%] border-t border-sky-100/20"
                        style={{
                            transform: 'rotate(-5deg)',
                            maskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)',
                        }}
                        animate={{ opacity: [0.16, 0.3, 0.18] }}
                        transition={{ duration: 8.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={`geshi-far-haze-${index}`}
                            className="absolute left-[10%] h-[5%] w-[74%] blur-sm"
                            style={{
                                top: `${30 + index * 7}%`,
                                background: geshiFarHaze,
                                backdropFilter: 'blur(1.6px)',
                                WebkitBackdropFilter: 'blur(1.6px)',
                                maskImage: 'linear-gradient(90deg, transparent 0%, black 22%, black 76%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 22%, black 76%, transparent 100%)',
                            }}
                            animate={{
                                x: index % 2 === 0 ? ['-0.7%', '0.9%', '-0.45%'] : ['0.6%', '-0.8%', '0.5%'],
                                opacity: index === 1 ? [0.16, 0.28, 0.18] : [0.1, 0.22, 0.13],
                                scaleY: [0.82, 1.18, 0.9],
                            }}
                            transition={{ duration: 7.2 + index * 1.15, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    ))}
                    {[0, 1].map((index) => (
                        <motion.div
                            key={`geshi-sun-haze-${index}`}
                            className="absolute rounded-full blur-sm"
                            style={{
                                right: `${3.8 + index * 2.6}%`,
                                top: `${1.4 + index * 2.4}%`,
                                width: `${18 - index * 3}%`,
                                height: `${18 - index * 3}%`,
                                background: geshiSunHaze,
                                backdropFilter: 'blur(1.4px)',
                                WebkitBackdropFilter: 'blur(1.4px)',
                            }}
                            animate={{
                                x: index === 0 ? ['-0.4%', '0.65%', '-0.28%'] : ['0.5%', '-0.55%', '0.35%'],
                                y: index === 0 ? ['0%', '0.35%', '-0.15%'] : ['0.2%', '-0.25%', '0.1%'],
                                opacity: index === 0 ? [0.18, 0.34, 0.2] : [0.12, 0.26, 0.15],
                                scaleX: [0.96, 1.04, 0.98],
                            }}
                            transition={{ duration: 6.8 + index * 1.1, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    ))}
                </>
            )}
            {isSpringClear && (
                <motion.div
                    className="absolute inset-x-0 bottom-0 h-[32%]"
                    style={{ background: springGroundHaze }}
                    animate={{ opacity: [0.62, 0.86, 0.7] }}
                    transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
            {isAutumnClear && (
                <motion.div
                    className="absolute inset-x-0 bottom-0 h-[30%]"
                    style={{ background: autumnGroundHaze }}
                    animate={{ opacity: [0.54, 0.78, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
            )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </motion.div>
    );
}
