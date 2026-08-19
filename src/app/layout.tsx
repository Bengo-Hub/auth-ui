import { MainLayout } from "@/components/layout/MainLayout";
import { Providers, ThemeProvider } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PWAUpdateBanner } from "@/components/pwa/pwa-update-banner";
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

export const metadata: Metadata = {
  title: "Codevertex SSO - Unified Identity",
  description: "The central identity and access management portal for the Codevertex ecosystem.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/svgs/logo.svg", type: "image/svg+xml" }, { url: "/images/logo/codevertex.png" }],
    shortcut: "/svgs/logo.svg",
    apple: "/images/logo/codevertex.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Codevertex SSO",
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
            <PWAUpdateBanner />
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
