'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function TopLeftMenu() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
                className="group inline-flex w-fit items-center gap-3 rounded-md border border-cyan-400/35 bg-[#05080d]/80 px-3 py-2 text-left transition-colors hover:border-cyan-300"
            >
                <span className="text-white font-bold text-sm tracking-widest group-hover:text-cyan-300 transition-colors">
                    WAKATO <span className="text-cyan-500 group-hover:text-white transition-colors">//</span> PORTFOLIO
                </span>
                <span className="inline-flex h-5 w-5 flex-col justify-center gap-0.5">
                    <span className={`h-px w-full bg-cyan-300 transition-transform ${open ? 'translate-y-1 rotate-45' : ''}`} />
                    <span className={`h-px w-full bg-cyan-300 transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`} />
                    <span className={`h-px w-full bg-cyan-300 transition-transform ${open ? '-translate-y-1 -rotate-45' : ''}`} />
                </span>
            </button>

            <p className="opacity-70 pointer-events-none">INTERACTIVE WEB EXPERIENCE</p>

            <div
                id="top-left-menu-panel"
                className={`absolute left-0 top-full mt-2 w-[min(84vw,280px)] rounded-md border border-cyan-400/30 bg-[#060a10]/95 p-3 backdrop-blur transition-all ${open ? 'pointer-events-auto opacity-100 translate-y-0' : 'pointer-events-none opacity-0 -translate-y-1'}`}
            >
                <div className="mb-2 text-[10px] tracking-[0.2em] text-cyan-300/80">MENU</div>
                <nav className="flex flex-col gap-1 text-xs font-mono">
                    <Link href="/about" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">ABOUT</Link>
                    <Link href="/github-planet" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">GITHUB PLANET</Link>
                    <Link href="/otenkigurashi" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">OTENKIGURASHI</Link>
                    <Link href="/coldkeep" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">COLDKEEP</Link>
                    <Link href="/recaptcha-game" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">RECAPTCHA GAME</Link>
                    <Link href="/denshouo" className="rounded px-2 py-1.5 text-gray-200 hover:bg-cyan-400/15 hover:text-cyan-200">DENSHOUO</Link>
                </nav>
            </div>
        </div>
    );
}
