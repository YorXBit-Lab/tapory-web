'use client';

import { useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MenuIcon } from '@/components/icons';
import { ContactDropdown } from './ContactDropdown';

const NAV_LINKS = [
  { href: '#products', label: 'Sản phẩm' },
  { href: '#how', label: 'Cách dùng' },
  { href: '/templates', label: 'Mẫu thiết kế' },
  { href: '#stories', label: 'Câu chuyện' },
];

export function HomeNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className="border-border bg-background/85 sticky top-0 z-[1020] border-b backdrop-blur-lg">
      <div className="mx-auto flex h-[60px] max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <NextImage
            src="/images/logo/logo_goccham_stransparent.png"
            alt="Góc Chạm"
            width={200}
            height={64}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div className="hidden gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-content2 hover:text-primary text-sm transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop: theme toggle + CTA */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          <ContactDropdown />
          {/* Mobile: hamburger */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="border-border text-content2 hover:text-content1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border bg-transparent transition-colors md:hidden"
            aria-label="Menu"
          >
            <MenuIcon open={mobileNavOpen} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileNavOpen && (
        <div className="border-border bg-background border-t md:hidden">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-0.5 px-4 py-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNavOpen(false)}
                className="text-content2 hover:text-primary hover:bg-elevated rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="border-border mt-2 flex items-center gap-2 border-t pt-3">
              <ThemeToggle />
              <ContactDropdown size="middle" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
