import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, containerClassName, id, disabled, checked, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-200 font-sans text-body-sm text-body-emphasis',
        disabled && 'cursor-not-allowed text-disabled',
        containerClassName,
      )}
    >
      <span className="relative inline-flex h-500 w-500 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            'absolute inset-0 rounded-sm border transition-colors',
            checked ? 'border-primary bg-surface-primary' : 'border-default bg-surface',
            disabled && 'border-disabled bg-surface-disabled',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-border-primary peer-focus-visible:ring-offset-2',
          )}
        />
        {checked && (
          <Check
            size={14}
            strokeWidth={2.25}
            aria-hidden
            className={cn('relative', disabled ? 'text-disabled' : 'text-on-color')}
          />
        )}
      </span>
      {label && <span className={className}>{label}</span>}
    </label>
  );
});
