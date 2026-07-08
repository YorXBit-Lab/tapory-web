import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],

  allowedDevOrigins: ['192.168.1.40'],

  async headers() {
    const noIndexHeader = {
      key: 'X-Robots-Tag',
      value: 'noindex, nofollow, noarchive',
    };

    return [
      { source: '/dashboard', headers: [noIndexHeader] },
      { source: '/dashboard/:path*', headers: [noIndexHeader] },
      { source: '/edit/:path*', headers: [noIndexHeader] },
      { source: '/upload/:path*', headers: [noIndexHeader] },
      { source: '/keychain', headers: [noIndexHeader] },
      { source: '/c/:path*', headers: [noIndexHeader] },
      { source: '/view/:path*', headers: [noIndexHeader] },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // Cloudflare R2 public bucket / custom domain
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestorage.com',
      },
    ],
  },
};

export default nextConfig;
