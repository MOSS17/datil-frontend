import { Skeleton } from '@/components/ui/Skeleton';

export function DatosSkeleton() {
  return (
    <div className="flex flex-col gap-600">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-400 px-600 py-600 md:px-1200 md:py-1100">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-700 w-700" rounded="full" />
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-[1440px] gap-600 px-600 pb-1100 md:grid-cols-[360px_1fr] md:gap-1100 md:px-1200">
        <Skeleton className="h-[420px] w-full" rounded="lg" />
        <Skeleton className="h-[320px] w-full" rounded="lg" />
      </div>
    </div>
  );
}
