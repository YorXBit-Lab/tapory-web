import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  createPageMetadata,
  DEFAULT_DESCRIPTION,
  productJsonLd,
  SITE_NAME,
} from '@/libs/seo';
import { getFullProductBySlug } from '@/libs/products-server';
import { toSlug } from '@/utils/slug';
import { ProductDetailClient } from './ProductDetailClient';

// ISR: render server-side on demand then cache for 1h, so each visit doesn't
// re-read Firestore. Stock/live data still refreshes on the client via TanStack.
export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getFullProductBySlug(slug);

  if (!product) {
    return createPageMetadata({
      title: 'Không tìm thấy sản phẩm',
      path: `/product/${slug}`,
      index: false,
    });
  }

  const productSlug = toSlug(product.name);
  const description =
    product.description?.trim() ||
    `${product.name} — ${DEFAULT_DESCRIPTION}`;

  return createPageMetadata({
    title: product.name,
    description,
    path: `/product/${productSlug}`,
    images: [`/api/og/product/${productSlug}`],
  });
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getFullProductBySlug(slug);

  // Real 404 (not a soft-404 with HTTP 200) so search engines drop dead URLs.
  if (!product) notFound();

  // Canonicalize: if the visited slug isn't the name-derived one, redirect to
  // the single canonical URL to avoid duplicate-content pages.
  const productSlug = toSlug(product.name);
  if (productSlug !== slug) redirect(`/product/${productSlug}`);

  return (
    <>
      <JsonLd
        data={[
          productJsonLd({
            name: product.name,
            description: product.description,
            image: product.imageUrl,
            url: absoluteUrl(`/product/${productSlug}`),
            price: product.price,
            inStock: product.status === 'active',
          }),
          breadcrumbJsonLd([
            { name: SITE_NAME, path: '/' },
            { name: 'Sản phẩm', path: '/#products' },
            { name: product.name, path: `/product/${productSlug}` },
          ]),
        ]}
      />
      <ProductDetailClient initialProduct={product} />
    </>
  );
}
