import { useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Tone = 'primary' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, isLoading]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={() => !isLoading && onClose()}
        className="fixed inset-0 z-40 bg-surface-primary/25"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-[400px]',
          '-translate-x-1/2 -translate-y-1/2',
          'flex flex-col gap-500 rounded-lg border border-default bg-surface p-600 shadow-xl',
        )}
      >
        <div className="flex flex-col gap-200">
          <h2
            id="confirm-dialog-title"
            className="font-serif text-h6 text-heading"
          >
            {title}
          </h2>
          {description && (
            <p className="font-sans text-body-sm text-muted">{description}</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-300">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
