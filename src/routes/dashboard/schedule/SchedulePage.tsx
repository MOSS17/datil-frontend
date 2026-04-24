import { Save } from 'lucide-react';
import { useWorkdays, useUpdateWorkdays } from '@/api/hooks/useSchedule';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { DAY_ORDER } from './constants';
import { toWorkdays } from './draft';
import { useWorkdayDraft } from './useWorkdayDraft';
import type { DraftWorkday } from './types';
import { DayRow } from './components/DayRow';
import { ScheduleSkeleton } from './components/ScheduleSkeleton';

export default function SchedulePage() {
  const { data, isLoading, error, refetch } = useWorkdays();
  const updateWorkdays = useUpdateWorkdays();
  const { draft, toggleDay, changeHour, addHour, removeHour } = useWorkdayDraft(data);

  if (isLoading || draft.length === 0) return <ScheduleSkeleton />;

  if (error) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-400 py-800 md:px-1000">
        <ErrorState
          message="No se pudo cargar tu disponibilidad."
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  const orderedDays = DAY_ORDER
    .map((d) => draft.find((item) => item.day === d))
    .filter(Boolean) as DraftWorkday[];

  const saveButton = (
    <Button
      variant="primary"
      isLoading={updateWorkdays.isPending}
      leftIcon={<Save aria-hidden size={16} strokeWidth={1.75} />}
      onClick={() => updateWorkdays.mutateAsync(toWorkdays(draft))}
    >
      Guardar Cambios
    </Button>
  );

  return (
    <main className="px-400 py-800 md:px-1000">
      <PageHeader
        title="Disponibilidad"
        subtitle="Define tu horario de trabajo, descansos y días libres."
        className="mb-700"
        actions={<div className="hidden md:block">{saveButton}</div>}
      />

      <div className="flex flex-col gap-600 md:gap-0 md:rounded-lg md:border md:border-default md:bg-surface md:overflow-hidden md:py-400">
        {orderedDays.map((day, idx) => (
          <div key={day.day}>
            <DayRow
              day={day}
              onToggle={() => toggleDay(day.day)}
              onChangeHour={(key, field, value) => changeHour(day.day, key, field, value)}
              onAddHour={() => addHour(day.day, day.id)}
              onRemoveHour={(key) => removeHour(day.day, key)}
            />
            {idx < orderedDays.length - 1 && (
              <div className="h-px w-full bg-neutral-alt-75" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <div className="mt-1200 md:hidden">
        <Button
          variant="primary"
          fullWidth
          isLoading={updateWorkdays.isPending}
          leftIcon={<Save aria-hidden size={16} strokeWidth={1.75} />}
          onClick={() => updateWorkdays.mutateAsync(toWorkdays(draft))}
        >
          Guardar Cambios
        </Button>
      </div>
    </main>
  );
}
