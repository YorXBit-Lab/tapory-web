'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Dropdown, Spin, Tag } from 'antd';
import { useProducts } from '@/hooks/product';
import { usePresetPhotos } from '@/hooks/presetPhoto';
import { useComponents } from '@/hooks/component';
import { componentAvailable } from '@/services/ComponentAPI';
import { toSlug } from '@/utils/slug';
import type { IProduct, IProductVariant, IComponent, IPresetPhoto } from '@/configs/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CONTACT_LINKS } from '@/libs/seo';

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';


function contactMenuItems() {
  return CONTACT_LINKS.map(({ key, label, href, color }) => ({
    key,
    label: (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 py-0.5">
        <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} />
        {label}
      </a>
    ),
  }));
}

function availableFor(
  product: IProduct,
  variantId: string | undefined,
  componentsById: Map<string, IComponent>,
): number {
  const lines: { componentId: string; qty: number }[] = [];
  for (const b of product.baseComponents ?? []) lines.push({ componentId: b.componentId, qty: b.qty });
  const variant = variantId ? product.variants?.[variantId] : undefined;
  if (variant?.optionValues && product.options) {
    for (const ov of variant.optionValues) {
      const [optId, valId] = ov.split(':');
      const val = product.options.find((o) => o.id === optId)?.values.find((v) => v.id === valId);
      if (val?.componentId) lines.push({ componentId: val.componentId, qty: val.componentQty ?? 1 });
    }
  }
  if (lines.length === 0) return variant?.stock ?? product.stock ?? Infinity;
  let min = Infinity;
  for (const line of lines) {
    const c = componentsById.get(line.componentId);
    min = Math.min(min, Math.floor((c ? componentAvailable(c) : 0) / line.qty));
  }
  return min;
}

export function ProductDetailClient({ initialProduct }: { initialProduct?: IProduct | null }) {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  // Live data (all products / presets / components) is fetched with TanStack
  // Query, which must run on the client only: calling useQuery during SSR throws
  // in dev (Turbopack) and is unnecessary because the server already passes
  // initialProduct. A mount-gated <ProductLiveData> child owns those hooks and
  // lifts results up here, so the body still renders (from initialProduct) during
  // SSR and the first client paint, then refreshes once live data arrives.
  const [liveProducts, setLiveProducts] = useState<IProduct[]>(
    initialProduct ? [initialProduct] : [],
  );
  const [presets, setPresets] = useState<IPresetPhoto[]>([]);
  const [components, setComponents] = useState<IComponent[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const product = useMemo(
    () => liveProducts.find((p) => toSlug(p.name) === slug) ?? initialProduct ?? null,
    [liveProducts, slug, initialProduct],
  );

  const componentsById = useMemo(
    () => new Map(components.map((c) => [c.id, c])),
    [components],
  );

  const variantOptions = useMemo(
    () => (product?.options ?? []).filter((o) => o.createsVariant && o.values.length > 0),
    [product],
  );
  const [selection, setSelection] = useState<Record<string, string>>({});

  const allSelected = variantOptions.every((o) => selection[o.id]);
  let resolvedVariant: ({ id: string } & IProductVariant) | null = null;
  if (product?.variants && allSelected && variantOptions.length > 0) {
    const want = variantOptions.map((o) => `${o.id}:${selection[o.id]}`).sort().join('|');
    for (const [vid, v] of Object.entries(product.variants)) {
      if ([...(v.optionValues ?? [])].sort().join('|') === want) {
        resolvedVariant = { id: vid, ...v };
        break;
      }
    }
  }

  const selectedValueImage = useMemo(() => {
    for (const opt of variantOptions) {
      const valId = selection[opt.id];
      if (!valId) continue;
      const img = opt.values.find((v) => v.id === valId)?.imageUrl;
      if (img) return img;
    }
    return null;
  }, [variantOptions, selection]);

  const liveData = mounted ? (
    <ProductLiveData
      productId={product?.id}
      onProducts={setLiveProducts}
      onPresets={setPresets}
      onComponents={setComponents}
      onLoaded={() => setProductsLoaded(true)}
    />
  ) : null;

  if (!product) {
    return (
      <>
        {liveData}
        {!mounted || !productsLoaded ? (
          <div className="flex min-h-[60vh] items-center justify-center"><Spin size="large" /></div>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-500">
            <p>Không tìm thấy sản phẩm.</p>
            <Button onClick={() => router.push('/#products')}>Xem tất cả sản phẩm</Button>
          </div>
        )}
      </>
    );
  }

  const hasVariants = variantOptions.length > 0;
  const unitPrice = resolvedVariant?.price ?? product.price;
  const mainImage = resolvedVariant?.imageUrl || selectedValueImage || product.imageUrl;
  const available = hasVariants && !resolvedVariant
    ? null
    : availableFor(product, resolvedVariant?.id, componentsById);
  const outOfStock = available !== null && available <= 0;

  return (
    <div className="bg-background text-content1 flex min-h-screen flex-col">
      {liveData}
      <Header />
      <div className="bg-background/60">
        <div className="mx-auto flex h-9 max-w-5xl items-center gap-2 px-4 text-sm">
          <Link href="/#products" className="text-content3 hover:text-primary transition-colors">
            ← Bộ sưu tập
          </Link>
          <span className="text-content3">/</span>
          <span className="text-content2 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12" id="product-info">
          {/* Ảnh */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 480px" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🔑</div>
              )}
            </div>
            {/* Preset photos nếu có */}
            {presets.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {presets.map((p) => (
                  <div key={p.id} className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image src={p.url} alt={p.name ?? ''} fill className="object-cover" sizes="56px" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.canBeNfc && (
                <Tag color="#8B6B52" className="mb-2 !text-[10px] !font-bold !tracking-widest !uppercase">NFC</Tag>
              )}
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.description && (
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{product.description}</p>
              )}
              <div className="mt-3 text-2xl font-bold text-amber-700">{fmt(unitPrice)}</div>
              {resolvedVariant && hasVariants && (
                <p className="mt-0.5 text-xs text-gray-400">Giá cho lựa chọn hiện tại</p>
              )}
            </div>

            {/* Options */}
            {variantOptions.map((opt) => (
              <div key={opt.id}>
                <div className="mb-2 text-sm font-medium">{opt.name}</div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const active = selection[opt.id] === val.id;
                    const img = val.imageUrl;
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => setSelection((p) => ({ ...p, [opt.id]: val.id }))}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          active ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {img && (
                          <div className="relative h-5 w-5 overflow-hidden rounded">
                            <Image src={img} alt={val.name} fill className="object-cover" sizes="20px" unoptimized />
                          </div>
                        )}
                        {val.name}
                        {val.priceDelta ? (
                          <span className="text-xs text-gray-400">+{fmt(val.priceDelta)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Tồn kho hint */}
            {available !== null && outOfStock && (
              <p className="text-sm text-red-500">Tạm hết hàng — liên hệ để đặt trước.</p>
            )}

            {/* Liên hệ CTA */}
            <div className="border-border rounded-xl border p-5 space-y-3 bg-gray-50">
              <p className="text-sm text-gray-600 leading-relaxed">
                Để đặt hàng, vui lòng liên hệ qua kênh bên dưới. Chúng tôi sẽ tư vấn và xác nhận đơn trong thời gian sớm nhất.
              </p>
              <Dropdown trigger={['click']} placement="bottomLeft" menu={{ items: contactMenuItems() }}>
                <Button type="primary" size="large" shape="round" className="w-full">
                  Liên hệ đặt hàng
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Bài viết chi tiết */}
        {product.detailArticle && (
          <div className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="mb-6 text-xl font-bold text-gray-800">Chi tiết sản phẩm</h2>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: product.detailArticle }}
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

/**
 * Client-only loader for live product data. Rendered only after the parent has
 * mounted, so its TanStack Query hooks never run during SSR. Results are lifted
 * to the parent via stable setState callbacks.
 */
function ProductLiveData({
  productId,
  onProducts,
  onPresets,
  onComponents,
  onLoaded,
}: {
  productId?: string;
  onProducts: (products: IProduct[]) => void;
  onPresets: (presets: IPresetPhoto[]) => void;
  onComponents: (components: IComponent[]) => void;
  onLoaded: () => void;
}) {
  // No `= []` default: that creates a fresh array reference on every render,
  // which makes the effects below see a "changed" value each time → setState →
  // re-render → infinite loop. TanStack keeps `data` referentially stable, so we
  // depend on it directly and just skip while still undefined.
  const { data: products, isSuccess } = useProducts();
  const { data: presets } = usePresetPhotos(productId ?? '');
  const { data: components } = useComponents();

  useEffect(() => { if (products) onProducts(products as IProduct[]); }, [products, onProducts]);
  useEffect(() => { if (presets) onPresets(presets as IPresetPhoto[]); }, [presets, onPresets]);
  useEffect(() => { if (components) onComponents(components as IComponent[]); }, [components, onComponents]);
  useEffect(() => { if (isSuccess) onLoaded(); }, [isSuccess, onLoaded]);

  return null;
}
