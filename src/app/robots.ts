import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/edit/',
        '/upload/',
        '/keychain',
        '/c/',
      ],
    },
    sitemap: 'https://goccham.com/sitemap.xml',
    host: 'https://goccham.com',
  };
}
