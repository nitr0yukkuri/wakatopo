'use client'

import { useStore } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface Work {
    id: string;
    title: string;
    cat: string;
    desc: string;
}

export default function WorksList({ works }: { works: Work[] }) {
    const { setActiveWork, activeWorkId, setTransitionType } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const withLang = (path: string) => `${path}?lang=${lang}`;

    useEffect(() => {
        // ... (スクロール無効化はGlobalTransitionOverlayに移動したので削除)
    }, []);

    const handleWorkClick = (id: string) => {
        if (id === '01') {
            setActiveWork('01');
            setTransitionType('warp');
            setTimeout(() => {
                router.push(withLang('/github-planet'));
                // 次のページが表示され、オーバレイがフェードアウトする時間を確保するため少し長めに待つ
                setTimeout(() => setTransitionType('none'), 1000);
            }, 1400);
        } else if (id === '02') {
            setActiveWork('02');

            // 天候に応じて遷移アニメーションを分岐
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
                setTransitionType('moonrise'); // Night
            }

            setTimeout(() => {
                router.push(withLang('/otenkigurashi'));
                setTimeout(() => setTransitionType('none'), 1000);
            }, 2000);
        } else if (id === '03') {
            setActiveWork('03');
            setTransitionType('freeze');
            setTimeout(() => {
                router.push(withLang('/coldkeep'));
                setTimeout(() => setTransitionType('none'), 1000);
            }, 2000);
        } else if (id === '04') {
            setActiveWork('04');
            setTransitionType('captcha-lock');
            setTimeout(() => {
                router.push(withLang('/recaptcha-game'));
                setTimeout(() => setTransitionType('none'), 900);
            }, 1650);
        } else if (id === '05') {
            setActiveWork('05');
            setTransitionType('wave');
            setTimeout(() => {
                router.push(withLang('/denshouo'));
                setTimeout(() => setTransitionType('none'), 900);
            }, 1800);
        } else {
            setActiveWork(activeWorkId === id ? null : id);
        }
    };

    return (
        <>
            <div className="flex flex-col">
                {works.map((work) => (
                    <div
                        key={work.id}
                        onClick={() => handleWorkClick(work.id)}
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
                    </div>
                ))}
                <div className="border-t border-white/10" />
            </div>
        </>
    );
}