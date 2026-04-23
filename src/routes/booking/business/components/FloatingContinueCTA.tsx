import { ArrowRight } from 'lucide-react';

interface FloatingContinueCTAProps {
  count: number;
  to: string;
  onClick?: () => void;
}

export function FloatingContinueCTA({ count, onClick }: FloatingContinueCTAProps) {
  const label = `${count} ${count === 1 ? 'Servicio' : 'Servicios'}`;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-600 pb-600 md:justify-end md:px-1200 md:pb-800">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto inline-flex items-center gap-300 rounded-full bg-surface-primary px-600 py-400 font-sans text-body-sm font-medium text-on-color shadow-lg transition-colors hover:bg-surface-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
      >
        <span>
          {label} <span aria-hidden>|</span> Continuar
        </span>
        <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
