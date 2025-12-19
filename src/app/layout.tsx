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
  title: "BengoBox Accounts - Unified Identity",
  description: "The central identity and access management portal for the BengoBox ecosystem.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BengoBox Accounts",
  },
};

export const viewport: Viewport = {
  themeColor: "#ea8022",
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
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
      </body>
    </html>
  );
}
