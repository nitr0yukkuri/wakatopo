'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { buildWorldStateQuery, canonicalizeWorldStateQuery } from '@/lib/worldState';
import { parseMoonPhaseOverride } from '@/lib/moonPhase';
import type { WorldState } from '@/lib/worldStateTypes';

export type OtenkiSection = 'hero' | 'concept' | 'features' | 'tech' | 'bottom';
export type OtenkiDialogMood = 'happy' | 'neutral' | 'sad' | 'scared' | 'sleepy' | 'looking' | 'surprised' | 'talking';
export type OtenkiDialog = { text: string; mood: OtenkiDialogMood };

type Reaction = OtenkiDialog;
type ReactionMap = Record<'ja' | 'en', readonly Reaction[]>;

export function useOtenkiPageController({
    worldState,
    reactionsByLang,
}: {
    worldState: WorldState;
    reactionsByLang: ReactionMap;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setActiveWork = useStore((state) => state.setActiveWork);
    const lang: 'ja' | 'en' = searchParams.get('lang') === 'en' ? 'en' : 'ja';
    const reactions = reactionsByLang[lang];
    const moonPhaseOverride = parseMoonPhaseOverride(searchParams.get('moonPhase'));
    const [activeSection, setActiveSection] = useState<OtenkiSection>('hero');
    const heroRef = useRef<HTMLDivElement>(null);
    const conceptRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const techRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [overrideDialog, setOverrideDialog] = useState<OtenkiDialog | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showHeavyEffects, setShowHeavyEffects] = useState(false);
    const [isFinePointer] = useState(() => (
        typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
    ));

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleInteract = (text: string, mood: OtenkiDialogMood) => {
        setOverrideDialog({ text, mood });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setOverrideDialog(null), 4000);
    };

    const handleTenchanClick = () => {
        const reaction = reactions[Math.floor(Math.random() * reactions.length)];
        if (reaction) handleInteract(reaction.text, reaction.mood);
    };

    useEffect(() => {
        const hasRouteWorldState = ['weather', 'season', 'seasonEvent'].some((key) => searchParams.has(key));
        if (!hasRouteWorldState) return;

        const canonicalQuery = canonicalizeWorldStateQuery(searchParams, worldState).toString();
        if (canonicalQuery !== searchParams.toString()) {
            router.replace(`/otenkigurashi?${canonicalQuery}`, { scroll: false });
        }
    }, [router, searchParams, worldState]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActiveSection(entry.target.id as OtenkiSection);
            });
        }, { root: null, rootMargin: '-30% 0px -40% 0px', threshold: 0 });

        [heroRef, conceptRef, featuresRef, techRef, bottomRef].forEach((sectionRef) => {
            if (sectionRef.current) observer.observe(sectionRef.current);
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const reveal = () => setShowHeavyEffects(true);
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
        setActiveWork(null);
        router.push(`/?${buildWorldStateQuery(worldState, lang)}`);
    };

    return {
        lang,
        moonPhaseOverride,
        activeSection,
        heroRef,
        conceptRef,
        featuresRef,
        techRef,
        bottomRef,
        overrideDialog,
        showHeavyEffects,
        isFinePointer,
        handleInteract,
        handleTenchanClick,
        handleReturn,
    };
}
