import type { Metadata, Viewport } from "next";
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
  description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。プロダクト価値から逆算して必要な領域を横断するSWEを目指しています。",
  keywords: ["ポートフォリオ", "3D", "インタラクション", "SWE", "GitHub", "Three.js", "React"],
  openGraph: {
    title: "WAKATO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    url: "https://wakato.tech",
    siteName: "WAKATO",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://wakato.tech/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "WAKATO Portfolio",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WAKATO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    creator: "@nitr0yukkuri",
    images: ["https://wakato.tech/opengraph-image.png"],
  },
  icons: {
    icon: "/faviconwakato.png",
    apple: "/faviconwakato.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              name: "WAKATO",
              url: "https://wakato.tech",
              description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。プロダクト価値から逆算して必要な領域を横断するSWEを目指しています。",
              image: "https://wakato.tech/faviconwakato.png",
              mainEntity: {
                "@type": "Person",
                name: "WAKATO (nitr0yukkuri)",
                url: "https://wakato.tech",
                image: "https://wakato.tech/faviconwakato.png",
                description: "プロダクト価値から逆算して必要な領域を横断するSWEを目指しています",
                jobTitle: "Interactive Web Developer / Creative Coder",
                sameAs: ["https://github.com/nitr0yukkuri", "https://twitter.com/nitr0yukkuri"],
              },
            }),
          }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
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
