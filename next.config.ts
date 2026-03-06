import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

// On Windows, standalone build uses symlinks and can fail with EPERM unless Developer Mode is on.
// Set SKIP_STANDALONE_BUILD=true for local Windows builds; leave unset in Docker/CI (Linux) for standalone output.
const nextConfig: NextConfig = {
  output: 'standalone',
  ...(process.env.SKIP_STANDALONE_BUILD !== 'true' && { output: 'standalone' as const }),
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
