import { Skeleton } from '@/components/ui/Skeleton';
import { DAY_ORDER } from '../constants';

export function ScheduleSkeleton() {
  return (
    <main className="px-400 py-800 md:px-1000">
      <div className="flex items-center justify-between mb-700">
        <div className="flex flex-col gap-100">
          <Skeleton className="h-[32px] w-[220px] md:h-[40px]" rounded="sm" />
          <Skeleton className="h-[20px] w-[280px] md:w-[320px]" rounded="sm" />
        </div>
        <Skeleton className="hidden h-[44px] w-[160px] md:block" rounded="md" />
      </div>
      <div className="flex flex-col gap-600 border-default md:gap-0 md:rounded-lg md:border md:bg-surface md:overflow-hidden md:py-400">
        {DAY_ORDER.map((d, idx) => (
          <div key={d}>
            <div className="flex flex-col gap-600 w-full md:flex-row md:gap-[64px] md:items-center md:px-600 md:py-400">
              <div className="flex items-center gap-400 w-full md:w-[133px]">
                <Skeleton className="h-[24px] w-[44px]" rounded="full" />
                <Skeleton className="h-[20px] w-[70px]" rounded="sm" />
              </div>
              <div className="flex flex-1 gap-400 items-center w-full">
                <Skeleton className="h-[44px] flex-1" rounded="md" />
                <Skeleton className="h-[20px] w-[10px]" rounded="sm" />
                <Skeleton className="h-[44px] flex-1" rounded="md" />
              </div>
            </div>
            {idx < DAY_ORDER.length - 1 && <div className="h-px w-full bg-neutral-alt-75" />}
          </div>
        ))}
      </div>
      <div className="mt-1200 md:hidden">
        <Skeleton className="h-[44px] w-full" rounded="md" />
      </div>
    </main>
  );
}
