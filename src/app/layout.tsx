import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
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

export const metadata: Metadata = {
  title: 'Tapory – Móc Khóa Kỷ Niệm NFC',
  description: 'Tạo trang kỷ niệm cá nhân hóa được gắn vào móc khóa NFC của bạn',
  keywords: ['móc khóa NFC', 'kỷ niệm', 'quà tặng', 'cá nhân hóa'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={montserrat.variable} suppressHydrationWarning>
      <body className="flex min-h-full flex-col transition-colors">
        <ThemeProvider>
          <ReduxProvider>
            <TanstackProvider>
              <AntdRegistry>
                <AntdProvider>{children}</AntdProvider>
              </AntdRegistry>
            </TanstackProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
