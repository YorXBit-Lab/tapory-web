import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="z-sticky bg-background/80 border-border sticky top-0 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-primary text-xl font-semibold tracking-tight">
          Góc Chạm
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
