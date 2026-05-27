import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="z-sticky bg-background/80 border-border sticky top-0 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo/logo_goccham_stransparent.png"
            alt="Góc Chạm"
            width={200}
            height={64}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="text-content2 hover:text-primary hover:bg-elevated rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            Xem mẫu
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
