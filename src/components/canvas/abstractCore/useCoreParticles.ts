import { useMemo } from 'react';

const CORE_PARTICLE_COUNT = 1200;

export type CoreParticleState = {
    particleCount: number;
    positions: Float32Array;
    randoms: Float32Array;
    baseRadii: Float32Array;
    baseYs: Float32Array;
};

export const useCoreParticles = (): CoreParticleState => {
    const particleState = useMemo(() => {
        const pos = new Float32Array(CORE_PARTICLE_COUNT * 3);
        const rnd = new Float32Array(CORE_PARTICLE_COUNT);
        const br = new Float32Array(CORE_PARTICLE_COUNT);
        const by = new Float32Array(CORE_PARTICLE_COUNT);

        for (let i = 0; i < CORE_PARTICLE_COUNT; i++) {
            const theta = Math.random() * Math.PI * 2;
            const isInnerRing = Math.random() > 0.5;
            const r = isInnerRing ? (2.1 + Math.random() * 0.4) : (2.8 + Math.random() * 0.8);

            const thickness = isInnerRing ? 0.05 : 0.2;
            const y = (Math.random() - 0.5) * thickness;

            pos[i * 3] = r * Math.cos(theta);
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = r * Math.sin(theta);

            rnd[i] = Math.random();
            br[i] = r;
            by[i] = y;
        }

        return {
            particleCount: CORE_PARTICLE_COUNT,
            positions: pos,
            randoms: rnd,
            baseRadii: br,
            baseYs: by,
        };
    }, []);

    return particleState;
};
