import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';
import {
  Montserrat, Playfair_Display, Dancing_Script,
  Be_Vietnam_Pro, Lora, Cormorant_Garamond,
  Raleway, Nunito, Josefin_Sans,
} from 'next/font/google';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/libs/ThemeProvider';
import { AntdProvider } from '@/libs/AntdProvider';
import { ReduxProvider } from '@/libs/ReduxProvider';
import { TanstackProvider } from '@/libs/TanstackProvider';

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
  title: 'Góc Chạm – Móc Khóa Kỷ Niệm NFC',
  description: 'Tạo trang kỷ niệm cá nhân hóa được gắn vào móc khóa NFC của bạn',
  keywords: ['móc khóa NFC', 'kỷ niệm', 'quà tặng', 'cá nhân hóa'],
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
