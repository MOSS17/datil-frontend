import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { CircleSlash } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    error,
    hint,
    fullWidth = true,
    containerClassName,
    className,
    id,
    disabled,
    rows = 4,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const textareaId = id ?? reactId;
  const describedBy = error
    ? `${textareaId}-error`
    : hint
      ? `${textareaId}-hint`
      : undefined;

  return (
    <div className={cn('flex flex-col gap-200', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="font-sans text-body-sm font-medium text-body-emphasis"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-none rounded-md border bg-surface p-300 font-sans text-body-sm text-body-emphasis placeholder:text-placeholder transition-colors focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-disabled',
          error ? 'border-error' : 'border-default',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p
          id={`${textareaId}-error`}
          className="flex items-start gap-200 font-sans text-body-sm font-medium text-error"
        >
          <CircleSlash aria-hidden size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="font-sans text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
