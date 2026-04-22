import { useState } from 'react';
import { Calendar, Coffee } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/cn';
import type { Service } from '@/api/types/services';
import type { CitaFormValues, TiempoPersonalFormValues } from '../schema';
import { CitaForm } from './CitaForm';
import { TiempoPersonalForm } from './TiempoPersonalForm';

type Tab = 'cita' | 'tiempo';

interface NuevoBloqueDrawerProps {
  open: boolean;
  onClose: () => void;
  services: Service[];
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  formKey?: string;
  isSubmittingCita?: boolean;
  isSubmittingTiempo?: boolean;
  onSubmitCita: (values: CitaFormValues) => void | Promise<void>;
  onSubmitTiempo: (values: TiempoPersonalFormValues) => void | Promise<void>;
  citaOutsideHours?: boolean;
  citaConflictMessage?: string | null;
  tiempoInfoMessage?: string | null;
}

export function NuevoBloqueDrawer({
  open,
  onClose,
  services,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  formKey,
  isSubmittingCita,
  isSubmittingTiempo,
  onSubmitCita,
  onSubmitTiempo,
  citaOutsideHours,
  citaConflictMessage,
  tiempoInfoMessage,
}: NuevoBloqueDrawerProps) {
  const [tab, setTab] = useState<Tab>('cita');

  return (
    <Drawer open={open} onClose={onClose} title="Nuevo Bloque" ariaLabel="Nuevo Bloque">
      <div className="flex flex-col gap-500">
        <div className="flex gap-300">
          <TabButton active={tab === 'cita'} onClick={() => setTab('cita')} icon={Calendar}>
            Cita
          </TabButton>
          <TabButton active={tab === 'tiempo'} onClick={() => setTab('tiempo')} icon={Coffee}>
            Tiempo Personal
          </TabButton>
        </div>
        <hr className="border-t border-subtle" aria-hidden />
        {tab === 'cita' ? (
          <CitaForm
            key={`cita-${formKey ?? ''}`}
            services={services}
            defaultDate={defaultDate}
            defaultStartTime={defaultStartTime}
            defaultEndTime={defaultEndTime}
            isSubmitting={isSubmittingCita}
            outsideWorkingHours={citaOutsideHours}
            conflictMessage={citaConflictMessage}
            onSubmit={onSubmitCita}
          />
        ) : (
          <TiempoPersonalForm
            key={`tiempo-${formKey ?? ''}`}
            defaultDate={defaultDate}
            defaultStartTime={defaultStartTime}
            defaultEndTime={defaultEndTime}
            infoMessage={tiempoInfoMessage}
            isSubmitting={isSubmittingTiempo}
            onSubmit={onSubmitTiempo}
          />
        )}
      </div>
    </Drawer>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon: Icon, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-200 rounded-md border bg-surface px-400 py-200 font-sans text-body-sm font-medium transition-colors',
        active
          ? 'border-primary text-body-emphasis'
          : 'border-control text-body hover:bg-surface-secondary-subtle',
      )}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </button>
  );
}
