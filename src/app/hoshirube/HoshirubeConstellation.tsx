'use client';

import { useEffect, useRef } from 'react';
import { createRenderer, type Renderer } from './webgl/renderer';
import styles from './hoshirube-constellation.module.css';

type Language = 'ja' | 'en';

const WORLDS = [
    { id: 'phi', ja: '哲学', en: 'Philosophy', x: -0.9, y: 0.12 },
    { id: 'his', ja: '歴史', en: 'History', x: -0.6, y: -0.62 },
    { id: 'soc', ja: '社会', en: 'Society', x: -0.05, y: -0.75 },
    { id: 'sci', ja: '自然科学', en: 'Natural science', x: 0.78, y: 0.32 },
    { id: 'tec', ja: 'テクノロジー', en: 'Technology', x: 0.75, y: -0.55 },
    { id: 'mon', ja: 'ものづくり', en: 'Making', x: 0, y: 0 },
    { id: 'art', ja: '芸術', en: 'Arts', x: -0.7, y: 0.72 },
    { id: 'lan', ja: '言語', en: 'Language', x: 0.25, y: 0.74 },
    { id: 'lit', ja: '文学', en: 'Literature', x: -0.38, y: 0.4 },
] as const;

const CONNECTIONS = [
    ['mon', 'tec'], ['mon', 'art'], ['mon', 'sci'], ['phi', 'soc'],
    ['his', 'soc'], ['lan', 'lit'], ['lit', 'phi'], ['his', 'lit'],
    ['art', 'lit'], ['soc', 'tec'], ['sci', 'tec'], ['lan', 'soc'],
] as const;

const BACKGROUND_COLOR = [0.6, 0.75, 1] as const;
const TIER_ZERO_COLOR = [0.45, 0.5, 0.68] as const;

export default function HoshirubeConstellation({ lang }: { lang: Language }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const labelsRef = useRef<Record<string, HTMLSpanElement | null>>({});

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let renderer: Renderer | null = null;
        try {
            renderer = createRenderer(canvas);
        } catch { /* Keep the HTML labels available when WebGL cannot initialize. */ }

        const backgroundStars = Array.from({ length: 130 }, () => [
            Math.random(),
            Math.random(),
            2 + Math.random() * 5,
            0.25 + Math.random() * 0.5,
            Math.random(),
        ]);
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        let reducedMotion = motionPreference.matches;
        let frameId = 0;
        let contextLost = false;
        let disposed = false;

        const draw = (time: number) => {
            frameId = 0;
            if (document.hidden || contextLost || disposed) return;

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const ratio = window.devicePixelRatio || 1;
            const wide = width > 760;
            const centerX = width / 2;
            const centerY = height / 2;
            const scaleX = Math.min(width * 0.4, height * 0.62);
            const scaleY = height * (wide ? 0.36 : 0.3);
            const points: number[] = [];
            const lines: number[] = [];
            const positions = new Map<string, [number, number]>();

            backgroundStars.forEach((star) => {
                points.push(
                    star[0] * width * ratio,
                    star[1] * height * ratio,
                    star[2] * ratio,
                    star[3],
                    star[4],
                    ...BACKGROUND_COLOR,
                );
            });

            WORLDS.forEach((world) => {
                const x = centerX + world.x * scaleX;
                const y = centerY + world.y * scaleY;
                positions.set(world.id, [x, y]);
                const label = labelsRef.current[world.id];
                if (label) {
                    label.style.transform = `translate(${x - 18}px,${y - 18}px)`;
                    label.style.opacity = '1';
                    const labelWidth = label.getBoundingClientRect().width;
                    const mobile = width <= 760;
                    const offset = mobile ? 8 : 12;
                    const rightOverflows = x + offset + labelWidth > width - 12;
                    const leftFits = x - offset - labelWidth >= 12;
                    label.classList.toggle(styles.labelLeft, rightOverflows && leftFits);
                }

                points.push(
                    x * ratio,
                    y * ratio,
                    24 * ratio,
                    0.5,
                    (x * 0.013) % 1,
                    ...TIER_ZERO_COLOR,
                );
            });

            CONNECTIONS.forEach(([from, to]) => {
                const a = positions.get(from);
                const b = positions.get(to);
                if (!a || !b) return;
                lines.push(a[0] * ratio, a[1] * ratio, 0.1, b[0] * ratio, b[1] * ratio, 0.1);
            });

            renderer?.draw(points, lines, reducedMotion ? 0 : time / 1000);
            if (renderer && !reducedMotion) frameId = window.requestAnimationFrame(draw);
        };

        const scheduleDraw = () => {
            if (!frameId && !document.hidden && !contextLost && !disposed) {
                frameId = window.requestAnimationFrame(draw);
            }
        };
        const onVisibilityChange = () => {
            if (document.hidden) {
                window.cancelAnimationFrame(frameId);
                frameId = 0;
            } else scheduleDraw();
        };
        const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
            reducedMotion = event.matches;
            scheduleDraw();
        };
        const onContextLost = (event: Event) => {
            event.preventDefault();
            contextLost = true;
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('resize', scheduleDraw);
        motionPreference.addEventListener('change', onMotionPreferenceChange);
        canvas.addEventListener('webglcontextlost', onContextLost);
        scheduleDraw();

        return () => {
            disposed = true;
            window.cancelAnimationFrame(frameId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            window.removeEventListener('resize', scheduleDraw);
            motionPreference.removeEventListener('change', onMotionPreferenceChange);
            canvas.removeEventListener('webglcontextlost', onContextLost);
            renderer?.dispose();
        };
    }, []);

    const title = lang === 'ja' ? 'ほしるべの大ジャンル星図' : 'Hoshirube main theme star map';

    return (
        <div className={styles.stage} role="img" aria-label={title}>
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
            <div className={styles.labels} aria-hidden="true">
                {WORLDS.map((world) => (
                    <span
                        key={world.id}
                        ref={(element) => { labelsRef.current[world.id] = element; }}
                        className={styles.label}
                    >
                        <span>{world[lang]}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

