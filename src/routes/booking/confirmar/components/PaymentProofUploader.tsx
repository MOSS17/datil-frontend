import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { CircleSlash, Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ALLOWED_MIME_TYPES } from '../schema';

interface PaymentProofUploaderProps {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  variant: 'desktop' | 'mobile';
}

export function PaymentProofUploader({
  file,
  previewUrl,
  error,
  onSelect,
  onRemove,
  variant,
}: PaymentProofUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (next) onSelect(next);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const next = event.dataTransfer.files?.[0];
    if (next) onSelect(next);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex w-full flex-col gap-200">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {file ? (
        <UploadedTile file={file} previewUrl={previewUrl} onRemove={onRemove} />
      ) : variant === 'desktop' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handlePick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePick();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-200 rounded-md border bg-surface px-600 text-center transition-colors hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
            error ? 'border-error' : 'border-default',
          )}
        >
          <Upload size={24} strokeWidth={1.75} aria-hidden className="text-icon" />
          <p className="font-sans text-body-sm text-placeholder">
            Haz clic para subir o arrastra y suelta
          </p>
          <p className="font-sans text-caption text-muted">Tamaño máximo del archivo: 10MB</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePick}
          className={cn(
            'flex h-[56px] w-full items-center justify-center gap-300 rounded-md border bg-surface font-sans text-body-sm font-medium text-body-emphasis transition-colors hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
            error ? 'border-error' : 'border-strong',
          )}
        >
          <Upload size={20} strokeWidth={1.75} aria-hidden />
          Añadir comprobante
        </button>
      )}

      {error ? (
        <p className="flex items-center gap-200 font-sans text-body-sm font-medium text-error">
          <CircleSlash size={16} strokeWidth={1.75} aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface UploadedTileProps {
  file: File;
  previewUrl: string | null;
  onRemove: () => void;
}

function UploadedTile({ file, previewUrl, onRemove }: UploadedTileProps) {
  const isImage = file.type.startsWith('image/');
  return (
    <div className="flex w-full items-center gap-300 rounded-md bg-surface-secondary-subtle px-400 py-300">
      <div className="flex h-1100 w-1100 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-surface">
        {isImage && previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-sans text-caption font-semibold text-muted">PDF</span>
        )}
      </div>
      <p className="flex-1 truncate font-sans text-body-sm font-medium text-body-emphasis">
        {file.name}
      </p>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar comprobante"
        className="inline-flex h-600 w-600 shrink-0 items-center justify-center rounded-sm text-icon hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
      >
        <X size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
