'use client';

import { usePathname } from 'next/navigation';

export default function LandscapeLockOverlay() {
  const pathname = usePathname();

  if (pathname === '/card') return null;

  return (
    <div
      className="landscape-lock-overlay"
      role="alert"
      aria-live="assertive"
      aria-label="Orientation lock"
    >
      <div className="landscape-lock-grid" />
      <div className="landscape-lock-panel">
        <p className="landscape-lock-code">ORIENTATION LOCK</p>
        <p className="landscape-lock-message">ROTATE DEVICE // HUMAN VIEW MODE REQUIRED</p>
      </div>
    </div>
  );
}
