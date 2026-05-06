import type { FieldMeta } from '@/templates/types';

interface Props {
  field: FieldMeta;
  value: string;
  onChange: (value: string) => void;
}

export function TextField({ field, value, onChange }: Props) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-content2">{field.label}</label>
      <input
        type={field.type}
        placeholder={field.placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-content1 placeholder:text-content4 focus:border-primary focus:outline-none transition-colors"
      />
    </div>
  );
}
