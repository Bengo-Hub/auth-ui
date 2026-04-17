import { MainLayout } from "@/components/layout/MainLayout";
import { Providers, ThemeProvider } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codevertex SSO - Unified Identity",
  description: "The central identity and access management portal for the Codevertex ecosystem.",
  manifest: "/manifest.json",
  icons: {
    icon: "/svgs/logo.svg",
    shortcut: "/svgs/logo.svg",
    apple: "/svgs/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Codevertex SSO",
  },
};

export const viewport: Viewport = {
  themeColor: "#EC4899",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
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
          <span>Codevertex SSO &mdash; Codevertex IT Solutions</span>
          <span className="mx-2">&middot;</span>
          <a href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
          <span className="mx-2">&middot;</span>
          <a href="/terms-of-service" className="underline hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
        </footer>
      </body>
    </html>
  );
}
