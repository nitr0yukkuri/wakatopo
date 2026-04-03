import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, Zen_Kaku_Gothic_New } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import GlobalTransitionOverlay from "@/components/GlobalTransitionOverlay";
import PwaRegister from "@/components/PwaRegister";
import SoundDirector from "@/components/SoundDirector";
import LocaleSync from "@/components/LocaleSync";

export const dynamic = 'force-dynamic';

const outfit = Outfit({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});


const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-japanese",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isGaEnabled = process.env.NODE_ENV === "production" && !!GA_MEASUREMENT_ID;

// PWA用にテーマカラー（ステータスバーの色）を設定
export const viewport: Viewport = {
  themeColor: "#020202",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wakatopo.vercel.app"),
  title: "WAKATO | Living Planet Portfolio",
  description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。3D・インタラクション実装を得意とするフロントエンドエンジニア。",
  keywords: ["ポートフォリオ", "3D", "インタラクション", "フロントエンド", "GitHub", "Three.js", "React"],
  openGraph: {
    title: "WAKATO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    url: "https://wakatopo.vercel.app",
    siteName: "WAKATO",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://wakatopo.vercel.app/wakato_gemini_logo.png",
        width: 2816,
        height: 1536,
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
    images: ["https://wakatopo.vercel.app/wakato_gemini_logo.png"],
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
        <link rel="preconnect" href="https://image.thum.io" />
        <link rel="dns-prefetch" href="https://image.thum.io" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              name: "WAKATO",
              url: "https://wakatopo.vercel.app",
              description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。フロントエンドエンジニア。",
              image: "https://wakatopo.vercel.app/faviconwakato.png",
              mainEntity: {
                "@type": "Person",
                name: "WAKATO (nitr0yukkuri)",
                url: "https://wakatopo.vercel.app",
                image: "https://wakatopo.vercel.app/faviconwakato.png",
                description: "3D・インタラクション実装を得意とするフロントエンドエンジニア",
                jobTitle: "Interactive Web Developer / Creative Coder",
                sameAs: ["https://github.com/nitr0yukkuri", "https://twitter.com/nitr0yukkuri"],
              },
            }),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${zenKakuGothicNew.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {isGaEnabled && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        <LocaleSync />
        <PwaRegister />
        <SoundDirector />
        <GlobalTransitionOverlay />
        {children}
      </body>
    </html>
  );
}