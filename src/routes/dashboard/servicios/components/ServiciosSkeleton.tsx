import { Skeleton } from '@/components/ui/Skeleton';

export function ServiciosSkeleton() {
  return (
    <div className="flex flex-col gap-700" aria-label="Cargando servicios">
      <div className="flex items-center justify-between">
        <Skeleton className="h-1000 w-[288px]" />
        <Skeleton className="h-1000 w-[180px]" />
      </div>
      {[0, 1, 2].map((key) => (
        <div key={key} className="overflow-hidden rounded-lg border border-subtle bg-surface">
          <div className="flex items-center justify-between border-b border-default px-800 py-400">
            <Skeleton className="h-700 w-[160px]" />
            <Skeleton className="h-700 w-[140px]" />
          </div>
          <div className="flex flex-col">
            {[0, 1].map((row) => (
              <div key={row} className="bg-surface-secondary-subtle px-800 py-400">
                <Skeleton className="h-600 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
