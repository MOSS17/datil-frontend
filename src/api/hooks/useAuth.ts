import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  VerifyEmailRequest,
  ResendCodeRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
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

// TODO(backend): /auth/forgot-password and /auth/reset-password are not yet
// implemented server-side. Forgot-password should return 204 regardless of
// whether the email exists (to avoid account enumeration); reset-password
// expects the token from the emailed link and returns 204 on success,
// 400 with an ApiError message when the token is invalid or expired.
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      apiClient<void>(ENDPOINTS.AUTH.FORGOT_PASSWORD, { method: 'POST', body: data }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      apiClient<void>(ENDPOINTS.AUTH.RESET_PASSWORD, { method: 'POST', body: data }),
  });
}
