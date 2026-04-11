'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// Initialize Supabase client conditionally based on environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface Cursor {
    x: number;
    y: number;
}

export default function RealtimeRipples() {
    const [remoteCursors, setRemoteCursors] = useState<{ [id: string]: Cursor }>({});
    const localIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!supabase) {
            console.log('RealtimeRipples: Supabase credentials are not set. Ripple effect is disabled.');
            return;
        }

        if (!localIdRef.current) {
            localIdRef.current = crypto.randomUUID();
        }

        const channel = supabase.channel('denshouo-cursors');
        let throttleTimer: number | null = null;
        let isSubscribed = false;

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const updated: { [id: string]: Cursor } = {};
                for (const key in state) {
                    const presenceArray = state[key] as any[];
                    const presence = presenceArray[0];
                    if (presence && presence.userId !== localIdRef.current) {
                        updated[presence.userId] = {
                            x: presence.x,
                            y: presence.y,
                        };
                    }
                }
                setRemoteCursors(updated);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    isSubscribed = true;
                }
            });

        const onPointerMove = (e: PointerEvent) => {
            if (!isSubscribed) return;

            if (throttleTimer) return;
            throttleTimer = window.setTimeout(async () => {
                if (isSubscribed) {
                    // Fire-and-forget track update
                    channel.track({
                        userId: localIdRef.current,
                        x: e.clientX,
                        y: e.clientY,
                    }).catch(() => {});
                }
                throttleTimer = null;
            }, 60); // limit broadcast rate ~16 fps
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });

        return () => {
            isSubscribed = false;
            window.removeEventListener('pointermove', onPointerMove);
            if (throttleTimer) window.clearTimeout(throttleTimer);
            supabase.removeChannel(channel);
        };
    }, []);

    if (!supabase) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[4] overflow-hidden">
            <AnimatePresence>
                {Object.entries(remoteCursors).map(([id, cursor]) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{
                            opacity: 0.85,
                            scale: 1,
                            x: cursor.x - 20,
                            y: cursor.y - 20
                        }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{
                            x: { type: 'spring', damping: 25, stiffness: 120 },
                            y: { type: 'spring', damping: 25, stiffness: 120 },
                            opacity: { duration: 0.5 },
                            scale: { duration: 0.5 }
                        }}
                        className="absolute top-0 left-0 mix-blend-screen"
                    >
                        {/* 鼓動(Pulse)する波紋のような発光体 */}
                        <motion.div
                            className="w-10 h-10 rounded-full border border-teal-200/50 bg-teal-200/10 shadow-[0_0_24px_rgba(45,212,191,0.5)] flex items-center justify-center"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-100 shadow-[0_0_12px_rgba(255,255,255,1)]" />
                        </motion.div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
