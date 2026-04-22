import { Controller, useFormContext } from 'react-hook-form';
import type { Category } from '@/api/types/categories';
import type { ServiceFormValues } from '../schema';
import { ExtrasGroupSelect } from './ExtrasGroupSelect';

interface AgregarComplementosProps {
  extrasGroups: Category[];
}

export function AgregarComplementos({ extrasGroups }: AgregarComplementosProps) {
  const { control } = useFormContext<ServiceFormValues>();

  return (
    <aside className="flex flex-col gap-400">
      <div className="flex flex-col gap-200">
        <h2 className="font-serif text-h5 text-heading">Agregar Complementos</h2>
        <p className="font-sans text-body-sm text-muted">
          Configura complementos que tus clientes puedan agregar a su cita. El tiempo de su reservación aumentará dependiendo de sus extras.
        </p>
      </div>
      <Controller
        name="extrasGroupIds"
        control={control}
        render={({ field }) => (
          <ExtrasGroupSelect
            label="Grupo de complementos"
            options={extrasGroups}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </aside>
  );
}
