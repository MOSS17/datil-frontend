import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  widthClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  ariaLabel,
  widthClassName = 'md:w-[400px]',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-surface-primary/25 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-surface shadow-xl transition-transform duration-200',
          'md:inset-y-0 md:left-auto md:right-0 md:w-[400px]',
          widthClassName,
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex items-start justify-between gap-400 px-600 pt-600 pb-400">
          <h2 className="font-serif text-h5 text-heading">{title}</h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="inline-flex h-800 w-800 items-center justify-center rounded-md text-icon hover:bg-surface-secondary-subtle"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-600 pb-400">{children}</div>
        {footer && (
          <footer className="border-t border-subtle px-600 py-400">{footer}</footer>
        )}
      </aside>
    </>
  );
}
