import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lrnajodxfwegimnwnbdd.supabase.co' },
      { protocol: 'https', hostname: 'foomerisayo.beget.app' },
    ],
  },
};

export default nextConfig;
