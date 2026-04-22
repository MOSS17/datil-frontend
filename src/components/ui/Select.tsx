import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  options?: SelectOption[];
  fullWidth?: boolean;
  containerClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    error,
    hint,
    leftIcon,
    options,
    fullWidth = true,
    containerClassName,
    className,
    id,
    disabled,
    placeholder,
    children,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const selectId = id ?? reactId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-200', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="font-sans text-body-sm font-medium text-body-emphasis"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'relative flex items-stretch rounded-md border bg-surface transition-colors',
          'focus-within:border-primary',
          error ? 'border-error' : 'border-default',
          disabled && 'border-disabled bg-surface-disabled',
        )}
      >
        {leftIcon && (
          <span className="pointer-events-none flex items-center pl-300 text-muted">
            {leftIcon}
          </span>
        )}
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full appearance-none bg-transparent py-300 pr-1000 font-sans text-body-sm text-body-emphasis focus:outline-none disabled:cursor-not-allowed disabled:text-disabled',
            leftIcon ? 'pl-200' : 'pl-300',
            className,
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-300 top-1/2 -translate-y-1/2 text-muted"
        >
          <ChevronDown size={16} strokeWidth={1.75} />
        </span>
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="font-sans text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="font-sans text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
