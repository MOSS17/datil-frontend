import { Navigate, useSearchParams } from 'react-router-dom';

export default function CalendarCallbackRedirect() {
  const [params] = useSearchParams();
  const search = params.toString();
  const target = search
    ? `/dashboard/configuracion?${search}`
    : '/dashboard/configuracion';
  return <Navigate to={target} replace />;
}
