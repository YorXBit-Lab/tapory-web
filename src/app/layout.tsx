import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';
import {
  Montserrat,
  Playfair_Display,
  Dancing_Script,
  Be_Vietnam_Pro,
  Lora,
  Cormorant_Garamond,
  Raleway,
  Nunito,
  Josefin_Sans,
} from 'next/font/google';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/libs/ThemeProvider';
import { AntdProvider } from '@/libs/AntdProvider';
import { ReduxProvider } from '@/libs/ReduxProvider';
import { TanstackProvider } from '@/libs/TanstackProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from '@/libs/seo';

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});

const dancing = Dancing_Script({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-dancing',
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam',
});

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-lora',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const raleway = Raleway({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-raleway',
});

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-nunito',
});

const josefin = Josefin_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
  variable: '--font-josefin',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Góc Chạm - Móc khóa in ảnh theo yêu cầu',
    template: '%s | Góc Chạm',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'Góc Chạm',
    'móc khóa góc chạm',
    'móc khóa in ảnh',
    'móc khóa theo yêu cầu',
    'móc khóa acrylic',
    'móc khóa NFC',
    'quà tặng cá nhân hóa',
  ],
  openGraph: {
    title: 'Góc Chạm - Móc khóa in ảnh theo yêu cầu',
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Góc Chạm - Móc khóa NFC in ảnh theo yêu cầu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Góc Chạm - Móc khóa in ảnh theo yêu cầu',
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${playfair.variable} ${dancing.variable} ${beVietnam.variable} ${lora.variable} ${cormorant.variable} ${raleway.variable} ${nunito.variable} ${josefin.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col transition-colors">
        <ThemeProvider>
          <ReduxProvider>
            <TanstackProvider>
              <AntdRegistry>
                <AntdProvider>
                  <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
                  {children}
                  <Toaster richColors position="top-right" />
                </AntdProvider>
              </AntdRegistry>
            </TanstackProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
