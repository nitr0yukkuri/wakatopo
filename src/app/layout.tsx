import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalTransitionOverlay from "@/components/GlobalTransitionOverlay";
import PwaRegister from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA用にテーマカラー（ステータスバーの色）を設定
export const viewport: Viewport = {
  themeColor: "#020202",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://wakatopo.vercel.app"),
  title: "WAKATOPO | Living Planet Portfolio",
  description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
  openGraph: {
    title: "WAKATOPO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    url: "https://wakatopo.vercel.app",
    siteName: "WAKATOPO",
    images: [
      {
        url: "/2k_mars.jpg",
        width: 2048,
        height: 1024,
        alt: "WAKATOPO planet visual",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WAKATOPO | Living Planet Portfolio",
    description: "GitHubの活動とリアルタイム天気が連動する、インタラクティブな3Dポートフォリオ。",
    images: ["/2k_mars.jpg"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://image.thum.io" />
        <link rel="dns-prefetch" href="https://image.thum.io" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PwaRegister />
        <GlobalTransitionOverlay />
        {children}
      </body>
    </html>
  );
}