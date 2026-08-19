import { MainLayout } from "@/components/layout/MainLayout";
import { Providers, ThemeProvider } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";

// Matches library-ui's exact font pairing (Phase 8b) — DM Sans is the
// primary body/UI face, Outfit and JetBrains Mono are declared alongside it
// in globals.css's --font-sans/--font-mono stacks.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// iOS splash screens (Phase 14) — /svgs/logo.svg rasterized onto the brand
// purple background at each standard device size. Media queries match
// Apple's own documented device-width/device-height/dpr combinations.
const APPLE_SPLASH_SCREENS: { url: string; media: string }[] = [
  { url: "/icons/apple-splash-2048-2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1668-2388.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1536-2048.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1290-2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1179-2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1170-2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/icons/apple-splash-1125-2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
  { url: "/icons/apple-splash-828-1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/icons/apple-splash-750-1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
  { url: "/icons/apple-splash-640-1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
];

export const metadata: Metadata = {
  title: "Codevertex SSO - Unified Identity",
  description: "The central identity and access management portal for the Codevertex ecosystem.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/svgs/logo.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/svgs/logo.svg",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Codevertex SSO",
    startupImage: APPLE_SPLASH_SCREENS,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0910" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
            <PWAInstallPrompt />
          </Providers>
        </ThemeProvider>
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Codevertex SSO &mdash; Codevertex Africa Limited</span>
          <span className="mx-2">&middot;</span>
          <a href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
          <span className="mx-2">&middot;</span>
          <a href="/terms-of-service" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
        </footer>
      </body>
    </html>
  );
}
