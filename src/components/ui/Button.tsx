import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-surface-primary text-on-color hover:bg-surface-primary-hover disabled:bg-surface-disabled disabled:text-disabled',
  secondary:
    'bg-surface text-primary border border-control hover:bg-surface-secondary-subtle disabled:bg-surface-disabled disabled:text-disabled disabled:border-disabled',
  ghost:
    'bg-transparent text-primary hover:bg-surface-secondary-subtle disabled:text-disabled',
  danger:
    'bg-surface-error text-on-color hover:bg-error-600 disabled:bg-surface-disabled disabled:text-disabled',
  accent:
    'bg-surface-accent text-on-color hover:bg-accent-700 disabled:bg-surface-disabled disabled:text-disabled',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-400 py-200 text-body-sm gap-200',
  md: 'px-600 py-300 text-body-sm gap-200',
  lg: 'px-800 py-400 text-body gap-300',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-sans font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span
          aria-hidden
          className="h-400 w-400 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});
