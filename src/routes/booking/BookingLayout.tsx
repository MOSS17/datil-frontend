import { Outlet, useParams } from 'react-router-dom';
import { useBusinessBySlug } from '@/api/hooks/useBusiness';
import { BookingHeader } from './components/BookingHeader';
import { BookingFooter } from './components/BookingFooter';
import { BookingProvider } from './BookingContext';

export default function BookingLayout() {
  const { slug = '' } = useParams<{ slug: string }>();
  const businessQuery = useBusinessBySlug(slug);

  return (
    <BookingProvider slug={slug}>
      <div className="flex min-h-screen flex-col bg-surface-page">
        <BookingHeader
          businessName={businessQuery.data?.name}
          businessSlug={slug}
          logoUrl={businessQuery.data?.logo_url || undefined}
        />
        <main className="flex-1">
          <Outlet />
        </main>
        <BookingFooter />
      </div>
    </BookingProvider>
  );
}
