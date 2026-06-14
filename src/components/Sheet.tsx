import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 animate-fade" onClick={onClose} />
      <div className="relative animate-sheet rounded-t-[28px] bg-card border-t border-line max-h-[88vh] flex flex-col safe-bottom">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="absolute left-1/2 -translate-x-1/2 top-2 h-1 w-10 rounded-full bg-line-strong" />
          <h3 className="text-lg font-bold mt-1">{title}</h3>
          <button
            onClick={onClose}
            className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-muted active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
