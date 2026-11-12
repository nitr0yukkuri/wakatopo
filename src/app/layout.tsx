import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import LocaleSync from "@/components/LocaleSync";
import ClientRuntime from "@/components/ClientRuntime";
import WorldStateProvider from "@/components/WorldStateProvider";
import DelayedAnalytics from "@/components/DelayedAnalytics";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isGaEnabled = process.env.NODE_ENV === "production" && !!GA_MEASUREMENT_ID;

// PWA用にテーマカラー（ステータスバーの色）を設定
export const viewport: Viewport = {
  themeColor: "#020202",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wakato.tech"),
  title: "WAKATO | Living Planet Portfolio",
  description: "WAKATO（わかと）の没入型3Dポートフォリオ。",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = (await headers()).get("x-wakato-lang") === "en" ? "en" : "ja";
  return (
    <html lang={lang} data-lang={lang} suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <noscript><style>{'[data-readable-without-js] { opacity: 1 !important; transform: none !important; }'}</style></noscript>
        {isGaEnabled && <DelayedAnalytics measurementId={GA_MEASUREMENT_ID} />}
        <Suspense fallback={null}>
          <LocaleSync />
        </Suspense>
        <Suspense fallback={null}>
          <WorldStateProvider>
            <ClientRuntime />
            <div className="overflow-x-clip">
              {children}
            </div>
          </WorldStateProvider>
        </Suspense>
        <div
          className="landscape-lock-overlay"
          role="alert"
          aria-live="assertive"
          aria-label="Orientation lock"
        >
          <div className="landscape-lock-panel">
            <div className="landscape-lock-icon" aria-hidden="true">
              <svg viewBox="0 0 96 96" focusable="false">
                <rect x="34" y="16" width="28" height="54" rx="6" />
                <circle cx="48" cy="62" r="2" />
              </svg>
            </div>
            <p className="landscape-lock-code">ORIENTATION LOCK</p>
            <p className="landscape-lock-title">ROTATE YOUR PHONE</p>
            <p className="landscape-lock-message">Portrait view is required on mobile</p>
          </div>
        </div>
      </body>
    </html>
  );
}
