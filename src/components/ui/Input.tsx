import {
  forwardRef,
  useId,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { CircleSlash } from 'lucide-react';
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

const PICKER_TYPES = new Set([
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
  'color',
  'file',
]);

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
    type,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const internalRef = useRef<HTMLInputElement | null>(null);
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  const setRefs = (node: HTMLInputElement | null) => {
    internalRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const addonTriggersPicker = type !== undefined && PICKER_TYPES.has(type);
  const handleAddonClick = () => {
    const el = internalRef.current;
    if (!el) return;
    el.focus();
    try {
      el.showPicker?.();
    } catch {
      /* ignore for unsupported types */
    }
  };

  const rightAddonClasses = cn(
    'flex items-center font-sans text-body-sm text-muted',
    addonStyle === 'divided'
      ? 'border-l border-default bg-surface-secondary-subtle px-300'
      : 'pr-300',
  );

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
          ref={setRefs}
          id={inputId}
          type={type}
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
        {rightAddon &&
          (addonTriggersPicker ? (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={handleAddonClick}
              disabled={disabled}
              className={cn(
                rightAddonClasses,
                'hover:text-body-emphasis disabled:cursor-not-allowed disabled:text-disabled',
              )}
            >
              {rightAddon}
            </button>
          ) : (
            <span className={rightAddonClasses}>{rightAddon}</span>
          ))}
      </div>
      {error ? (
        <p
          id={`${inputId}-error`}
          className="flex items-start gap-200 font-sans text-body-sm font-medium text-error"
        >
          <CircleSlash aria-hidden size={16} className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="font-sans text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
