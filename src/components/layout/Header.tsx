import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="z-sticky bg-background/80 border-border sticky top-0 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Góc Chạm" width={120} height={36} className="[mix-blend-mode:multiply] dark:invert dark:[mix-blend-mode:screen]" style={{ height: 36, width: 'auto', objectFit: 'contain' }} priority />
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
