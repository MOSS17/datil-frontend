import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { DashboardData } from '@/api/types/dashboard';

export interface UseDashboardOptions {
  upcomingLimit?: number;
  latestLimit?: number;
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  params: (opts: UseDashboardOptions) => [...dashboardKeys.all, opts] as const,
};

function buildQuery(opts: UseDashboardOptions): string {
  const params = new URLSearchParams();
  if (opts.upcomingLimit !== undefined) {
    params.set('upcoming_limit', String(opts.upcomingLimit));
  }
  if (opts.latestLimit !== undefined) {
    params.set('latest_limit', String(opts.latestLimit));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useDashboard(opts: UseDashboardOptions = {}) {
  return useQuery({
    queryKey: dashboardKeys.params(opts),
    queryFn: () => apiClient<DashboardData>(`${ENDPOINTS.DASHBOARD}${buildQuery(opts)}`),
  });
}
