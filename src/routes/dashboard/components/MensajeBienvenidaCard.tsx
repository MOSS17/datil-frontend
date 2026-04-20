import { useFormContext } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import type { ConfiguracionFormValues } from '../ConfiguracionPage';

export function MensajeBienvenidaCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConfiguracionFormValues>();

  return (
    <Card>
      <div className="flex flex-col gap-600">
        <h2 className="font-serif text-h6 text-heading">Mensaje de bienvenida</h2>
        <Textarea
          label="Descripción de la Página"
          placeholder="💋 Where beauty becomes art. | 📍 Punto Palmas | Cd Obregón"
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />
      </div>
    </Card>
  );
}
