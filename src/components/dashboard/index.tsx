import { ReactNode } from 'react';

/* ── Stat card ── */
export function StatCard({
  label,
  value,
  delta,
  deltaType = 'up',
}: {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'neutral';
}) {
  const deltaColor =
    deltaType === 'up' ? 'text-green-700' : deltaType === 'down' ? 'text-red-600' : 'text-gray-400';
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-4">
      <p className="mb-1.5 text-[11px] text-gray-400">{label}</p>
      <p className="text-[22px] leading-none font-semibold text-gray-900">{value}</p>
      {delta && <p className={`mt-1.5 text-[11px] ${deltaColor}`}>{delta}</p>}
    </div>
  );
}

/* ── Card wrapper ── */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-black/[0.07] bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}

/* ── Card header ── */
export function CardHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[13px] font-semibold text-gray-800">{title}</h3>
      {action && <div className="text-[11px] text-gray-400">{action}</div>}
    </div>
  );
}

/* ── Badge ── */
type BadgeVariant = 'pending' | 'done' | 'active' | 'cancel' | 'new';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  pending: 'bg-amber-50 text-amber-700',
  done: 'bg-green-50 text-green-700',
  active: 'bg-blue-50 text-blue-700',
  cancel: 'bg-red-50 text-red-600',
  new: 'bg-purple-50 text-purple-700',
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  pending: 'Chờ xử lý',
  done: 'Hoàn thành',
  active: 'Đang giao',
  cancel: 'Đã hủy',
  new: 'Mới',
};

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[variant]}`}
    >
      {BADGE_LABELS[variant]}
    </span>
  );
}

/* ── Table ── */
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-black/[0.07] px-2.5 py-2 text-left text-[11px] font-semibold text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-black/[0.05] transition-colors last:border-0 hover:bg-gray-50/60">
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-2.5 py-2.5 align-middle text-gray-700 ${className}`}>{children}</td>;
}

/* ── Avatar ── */
export function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-[9px] font-semibold text-[#e8c14b]">
      {initials}
    </div>
  );
}

/* ── Filter tabs ── */
export function FilterTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { label: string; value: string; count?: number }[];
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
            active === t.value
              ? 'border-transparent bg-[#1a1a2e] text-white'
              : 'border-black/[0.08] text-gray-500 hover:bg-gray-50'
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1 opacity-70">({t.count})</span>}
        </button>
      ))}
    </div>
  );
}

/* ── Toggle ── */
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
        checked ? 'bg-[#1a1a2e]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? 'right-0.5' : 'left-0.5'
        }`}
      />
    </button>
  );
}
