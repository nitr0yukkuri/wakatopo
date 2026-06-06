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
      <div className="landscape-lock-panel">
        <div className="landscape-lock-icon" aria-hidden="true">
          <svg viewBox="0 0 96 96" role="img">
            <rect x="34" y="16" width="28" height="54" rx="6" />
            <circle cx="48" cy="62" r="2" />
            <path d="M24 30A28 28 0 0 1 70 18" />
            <path d="M70 18v16H54" />
            <path d="M72 66A28 28 0 0 1 26 78" />
            <path d="M26 78V62h16" />
          </svg>
        </div>
        <p className="landscape-lock-code">ORIENTATION LOCK</p>
        <p className="landscape-lock-title">ROTATE YOUR PHONE</p>
        <p className="landscape-lock-message">Portrait view is required on mobile</p>
      </div>
    </div>
  );
}
