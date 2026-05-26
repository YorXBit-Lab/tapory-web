'use client';

import { useRouter } from 'next/navigation';
import type { ITemplate } from '@/configs/types';

export function TemplateCard({ tpl }: { tpl: ITemplate }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/edit/demo?template=${tpl.id}`)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Preview area */}
      <div
        className="relative flex h-52 items-center justify-center overflow-hidden"
        style={{ backgroundColor: tpl.colors.background }}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20" style={{ backgroundColor: tpl.colors.primary }} />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-15" style={{ backgroundColor: tpl.colors.secondary }} />
        <div className="absolute right-6 bottom-6 h-14 w-14 rounded-full opacity-10" style={{ backgroundColor: tpl.colors.secondary }} />

        <span className="relative z-10 text-7xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {tpl.icon}
        </span>

        <span
          className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow"
          style={{ backgroundColor: tpl.colors.primary }}
        >
          {tpl.occasion}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-base font-semibold text-content1">{tpl.name}</p>
          <p className="mt-0.5 text-sm text-content3">Mẫu thiết kế kỷ niệm</p>
        </div>

        <div className="flex items-center gap-1.5">
          {[tpl.colors.primary, tpl.colors.secondary, tpl.colors.background].map((c) => (
            <span key={c} className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="ml-1 text-xs text-content4">Bảng màu</span>
        </div>

        <div
          className="mt-auto flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity duration-200 group-hover:opacity-90"
          style={{ backgroundColor: tpl.colors.primary }}
        >
          Dùng mẫu này →
        </div>
      </div>
    </div>
  );
}
