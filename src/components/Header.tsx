import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function Header({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const nav = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-30 bg-ink/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-5 pt-3 pb-3">
        {back && (
          <button
            onClick={() => nav(-1)}
            className="grid place-items-center h-10 w-10 -ml-2 rounded-full active:bg-card-2 text-fg"
          >
            <ChevronLeft size={26} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent truncate">
              {subtitle}
            </p>
          )}
          <h1 className="text-[26px] font-extrabold leading-tight tracking-tight truncate">
            {title}
          </h1>
        </div>
        {right}
      </div>
    </header>
  );
}
