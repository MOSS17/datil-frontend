import { cn } from '@/lib/cn';

export type BookingStepId = 1 | 2 | 3 | 4;

const STEPS: { id: BookingStepId; label: string }[] = [
  { id: 1, label: 'Seleccionar Servicio' },
  { id: 2, label: 'Fecha y Hora' },
  { id: 3, label: 'Tus Datos' },
  { id: 4, label: 'Anticipo' },
];

interface BookingStepperProps {
  currentStep: BookingStepId;
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <nav aria-label="Pasos de reservación">
      <ol className="mx-auto flex w-full max-w-[1440px] items-center justify-center px-600 md:px-1200">
        {STEPS.map((step, index) => {
          const completed = step.id < currentStep;
          const current = step.id === currentStep;
          const upcoming = step.id > currentStep;
          return (
            <li key={step.id} className="flex items-center">
              <div className="flex items-center gap-300">
                <span
                  aria-hidden
                  className={cn(
                    'flex h-800 w-800 shrink-0 items-center justify-center rounded-full font-sans text-body-sm font-medium',
                    completed && 'bg-surface-primary text-on-color',
                    current && 'border-2 border-primary bg-surface text-primary',
                    upcoming && 'border border-control bg-surface text-muted',
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    'hidden font-sans text-body-sm font-medium md:inline',
                    completed && 'text-primary',
                    current && 'text-primary',
                    upcoming && 'text-muted',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'mx-400 h-px w-500 md:w-800',
                    completed ? 'bg-primary' : 'bg-border-control',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].label}
      </p>
    </nav>
  );
}
