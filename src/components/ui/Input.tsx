import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  addonStyle?: 'inline' | 'divided';
  fullWidth?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftAddon,
    rightAddon,
    addonStyle = 'inline',
    fullWidth = true,
    containerClassName,
    className,
    id,
    disabled,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={cn('flex flex-col gap-200', fullWidth && 'w-full', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-body-sm font-medium text-body-emphasis"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-md border bg-surface transition-colors',
          'focus-within:border-primary',
          error ? 'border-error' : 'border-default',
          disabled && 'bg-surface-disabled border-disabled',
        )}
      >
        {leftAddon && (
          <span
            className={cn(
              'flex items-center font-sans text-body-sm text-muted',
              addonStyle === 'divided'
                ? 'border-r border-default bg-surface-secondary-subtle px-300'
                : 'pl-300',
            )}
          >
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full bg-transparent py-300 font-sans text-body-sm text-body-emphasis placeholder:text-placeholder focus:outline-none disabled:cursor-not-allowed disabled:text-disabled',
            leftAddon && addonStyle === 'inline' ? 'pl-0 pr-300' : 'px-300',
            className,
          )}
          {...rest}
        />
        {rightAddon && (
          <span
            className={cn(
              'flex items-center font-sans text-body-sm text-muted',
              addonStyle === 'divided'
                ? 'border-l border-default bg-surface-secondary-subtle px-300'
                : 'pr-300',
            )}
          >
            {rightAddon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="font-sans text-caption text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="font-sans text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
