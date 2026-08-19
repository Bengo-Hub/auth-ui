import type { NextConfig } from "next";

// PWA offline/update support comes from shared-ui-lib's OfflineBar (see
// providers.tsx) + the committed public/sw.js, not @ducanh2912/next-pwa —
// removed 2026-08-19 (Phase 14) after finding its withPWA() wrapper was
// created here but never actually applied to nextConfig below, so it did
// nothing; mail-ui hits the same next-pwa/Turbopack webpack-plugin
// incompatibility for the same reason (see mail-ui's public/sw.js comment).

// On Windows, standalone build uses symlinks and can fail with EPERM unless Developer Mode is on.
// Set SKIP_STANDALONE_BUILD=true for local Windows builds; leave unset in Docker/CI (Linux) for standalone output.
const nextConfig: NextConfig = {
  ...(process.env.SKIP_STANDALONE !== 'true' && { output: 'standalone' as const }),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
