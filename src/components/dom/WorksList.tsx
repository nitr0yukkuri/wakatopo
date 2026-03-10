'use client'

import { useStore } from '@/store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import WarpEffectCanvas from '@/components/canvas/WarpEffectCanvas';
import CloudAscentCanvas from '@/components/canvas/CloudAscentCanvas';

interface Work {
    id: string;
    title: string;
    cat: string;
    desc: string;
}

export default function WorksList({ works }: { works: Work[] }) {
    const { setActiveWork, activeWorkId } = useStore();
    const router = useRouter();
    // 'none' | 'warp' | 'cloud'
    const [transitionType, setTransitionType] = useState<'none' | 'warp' | 'cloud'>('none');

    useEffect(() => {
        // トランジション中はスクロールを無効化
        if (transitionType !== 'none') {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [transitionType]);

    const handleWorkClick = (id: string) => {
        if (id === '01') {
            setActiveWork('01');
            setTransitionType('warp');
            setTimeout(() => {
                router.push('/github-planet');
                setTimeout(() => setTransitionType('none'), 500);
            }, 2000);
        } else if (id === '02') {
            setActiveWork('02');
            setTransitionType('cloud');
            setTimeout(() => {
                router.push('/otenkigurashi');
                setTimeout(() => setTransitionType('none'), 500);
            }, 2000);
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
                        className="group relative border-t border-white/10 py-12 flex flex-col md:flex-row md:items-baseline justify-between transition-colors hover:bg-white/5 cursor-pointer"
                    >
                        <span className="font-mono text-xs text-gray-600 mb-2 md:mb-0 w-16 group-hover:text-cyan-400 transition-colors">
                            {work.id}
                        </span>

                        <h3 className="text-3xl md:text-5xl font-bold text-gray-300 group-hover:text-white transition-colors flex-1">
                            {work.title}
                        </h3>

                        <div className="mt-4 md:mt-0 md:text-right">
                            <div className="text-[10px] font-mono text-cyan-500/80 mb-1 tracking-wider uppercase">
                                {work.cat}
                            </div>
                            <div className="text-sm text-gray-500 group-hover:text-gray-400">
                                {work.desc}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="border-t border-white/10" />
            </div>

            {transitionType === 'warp' && (
                <div className="fixed inset-0 z-[9999] pointer-events-auto bg-[#000000] animate-fade-in">
                    <WarpEffectCanvas />
                </div>
            )}

            {transitionType === 'cloud' && (
                <div className="fixed inset-0 z-[9999] pointer-events-auto bg-[#000000] animate-fade-in">
                    <CloudAscentCanvas />
                </div>
            )}
        </>
    );
}
