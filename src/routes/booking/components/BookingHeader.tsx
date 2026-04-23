import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface BookingHeaderProps {
  businessName?: string;
  businessSlug: string;
  logoUrl?: string;
}

export function BookingHeader({ businessName, businessSlug, logoUrl }: BookingHeaderProps) {
  return (
    <header className="border-b border-subtle bg-surface-page">
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1440px] items-center justify-between gap-400',
          'px-600 py-400 md:px-1200 md:py-600',
        )}
      >
        <Link
          to={`/${businessSlug}`}
          className="flex items-center gap-300"
          aria-label={businessName ? `Inicio de ${businessName}` : 'Inicio'}
        >
          <div className="flex h-800 w-800 items-center justify-center overflow-hidden rounded-md bg-surface-brand-subtle">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {businessName ? (
            <p className="font-serif text-h6 text-heading">{businessName}</p>
          ) : null}
        </Link>
        <p className="font-sans text-caption text-muted">Powered by Datil</p>
      </div>
    </header>
  );
}
