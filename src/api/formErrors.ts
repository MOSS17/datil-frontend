import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './client';

export function applyApiErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fieldMap?: Partial<Record<string, Path<T>>>,
): boolean {
  if (!(err instanceof ApiError) || !err.errors) return false;
  for (const [apiField, message] of Object.entries(err.errors)) {
    const formField = (fieldMap?.[apiField] ?? apiField) as Path<T>;
    setError(formField, { message });
  }
  return true;
}
