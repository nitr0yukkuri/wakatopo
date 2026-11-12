'use client'

import Link from 'next/link';
import { localizedPath } from '@/lib/seo';
import { useSearchParams } from 'next/navigation';
import { useWorkNavigation } from './useWorkNavigation';

interface Work {
    id: string;
    title: string;
    cat: string;
    desc: string;
}

export default function WorksList({ works }: { works: Work[] }) {
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const navigateToWork = useWorkNavigation(lang);

    const workPaths: Record<string, string> = { '01': '/github-planet', '02': '/otenkigurashi', '03': '/coldkeep', '04': '/recaptcha-game', '05': '/denshouo' };

    return (
        <>
            <div className="flex flex-col">
                {works.map((work) => (
                    <Link
                        key={work.id}
                        href={localizedPath(workPaths[work.id], lang)}
                        prefetch={false}
                        onClick={(event) => {
                            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                            if (navigateToWork(work.id)) event.preventDefault();
                        }}
                        className="group relative border-t border-white/10 py-7 sm:py-8 md:py-10 grid grid-cols-[2.5rem_minmax(0,1fr)] sm:grid-cols-[3.25rem_minmax(0,1fr)] lg:grid-cols-[4rem_minmax(0,1fr)_minmax(19rem,22rem)] gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-4 lg:gap-x-8 transition-colors hover:bg-white/5 cursor-pointer"
                    >
                        <span className="font-mono text-[10px] sm:text-xs text-gray-600 group-hover:text-cyan-400 transition-colors lg:pt-3">
                            {work.id}
                        </span>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.08] text-gray-300 group-hover:text-white transition-colors break-keep lg:pr-4">
                            {work.title}
                        </h3>

                        <div className="col-start-2 lg:col-start-3 lg:pt-3 pr-1">
                            <div className="text-[10px] sm:text-[11px] font-mono text-cyan-500/80 mb-1.5 sm:mb-2 tracking-wider uppercase">
                                {work.cat}
                            </div>
                            <div className="text-[13px] sm:text-sm leading-relaxed text-gray-500 group-hover:text-gray-400 text-balance">
                                {work.desc}
                            </div>
                        </div>
                    </Link>
                ))}
                <div className="border-t border-white/10" />
            </div>
        </>
    );
}
