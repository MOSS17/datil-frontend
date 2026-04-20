import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Plus, Save, X } from 'lucide-react';
import { useWorkdays, useUpdateWorkdays } from '@/api/hooks/useSchedule';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import type { Workday } from '@/api/types/schedule';

// ─── Constants ──────────────────────────────────────────────────────────────

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hour12}:${String(m).padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

// ─── Local draft types ───────────────────────────────────────────────────────

interface DraftHour {
  _key: string;
  id: string;
  workday_id: string;
  start_time: string;
  end_time: string;
}

interface DraftWorkday {
  id: string;
  business_id: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  is_enabled: boolean;
  hours: DraftHour[];
}

function toDraft(workdays: Workday[]): DraftWorkday[] {
  return workdays.map((w) => ({
    ...w,
    hours: w.hours.length > 0
      ? w.hours.map((h) => ({ ...h, _key: h.id }))
      : [{ _key: crypto.randomUUID(), id: '', workday_id: w.id, start_time: '09:00', end_time: '17:00' }],
  }));
}

function toWorkdays(drafts: DraftWorkday[]): Workday[] {
  return drafts.map(({ hours, ...rest }) => ({
    ...rest,
    hours: hours.map(({ _key: _k, ...h }) => h),
  }));
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface DayToggleProps {
  enabled: boolean;
  label: string;
  onToggle: () => void;
}

function DayToggle({ enabled, label, onToggle }: DayToggleProps) {
  return (
    <div className="flex items-center gap-400 shrink-0 w-[133px]">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Desactivar' : 'Activar'} ${label}`}
        onClick={onToggle}
        className={cn(
          'relative flex h-[24px] w-[44px] shrink-0 rounded-full p-[2px] transition-colors',
          enabled ? 'bg-surface-primary items-end justify-end' : 'bg-surface-disabled-emphasis items-start justify-start',
        )}
      >
        <span className="block h-[20px] w-[20px] rounded-full bg-surface" />
      </button>
      <span className="font-sans text-body font-medium text-body-emphasis whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// ─── TimeSelect ──────────────────────────────────────────────────────────────

interface TimeSelectProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  id?: string;
}

function TimeSelect({ value, disabled, onChange, id }: TimeSelectProps) {
  return (
    <div className="relative flex flex-1 min-w-0">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-md border py-300 pl-300 pr-800 font-sans text-body-sm transition-colors',
          disabled
            ? 'border-disabled text-disabled bg-surface cursor-not-allowed'
            : 'border-default text-body-emphasis bg-surface cursor-pointer hover:border-primary focus:outline-none focus:border-primary',
        )}
      >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={14}
        strokeWidth={1.75}
        className={cn(
          'pointer-events-none absolute right-300 top-1/2 -translate-y-1/2',
          disabled ? 'text-disabled' : 'text-icon-secondary',
        )}
      />
    </div>
  );
}

// ─── DayRow ──────────────────────────────────────────────────────────────────

interface DayRowProps {
  day: DraftWorkday;
  onToggle: () => void;
  onChangeHour: (key: string, field: 'start_time' | 'end_time', value: string) => void;
  onAddHour: () => void;
  onRemoveHour: (key: string) => void;
}

function DayRow({ day, onToggle, onChangeHour, onAddHour, onRemoveHour }: DayRowProps) {
  const isDisabled = !day.is_enabled;

  return (
    <div className="flex gap-[64px] items-start justify-center px-600 py-400 w-full">
      <DayToggle
        enabled={day.is_enabled}
        label={DAY_NAMES[day.day]}
        onToggle={onToggle}
      />

      <div className="flex flex-1 min-w-0 flex-col gap-400 items-start">
        {day.hours.map((hour, idx) => (
          <div key={hour._key} className="flex items-center gap-400 w-full">
            <TimeSelect
              value={hour.start_time}
              disabled={isDisabled}
              onChange={(val) => onChangeHour(hour._key, 'start_time', val)}
            />
            <span
              className={cn(
                'font-sans text-body font-medium whitespace-nowrap shrink-0',
                isDisabled ? 'text-disabled' : 'text-body-emphasis',
              )}
            >
              a
            </span>
            <TimeSelect
              value={hour.end_time}
              disabled={isDisabled}
              onChange={(val) => onChangeHour(hour._key, 'end_time', val)}
            />
            {day.hours.length > 1 && !isDisabled && (
              <button
                type="button"
                aria-label="Eliminar horario"
                onClick={() => onRemoveHour(hour._key)}
                className="shrink-0 text-icon-secondary hover:text-icon-primary transition-colors"
              >
                <X aria-hidden size={20} strokeWidth={1.75} />
              </button>
            )}
            {(day.hours.length === 1 || isDisabled) && idx === 0 && (
              <span className="shrink-0 w-[20px]" />
            )}
          </div>
        ))}

        {!isDisabled && (
          <button
            type="button"
            onClick={onAddHour}
            className="flex items-center gap-200 py-100 font-sans text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <Plus aria-hidden size={16} strokeWidth={1.75} />
            Agregar Otro Horario
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ScheduleSkeleton() {
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

// ─── Error state ─────────────────────────────────────────────────────────────

function ScheduleError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-400 px-1000 py-800">
      <p className="font-sans text-body text-muted text-center">
        No se pudo cargar tu disponibilidad.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    </main>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const { data, isLoading, error, refetch } = useWorkdays();
  const updateWorkdays = useUpdateWorkdays();
  const [draft, setDraft] = useState<DraftWorkday[]>([]);

  useEffect(() => {
    if (data) setDraft(toDraft(data));
  }, [data]);

  const getDayDraft = useCallback(
    (day: number) => draft.find((d) => d.day === day),
    [draft],
  );

  const updateDay = useCallback((day: number, updater: (d: DraftWorkday) => DraftWorkday) => {
    setDraft((prev) => prev.map((d) => (d.day === day ? updater(d) : d)));
  }, []);

  const handleToggle = (day: number) => {
    updateDay(day, (d) => ({ ...d, is_enabled: !d.is_enabled }));
  };

  const handleChangeHour = (day: number, key: string, field: 'start_time' | 'end_time', value: string) => {
    updateDay(day, (d) => ({
      ...d,
      hours: d.hours.map((h) => (h._key === key ? { ...h, [field]: value } : h)),
    }));
  };

  const handleAddHour = (day: number, workdayId: string) => {
    updateDay(day, (d) => ({
      ...d,
      hours: [
        ...d.hours,
        { _key: crypto.randomUUID(), id: '', workday_id: workdayId, start_time: '09:00', end_time: '17:00' },
      ],
    }));
  };

  const handleRemoveHour = (day: number, key: string) => {
    updateDay(day, (d) => ({
      ...d,
      hours: d.hours.filter((h) => h._key !== key),
    }));
  };

  const handleSave = async () => {
    await updateWorkdays.mutateAsync(toWorkdays(draft));
  };

  if (isLoading || draft.length === 0) return <ScheduleSkeleton />;
  if (error) return <ScheduleError onRetry={() => refetch()} />;

  const orderedDays = DAY_ORDER.map((d) => getDayDraft(d)).filter(Boolean) as DraftWorkday[];

  return (
    <main className="px-1000 py-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-700">
        <div className="flex flex-col gap-100">
          <h1 className="font-serif text-h4 text-heading">Disponibilidad</h1>
          <p className="font-sans text-body-sm text-muted">
            Define tu horario de trabajo, descansos y días libres.
          </p>
        </div>
        <Button
          variant="primary"
          isLoading={updateWorkdays.isPending}
          leftIcon={<Save aria-hidden size={16} strokeWidth={1.75} />}
          onClick={handleSave}
        >
          Guardar Cambios
        </Button>
      </div>

      {/* Schedule card */}
      <div className="rounded-lg border border-default bg-surface overflow-hidden py-400">
        {orderedDays.map((day, idx) => (
          <div key={day.day}>
            <DayRow
              day={day}
              onToggle={() => handleToggle(day.day)}
              onChangeHour={(key, field, value) => handleChangeHour(day.day, key, field, value)}
              onAddHour={() => handleAddHour(day.day, day.id)}
              onRemoveHour={(key) => handleRemoveHour(day.day, key)}
            />
            {idx < orderedDays.length - 1 && (
              <div className="h-px w-full bg-neutral-alt-75" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
