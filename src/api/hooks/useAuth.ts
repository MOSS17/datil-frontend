import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/api/types/auth';

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
