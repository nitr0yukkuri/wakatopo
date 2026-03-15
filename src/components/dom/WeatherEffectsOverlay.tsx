'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';

const SunraysCanvas       = dynamic(() => import('@/components/canvas/effects/SunraysCanvas'),       { ssr: false });
const CloudsOverlayCanvas = dynamic(() => import('@/components/canvas/effects/CloudsOverlayCanvas'), { ssr: false });
const ThunderCanvas       = dynamic(() => import('@/components/canvas/effects/ThunderCanvas'),       { ssr: false });
const SnowCanvas          = dynamic(() => import('@/components/canvas/effects/SnowCanvas'),          { ssr: false });
const NightGlowOverlay    = dynamic(() => import('@/components/canvas/effects/NightGlowOverlay'),    { ssr: false });

export default function WeatherEffectsOverlay() {
  const { weather } = useStore();

  return (
    <AnimatePresence mode="wait">
      {(weather === 'Clear' || weather === 'Morning') && <SunraysCanvas       key="sunrays" />}
      {weather === 'Clouds'  && <CloudsOverlayCanvas key="clouds"  />}
      {weather === 'Thunder' && <ThunderCanvas       key="thunder" />}
      {weather === 'Snow'    && <SnowCanvas          key="snow"    />}
      {weather === 'Night'   && <NightGlowOverlay    key="night"   />}
    </AnimatePresence>
  );
}
