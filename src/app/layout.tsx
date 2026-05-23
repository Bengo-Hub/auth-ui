import { MainLayout } from "@/components/layout/MainLayout";
import { Providers, ThemeProvider } from "@/components/providers";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { PWAUpdateBanner } from "@/components/pwa/pwa-update-banner";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
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
        className={`${poppins.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
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
