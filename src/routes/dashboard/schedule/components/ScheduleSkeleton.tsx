import { Skeleton } from '@/components/ui/Skeleton';
import { DAY_ORDER } from '../constants';

export function ScheduleSkeleton() {
  return (
    <main className="px-1000 py-800">
      <div className="flex items-center justify-between mb-700">
        <div className="flex flex-col gap-100">
          <Skeleton className="h-[40px] w-[220px]" rounded="sm" />
          <Skeleton className="h-[20px] w-[320px]" rounded="sm" />
        </div>
        <Skeleton className="h-[44px] w-[160px]" rounded="md" />
      </div>
      <div className="rounded-lg border border-default bg-surface overflow-hidden">
        {DAY_ORDER.map((d) => (
          <div key={d}>
            <div className="flex gap-[64px] items-center px-600 py-400">
              <div className="flex items-center gap-400 w-[133px]">
                <Skeleton className="h-[24px] w-[44px]" rounded="full" />
                <Skeleton className="h-[20px] w-[70px]" rounded="sm" />
              </div>
              <div className="flex flex-1 gap-400 items-center">
                <Skeleton className="h-[44px] flex-1" rounded="md" />
                <Skeleton className="h-[20px] w-[10px]" rounded="sm" />
                <Skeleton className="h-[44px] flex-1" rounded="md" />
              </div>
            </div>
            {d !== 0 && <div className="h-px w-full bg-neutral-alt-75" />}
          </div>
        ))}
      </div>
    </main>
  );
}
