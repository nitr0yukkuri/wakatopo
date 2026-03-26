'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

const MENU_COMMANDS = {
    ja: [
        { href: '/about', label: 'ABOUT', hint: 'PROFILE' },
        { href: '/github-planet', label: 'GITHUB PLANET', hint: 'WORK 01' },
        { href: '/otenkigurashi', label: 'おてんきぐらし', hint: 'WORK 02' },
        { href: '/coldkeep', label: 'COLDKEEP', hint: 'WORK 03' },
        { href: '/recaptcha-game', label: 'RECAPTCHA GAME', hint: 'WORK 04' },
        { href: '/denshouo', label: 'でんしょうお', hint: 'WORK 05' },
    ],
    en: [
        { href: '/about', label: 'ABOUT', hint: 'PROFILE' },
        { href: '/github-planet', label: 'GITHUB PLANET', hint: 'WORK 01' },
        { href: '/otenkigurashi', label: 'OTENKIGURASHI', hint: 'WORK 02' },
        { href: '/coldkeep', label: 'COLDKEEP', hint: 'WORK 03' },
        { href: '/recaptcha-game', label: 'RECAPTCHA GAME', hint: 'WORK 04' },
        { href: '/denshouo', label: 'DENSHOUO', hint: 'WORK 05' },
    ],
} as const;

export default function TopLeftMenu() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const { setActiveWork, setTransitionType } = useStore();
    const commands = MENU_COMMANDS[lang];
    const withLang = (href: string) => `${href}?lang=${lang}`;

    const navigateWithTransition = (href: string) => {
        setOpen(false);

        if (href === '/github-planet') {
            setActiveWork('01');
            setTransitionType('warp');
            setTimeout(() => {
                router.push(withLang('/github-planet'));
                setTimeout(() => setTransitionType('none'), 1000);
            }, 1400);
            return;
        }

        if (href === '/otenkigurashi') {
            setActiveWork('02');
            const currentWeather = useStore.getState().weather;
            if (currentWeather === 'Rain') {
                setTransitionType('rain');
            } else if (currentWeather === 'Snow') {
                setTransitionType('snow');
            } else if (currentWeather === 'Thunder') {
                setTransitionType('flash');
            } else if (currentWeather === 'Clouds') {
                setTransitionType('heavy-cloud');
            } else if (currentWeather === 'Clear' || currentWeather === 'Morning') {
                setTransitionType('sunburst');
            } else {
                setTransitionType('moonrise');
            }
            setTimeout(() => {
                router.push(withLang('/otenkigurashi'));
                setTimeout(() => setTransitionType('none'), 1000);
            }, 2000);
            return;
        }

        if (href === '/coldkeep') {
            setActiveWork('03');
            setTransitionType('freeze');
            setTimeout(() => {
                router.push(withLang('/coldkeep'));
                setTimeout(() => setTransitionType('none'), 1000);
            }, 2000);
            return;
        }

        if (href === '/recaptcha-game') {
            setActiveWork('04');
            setTransitionType('captcha-lock');
            setTimeout(() => {
                router.push(withLang('/recaptcha-game'));
                setTimeout(() => setTransitionType('none'), 900);
            }, 1650);
            return;
        }

        if (href === '/denshouo') {
            setActiveWork('05');
            setTransitionType('wave');
            setTimeout(() => {
                router.push(withLang('/denshouo'));
                setTimeout(() => setTransitionType('none'), 900);
            }, 1800);
            return;
        }

        router.push(withLang(href));
    };

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative flex flex-col gap-2 pointer-events-auto">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-controls="top-left-menu-panel"
                className="group inline-flex w-fit items-center gap-3 rounded-md border border-cyan-400/35 bg-[#05080d]/85 px-3 py-2 text-left transition-colors hover:border-cyan-300"
            >
                <span className="text-white font-bold text-sm tracking-widest group-hover:text-cyan-300 transition-colors">
                    WAKATO <span className="text-cyan-500 group-hover:text-white transition-colors">//</span> PORTFOLIO
                </span>
                <span
                    aria-hidden="true"
                    className="inline-flex h-4 w-4 items-center justify-center rounded border border-cyan-400/35 text-cyan-200/90 transition-colors group-hover:border-cyan-300"
                >
                    <span className={`h-1.5 w-1.5 rounded-full bg-cyan-300 transition-all ${open ? 'scale-100 opacity-100' : 'scale-75 opacity-70'}`} />
                </span>
            </button>

            <p className="opacity-70 pointer-events-none">{lang === 'en' ? 'INTERACTIVE WEB EXPERIENCE' : 'INTERACTIVE WEB EXPERIENCE'}</p>

            <div
                id="top-left-menu-panel"
                className={`absolute left-0 top-full mt-2 w-[min(88vw,360px)] rounded-md border border-cyan-400/30 bg-[#060a10]/95 p-3 backdrop-blur transition-all ${open ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'}`}
            >
                <div className="mb-2 flex items-center justify-between text-[10px] tracking-[0.2em] text-cyan-300/80">
                    <span>COMMAND PALETTE</span>
                    <span className="rounded border border-cyan-400/30 px-1.5 py-0.5 text-[9px] text-cyan-200/70">ESC</span>
                </div>

                <div className="mb-2 rounded border border-cyan-400/20 bg-black/30 px-2 py-1.5 font-mono text-[11px] tracking-wide text-cyan-100/90">
                    <span className="mr-2 text-cyan-400">&gt;</span>
                    {lang === 'en' ? 'open portfolio section' : 'open portfolio section'}
                </div>

                <nav className="flex flex-col gap-1 text-xs font-mono">
                    {commands.map((command, index) => (
                        command.href === '/about' ? (
                            <Link
                                key={command.href}
                                href={withLang(command.href)}
                                onClick={() => setOpen(false)}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200"
                            >
                                <span className="text-cyan-400/70">{String(index + 1).padStart(2, '0')}</span>
                                <span>{command.label}</span>
                                <span className="text-[10px] tracking-[0.16em] text-cyan-200/60">{command.hint}</span>
                            </Link>
                        ) : (
                            <button
                                key={command.href}
                                type="button"
                                onClick={() => navigateWithTransition(command.href)}
                                className="grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200 text-left"
                            >
                                <span className="text-cyan-400/70">{String(index + 1).padStart(2, '0')}</span>
                                <span>{command.label}</span>
                                <span className="text-[10px] tracking-[0.16em] text-cyan-200/60">{command.hint}</span>
                            </button>
                        )
                    ))}
                </nav>
            </div>
        </div>
    );
}
