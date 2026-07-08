import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Allow OG-image endpoint so social crawlers (Facebook, Zalo…) can fetch
      // preview thumbnails — more specific than the '/api/' disallow below.
      allow: ['/', '/api/og/'],
      disallow: [
        '/api/',
        '/dashboard/',
        '/edit/',
        '/upload/',
        '/keychain',
        '/c/',
        '/view/',
      ],
    },
    sitemap: 'https://goccham.com/sitemap.xml',
    host: 'https://goccham.com',
  };
}
