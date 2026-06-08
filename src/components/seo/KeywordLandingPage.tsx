import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { ORDER_URL, SITE_NAME, absoluteUrl } from '@/libs/seo';

export type LandingFaq = {
  question: string;
  answer: string;
};

export type LandingFeature = {
  title: string;
  body: string;
};

export type KeywordLandingPageProps = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  productName: string;
  intro: string;
  features: LandingFeature[];
  useCases: string[];
  faqs: LandingFaq[];
  relatedLinks: Array<{ href: string; label: string }>;
};

export function KeywordLandingPage({
  path,
  eyebrow,
  title,
  description,
  productName,
  intro,
  features,
  useCases,
  faqs,
  relatedLinks,
}: KeywordLandingPageProps) {
  const pageUrl = absoluteUrl(path);
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: [absoluteUrl('/opengraph-image')],
    description,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'AggregateOffer',
      url: pageUrl,
      priceCurrency: 'VND',
      lowPrice: '35000',
      highPrice: '95000',
      offerCount: '3',
      availability: 'https://schema.org/InStock',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[productJsonLd, faqJsonLd, breadcrumbJsonLd]} />
      <Header />
      <main className="bg-background text-content1">
        <section className="border-border border-b">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-20">
            <div>
              <p className="text-primary mb-4 text-xs font-semibold tracking-[0.22em] uppercase">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl leading-tight font-bold md:text-6xl">
                {title}
              </h1>
              <p className="text-content2 mt-6 max-w-2xl text-lg leading-8">{description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={ORDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Đặt hàng
                </a>
                <Link
                  href="/templates"
                  className="border-border bg-elevated text-content1 rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  Xem mẫu thiết kế
                </Link>
              </div>
            </div>

            <div className="bg-elevated border-border relative min-h-[320px] overflow-hidden rounded-2xl border p-7">
              <div className="absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_18%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_34%),radial-gradient(circle_at_88%_78%,color-mix(in_oklab,var(--color-secondary)_22%,transparent),transparent_32%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-content3 text-sm font-semibold tracking-[0.18em] uppercase">
                    Góc Chạm
                  </p>
                  <p className="mt-5 text-2xl leading-9 font-semibold">{intro}</p>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-background/80 border-border rounded-lg border p-4">
                    <p className="text-primary text-2xl font-bold">NFC</p>
                    <p className="text-content3 mt-1 text-xs">Chạm là mở</p>
                  </div>
                  <div className="bg-background/80 border-border rounded-lg border p-4">
                    <p className="text-primary text-2xl font-bold">Ảnh</p>
                    <p className="text-content3 mt-1 text-xs">In theo yêu cầu</p>
                  </div>
                  <div className="bg-background/80 border-border rounded-lg border p-4">
                    <p className="text-primary text-2xl font-bold">URL</p>
                    <p className="text-content3 mt-1 text-xs">Nội dung riêng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="border-border rounded-lg border p-6">
                <h2 className="text-xl font-bold">{feature.title}</h2>
                <p className="text-content2 mt-3 leading-7">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-elevated border-border border-y">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
            <h2 className="text-3xl font-bold">Phù hợp để làm quà trong những dịp nào?</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {useCases.map((useCase) => (
                <div key={useCase} className="bg-background border-border rounded-lg border px-4 py-3">
                  <p className="font-semibold">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold">Câu hỏi thường gặp</h2>
            </div>
            <div className="divide-border border-border divide-y border-y">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="cursor-pointer list-none text-lg font-semibold">
                    {faq.question}
                  </summary>
                  <p className="text-content2 mt-3 leading-7">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-content1 text-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <h2 className="text-2xl font-bold">Xem thêm các trang liên quan</h2>
              <p className="mt-2 text-sm text-background/70">
                Các trang này giúp chọn đúng loại móc khóa và mẫu kỷ niệm trước khi đặt hàng.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-background/25 px-4 py-2 text-sm font-semibold text-background transition-colors hover:border-primary hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
