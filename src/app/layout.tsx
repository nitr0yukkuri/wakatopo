import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import GlobalTransitionOverlay from "@/components/GlobalTransitionOverlay";
import PwaRegister from "@/components/PwaRegister";
import SoundDirector from "@/components/SoundDirector";
import LocaleSync from "@/components/LocaleSync";

const inter = Inter({
  variable: "--font-latin",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
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

// PWA用にテーマカラー（ステータスバーの色）を設定
export const viewport: Viewport = {
  themeColor: "#020202",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wakatopo.vercel.app"),
  title: "WAKATO | Living Planet Portfolio",
  description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
  openGraph: {
    title: "WAKATO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    url: "https://wakatopo.vercel.app",
    siteName: "WAKATO",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WAKATO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
  },
  icons: {
    icon: "/faviconwakato.png",
    apple: "/faviconwakato.png", // iOSのホーム画面追加用アイコン
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
      </head>
      <body
        className={`${inter.variable} ${notoSansJp.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <LocaleSync />
        <PwaRegister />
        <SoundDirector />
        <GlobalTransitionOverlay />
        {children}
      </body>
    </html>
  );
}