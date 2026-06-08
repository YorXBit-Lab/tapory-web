import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { FIRESTORE_COLLECTIONS } from '@/configs/constants';
import type { IProduct, ProductStatus } from '@/configs/types';
import { getAdminDb } from '@/libs/firebase-admin';
import {
  ORDER_URL,
  SITE_NAME,
  absoluteUrl,
  createPageMetadata,
} from '@/libs/seo';
import HomePageClient from './HomePageClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: 'Móc khóa in ảnh theo yêu cầu, móc khóa NFC cá nhân hóa',
  description:
    'Góc Chạm làm móc khóa acrylic in ảnh theo yêu cầu, móc khóa NFC mở trang kỷ niệm cá nhân và quà tặng cá nhân hóa cho sinh nhật, kỷ niệm, tốt nghiệp, đám cưới.',
  path: '/',
});

function toProduct(id: string, data: Record<string, unknown>): IProduct {
  return {
    id,
    name: (data.name as string) ?? '',
    price: (data.price as number) ?? 0,
    status: (data.status as ProductStatus | undefined) ?? 'active',
    stock: data.stock as number | undefined,
    canBeNfc: (data.canBeNfc as boolean | undefined) ?? (data.isNfc as boolean | undefined) ?? false,
    nfcExtraPrice: data.nfcExtraPrice as number | undefined,
    templateId: data.templateId as IProduct['templateId'] | undefined,
    description: data.description as string | undefined,
    imageUrl: data.imageUrl as string | undefined,
    serviceIds: Array.isArray(data.serviceIds) ? (data.serviceIds as string[]) : undefined,
  };
}

async function getHomepageProducts(): Promise<IProduct[]> {
  try {
    const snap = await getAdminDb()
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();

    return snap.docs
      .map((doc) => toProduct(doc.id, doc.data() as Record<string, unknown>))
      .filter((product) => product.status === 'active');
  } catch (error) {
    console.error('[HomePage] Failed to pre-render products for SEO:', error);
    return [];
  }
}

const homepageProductJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Móc khóa NFC in ảnh theo yêu cầu Góc Chạm',
  image: [absoluteUrl('/images/logo/logo_goccham.png')],
  description:
    'Móc khóa acrylic in ảnh theo yêu cầu, có thể gắn chip NFC để mở trang kỷ niệm cá nhân trên điện thoại.',
  brand: {
    '@type': 'Brand',
    name: SITE_NAME,
  },
  offers: {
    '@type': 'AggregateOffer',
    url: absoluteUrl('/'),
    priceCurrency: 'VND',
    lowPrice: '35000',
    highPrice: '95000',
    offerCount: '3',
    availability: 'https://schema.org/InStock',
  },
};

const homepageFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Móc khóa NFC Góc Chạm hoạt động như thế nào?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mỗi móc khóa có chip NFC chứa một URL riêng. Khi chạm điện thoại có NFC vào móc khóa, trang kỷ niệm cá nhân sẽ mở trong trình duyệt mà không cần cài app.',
      },
    },
    {
      '@type': 'Question',
      name: 'Có thể chỉnh sửa nội dung sau khi mua không?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Có. URL trên chip NFC được giữ cố định, còn nội dung trang kỷ niệm có thể chỉnh sửa theo quyền truy cập của từng đơn hàng.',
      },
    },
    {
      '@type': 'Question',
      name: 'Đặt móc khóa Góc Chạm ở đâu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Bạn có thể đặt hàng qua gian hàng chính thức hoặc liên hệ Góc Chạm để được tư vấn mẫu phù hợp. Trang đặt hàng: ${ORDER_URL}`,
      },
    },
  ],
};

export default async function HomePage() {
  const products = await getHomepageProducts();

  return (
    <>
      <JsonLd data={[homepageProductJsonLd, homepageFaqJsonLd]} />
      <HomePageClient initialProducts={products} />
    </>
  );
}
