import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyEmailRequest,
  ResendCodeRequest,
} from '@/api/types/auth';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { method: 'POST', body: data }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient<AuthResponse>(ENDPOINTS.AUTH.REGISTER, { method: 'POST', body: data }),
  });
}

// TODO(backend): /auth/verify-email and /auth/resend-code are not yet implemented
// server-side. The frontend expects verify-email to return an AuthResponse
// (token + user) so we can log the user in once their email is confirmed.
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailRequest) =>
      apiClient<AuthResponse>(ENDPOINTS.AUTH.VERIFY_EMAIL, { method: 'POST', body: data }),
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: (data: ResendCodeRequest) =>
      apiClient<void>(ENDPOINTS.AUTH.RESEND_CODE, { method: 'POST', body: data }),
  });
}
