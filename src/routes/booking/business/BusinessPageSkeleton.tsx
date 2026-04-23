import { Skeleton } from '@/components/ui/Skeleton';

export function BusinessPageSkeleton() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center gap-600 px-600 py-800 md:px-1200">
        <Skeleton className="h-[98px] w-[98px]" />
        <div className="flex flex-col items-center gap-200">
          <Skeleton className="h-900 w-[280px]" />
          <Skeleton className="h-500 w-[360px]" />
        </div>
        <Skeleton className="h-500 w-[160px]" />
      </section>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-800 px-600 py-800 md:px-1200">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[160px]" />
            <div className="grid gap-400 md:grid-cols-2 md:gap-600 lg:grid-cols-3">
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-[120px] w-full" rounded="lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
