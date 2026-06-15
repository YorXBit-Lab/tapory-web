import type { ReactNode } from 'react';

/** Small uppercase label sitting above a section/heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-primary mb-3 block text-xs font-semibold tracking-[0.22em] uppercase">
      {children}
    </span>
  );
}

/** Centered section heading: eyebrow + title + optional sub-paragraph. */
export function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mb-10 text-center md:mb-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-content1 mb-4 text-[clamp(30px,4vw,50px)] leading-[1.1] font-bold">
        {title}
      </h2>
      {sub && <p className="text-content3 mx-auto mb-0 max-w-xl text-base">{sub}</p>}
    </div>
  );
}
