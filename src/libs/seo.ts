import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://goccham.com';
export const SITE_NAME = 'Góc Chạm';
export const CONTACT_EMAIL = 'goccham.sg@gmail.com';
export const ORDER_URL = 'https://tiktok.com/shop';
export const DEFAULT_OG_IMAGE = '/opengraph-image';

export const DEFAULT_DESCRIPTION =
  'Góc Chạm làm móc khóa acrylic in ảnh theo yêu cầu, móc khóa NFC và quà tặng cá nhân hóa để lưu giữ kỷ niệm bằng một cái chạm.';

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  images = [DEFAULT_OG_IMAGE],
  index = true,
}: {
  title: string;
  description?: string;
  path?: string;
  images?: string[];
  index?: boolean;
}): Metadata {
  const canonical = path.startsWith('http') ? path : absoluteUrl(path);
  const resolvedImages = images.map((image) => ({
    url: absoluteUrl(image),
    width: 1200,
    height: 630,
    alt: title,
  }));

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type: 'website',
      images: resolvedImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: resolvedImages.map((image) => image.url),
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        }
      : noIndexRobots,
  };
}

export const noIndexRobots: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: absoluteUrl('/images/logo/logo_goccham.png'),
  email: CONTACT_EMAIL,
  sameAs: [ORDER_URL],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'vi-VN',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/templates?query={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export function productJsonLd({
  name,
  description,
  image,
  url,
  price,
  inStock = true,
}: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  price: number;
  inStock?: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || DEFAULT_DESCRIPTION,
    image: image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE),
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'VND',
      price: String(price),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const CONTACT_LINKS = [
  { key: 'zalo',     label: 'Zalo',     href: '#', color: '#0068FF' },
  { key: 'facebook', label: 'Facebook', href: '#', color: '#1877F2' },
  { key: 'tiktok',   label: 'TikTok',   href: '#', color: '#010101' },
  { key: 'shopee',   label: 'Shopee',   href: '#', color: '#EE4D2D' },
];
