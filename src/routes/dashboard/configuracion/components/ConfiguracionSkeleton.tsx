import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ConfiguracionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-600 lg:grid-cols-2 items-start">
      <div className="flex flex-col gap-600">
        <Card>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[40%]" />
            <Skeleton className="h-1400 w-full" />
            <Skeleton className="h-1000 w-full" />
            <Skeleton className="h-1000 w-full" />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[50%]" />
            <Skeleton className="h-1500 w-full" />
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex flex-col gap-600">
          <Skeleton className="h-700 w-[60%]" />
          <Skeleton className="h-1100 w-full" />
          <Skeleton className="h-1100 w-full" />
        </div>
      </Card>
    </div>
  );
}
