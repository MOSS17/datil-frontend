import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ChangeEvent,
} from 'react';
import { cn } from '@/lib/cn';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (next: string) => void;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  ariaLabel?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  error = false,
  ariaLabel = 'Código de verificación',
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const focusCell = (index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
    el?.select();
  };

  const commit = (nextDigits: string[]) => {
    const next = nextDigits.join('').slice(0, length);
    onChange(next);
    if (next.length === length && !next.includes('') && onComplete) {
      onComplete(next);
    }
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '');
    if (!raw) {
      const next = [...digits];
      next[index] = '';
      commit(next);
      return;
    }

    const next = [...digits];
    const chars = raw.split('');
    let cursor = index;
    for (const char of chars) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }
    commit(next);
    focusCell(cursor);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        commit(next);
        return;
      }
      if (index > 0) {
        event.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        commit(next);
        focusCell(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusCell(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    const next = [...digits];
    let cursor = index;
    for (const char of pasted.split('')) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }
    commit(next);
    focusCell(cursor);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-start justify-center gap-400"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Dígito ${index + 1}`}
          aria-invalid={error || undefined}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          className={cn(
            'h-[56px] w-[48px] rounded-md border bg-surface text-center font-sans text-body text-body-emphasis transition-colors',
            'focus:border-primary focus:outline-none',
            error ? 'border-error' : 'border-default',
            disabled && 'bg-surface-disabled border-disabled text-disabled',
          )}
        />
      ))}
    </div>
  );
}
