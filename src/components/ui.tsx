import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl bg-card border border-line ${
        onClick ? 'active:scale-[0.99] transition-transform cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function Pill({
  children,
  color = 'var(--color-muted)',
  className = '',
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
      style={{ color, backgroundColor: 'color-mix(in srgb, ' + color + ' 14%, transparent)' }}
    >
      {children}
    </span>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-2xl bg-ink-2 border border-line p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${
              active ? 'bg-accent text-ink' : 'text-muted active:bg-card-2'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
