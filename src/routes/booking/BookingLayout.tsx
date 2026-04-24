import { Outlet, useParams } from 'react-router-dom';
import { useBookingPage } from '@/api/hooks/useBooking';
import { BookingHeader } from './components/BookingHeader';
import { BookingFooter } from './components/BookingFooter';
import { BookingProvider } from './BookingContext';

export default function BookingLayout() {
  const { slug = '' } = useParams<{ slug: string }>();
  const pageQuery = useBookingPage(slug);
  const business = pageQuery.data?.business;

  return (
    <BookingProvider slug={slug}>
      <div className="flex min-h-screen flex-col bg-surface-page">
        <BookingHeader
          businessName={business?.name}
          businessSlug={slug}
          logoUrl={business?.logo_url || undefined}
        />
        <main className="flex-1">
          <Outlet />
        </main>
        <BookingFooter />
      </div>
    </BookingProvider>
  );
}
