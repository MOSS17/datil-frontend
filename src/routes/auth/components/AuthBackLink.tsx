import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface AuthBackLinkProps {
  to: string;
  label?: string;
}

export function AuthBackLink({ to, label = 'Volver al inicio de Sesión' }: AuthBackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-200 py-300 font-sans text-body-sm font-medium text-primary"
    >
      <ArrowLeft aria-hidden size={16} />
      {label}
    </Link>
  );
}
