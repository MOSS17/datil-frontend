export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'] as const;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export type UploadError = 'required' | 'too-large' | 'wrong-type';

export function validatePaymentProof(file: File | null): UploadError | null {
  if (!file) return 'required';
  if (file.size > MAX_FILE_SIZE_BYTES) return 'too-large';
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return 'wrong-type';
  }
  return null;
}

export const UPLOAD_ERROR_MESSAGES: Record<UploadError, string> = {
  required: 'Por favor, ingresa un comprobante de pago',
  'too-large': 'El archivo excede 10 MB',
  'wrong-type': 'Solo se permiten archivos JPG, PNG o PDF',
};
