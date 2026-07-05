import Link from 'next/link';
import { Tag, Image } from 'antd';
import type { ProductCard } from '@/libs/products-server';
import { SectionHead } from './SectionHead';

export function ProductsSection({ products }: { products: ProductCard[] }) {
  return (
    <section id="products" className="bg-elevated py-14 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <SectionHead
          eyebrow="Bộ sưu tập"
          title={
            <>
              Móc khóa kỷ niệm, một <span className="text-primary">tâm hồn</span> riêng biệt.
            </>
          }
          sub="Móc khóa kim loại phủ resin, chip NFC ẩn bên trong. Chống nước, chống xước. Mỗi mẫu được lập trình sẵn link riêng để bạn tùy biến."
        />
        {products.length === 0 ? (
          <div className="border-border rounded-2xl border py-16 text-center">
            <span className="text-content3">Chưa có sản phẩm nào.</span>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="bg-background border-border relative flex flex-col items-center rounded-2xl border px-5 py-8 text-center no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-xl md:px-7 md:py-12"
              >
                {p.canBeNfc && (
                  <Tag
                    color="#8B6B52"
                    className="!absolute !top-4 !right-4 !text-[10px] !font-bold !tracking-widest !uppercase"
                  >
                    NFC
                  </Tag>
                )}
                <div className="mb-7 aspect-square w-full">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      width="100%"
                      height="100%"
                      preview={false}
                      style={{ objectFit: 'cover' }}
                      wrapperStyle={{ display: 'block', width: '100%', height: '100%' }}
                      styles={{
                        root: {
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1)',
                        },
                      }}
                    />
                  ) : (
                    <div
                      className="h-full w-full rounded-2xl shadow-lg"
                      style={{ background: 'radial-gradient(circle at 35% 30%,#F6F0E8,#8B6B52)' }}
                    />
                  )}
                </div>
                <h3 className="text-content1 mb-1 text-xl font-semibold">{p.name}</h3>
                <span className="text-primary mb-3 block text-sm font-semibold tracking-wide">
                  {p.price.toLocaleString('vi-VN')}đ
                </span>
                {p.description && <p className="text-content3 mb-3 text-sm">{p.description}</p>}
                <span className="bg-primary mt-auto inline-block rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                  Xem chi tiết
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
