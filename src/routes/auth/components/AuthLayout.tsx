import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
  notice?: ReactNode;
}

export function AuthLayout({ children, notice }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-surface-page">
      <Link
        to="/"
        aria-label="Datil"
        className="absolute left-1000 top-1000 flex items-center gap-250 px-200"
      >
        <span
          aria-hidden
          className="flex h-700 w-700 items-center justify-center rounded-sm bg-surface-primary font-serif text-body-sm text-on-color"
        >
          D
        </span>
        <span className="font-serif text-body-lg text-heading">Datil</span>
      </Link>
      {notice && (
        <div className="absolute right-600 top-800 z-10 w-full max-w-[403px] px-600 md:px-0">
          {notice}
        </div>
      )}
      <div className="flex min-h-screen items-center justify-center px-600 py-1200">
        {children}
      </div>
    </div>
  );
}
