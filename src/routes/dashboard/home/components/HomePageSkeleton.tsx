import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function HomePageSkeleton() {
  return (
    <>
      <div className="flex gap-200 md:gap-400">
        {[0, 1, 2].map((i) => (
          <Card
            key={i}
            padding="none"
            className="flex flex-1 flex-col gap-100 self-stretch px-300 py-200 md:gap-300 md:p-500"
          >
            <Skeleton className="h-700 w-1200" />
            <Skeleton className="h-400 w-1500" />
            <Skeleton className="h-400 w-1500" />
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-600 md:flex-1 md:flex-row">
        <Card padding="none" className="flex flex-1 flex-col gap-500 p-500">
          <Skeleton className="h-700 w-1500" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-1100 w-full" />
          ))}
        </Card>
        <Card padding="none" className="flex flex-1 flex-col gap-500 p-500">
          <Skeleton className="h-700 w-1500" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-1200 w-full" />
          ))}
        </Card>
      </div>
    </>
  );
}
