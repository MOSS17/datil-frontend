import { Skeleton } from '@/components/ui/Skeleton';

export function ReservationSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-800 px-600 py-800">
      <Skeleton className="h-500 w-[80px]" />
      <Skeleton className="mx-auto h-900 w-[200px]" />
      <div className="flex flex-col gap-600">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-col gap-300 border-b border-default pb-600">
            <Skeleton className="h-500 w-[180px]" />
            <Skeleton className="h-400 w-full max-w-[280px]" />
            <Skeleton className="h-400 w-[120px]" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[52px] w-full" rounded="md" />
    </div>
  );
}
