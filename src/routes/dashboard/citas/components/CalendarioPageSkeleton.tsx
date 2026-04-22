import { Skeleton } from '@/components/ui/Skeleton';

export function CalendarioPageSkeleton() {
  return (
    <div className="flex flex-col gap-600 p-400 md:p-800">
      <div className="flex flex-col gap-400 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-200">
          <Skeleton className="h-900 w-[220px]" />
          <Skeleton className="h-500 w-[320px]" />
        </div>
        <div className="flex items-center gap-300">
          <Skeleton className="h-1000 w-[140px]" />
          <Skeleton className="h-1000 w-[72px]" />
          <Skeleton className="h-1000 w-[140px]" />
        </div>
      </div>
      <Skeleton className="h-[520px] w-full" rounded="lg" />
    </div>
  );
}
