import { Footer } from '@/components/layout/Footer';
import {
  HomeAnimations,
  HomeNav,
  Hero,
  Marquee,
  ProductsSection,
  HowItWorks,
  TemplatesSection,
  Stories,
  NfcDemo,
  FinalCta,
} from '@/components/home';
import { getProductsForHome } from '@/libs/products-server';

// ISR: render server-side on demand then cache for 1h. The product collection
// rarely changes, so this avoids reading Firestore on every visit.
export const revalidate = 3600;

export default async function HomePage() {
  const products = await getProductsForHome();

  return (
    <div className="bg-background text-content1 min-h-screen font-sans">
      <HomeAnimations />
      <HomeNav />
      <Hero />
      <Marquee />
      <ProductsSection products={products} />
      <HowItWorks />
      <TemplatesSection />
      <Stories />
      <NfcDemo />
      <FinalCta />
      <Footer />
    </div>
  );
}
