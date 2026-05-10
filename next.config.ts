import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],

  allowedDevOrigins: ['192.168.1.40'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
