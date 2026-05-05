import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-sticky bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight text-primary">
          Tapory
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="text-sm font-medium text-content2 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-elevated"
          >
            Xem mẫu
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
