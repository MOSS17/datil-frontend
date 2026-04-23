import { Skeleton } from '@/components/ui/Skeleton';

export function ScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-600">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-400 px-600 py-600 md:px-1200">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-800 w-800" rounded="full" />
        ))}
      </div>
      <Skeleton className="h-1100 w-full" />
      <div className="mx-auto grid w-full max-w-[1440px] gap-600 px-600 md:grid-cols-[2fr_1fr] md:px-1200">
        <Skeleton className="h-[420px] w-full" rounded="lg" />
        <Skeleton className="h-[420px] w-full" rounded="lg" />
      </div>
    </div>
  );
}
