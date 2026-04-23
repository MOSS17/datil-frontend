import { BookingStepper } from '../components/BookingStepper';
import { Skeleton } from '@/components/ui/Skeleton';

export function ConfirmBookingSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-600 py-600 md:px-1200 md:py-1100">
        <BookingStepper currentStep={4} />
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-400 pb-1100 pt-600 md:px-1200 md:pt-0">
        <div className="grid gap-800 md:grid-cols-[360px_1fr] md:gap-1100">
          <div className="hidden md:flex md:flex-col md:gap-600">
            <Skeleton className="h-700 w-[240px]" />
            <Skeleton className="h-[340px] w-full" rounded="md" />
          </div>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[160px]" />
            <Skeleton className="h-[420px] w-full" rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
