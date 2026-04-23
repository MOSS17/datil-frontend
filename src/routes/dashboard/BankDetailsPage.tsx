import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyBusiness, useUpdateBusinessBank } from '@/api/hooks/useBusiness';
import { applyApiErrors } from '@/api/formErrors';
import { clabeSchema } from '@/lib/validators';
import { PageHeader } from './components/PageHeader';
import { ErrorState } from './components/ErrorState';

const bankSchema = z.object({
  beneficiary_name: z
    .string()
    .min(1, 'El nombre del beneficiario es obligatorio')
    .max(120, 'Máximo 120 caracteres'),
  bank_name: z
    .string()
    .min(1, 'El nombre del banco es obligatorio')
    .max(80, 'Máximo 80 caracteres'),
  beneficiary_clabe: clabeSchema,
});

type BankFormValues = z.infer<typeof bankSchema>;

export default function BankDetailsPage() {
  const { data: business, isLoading, error, refetch } = useMyBusiness();
  const updateBank = useUpdateBusinessBank();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitSuccessful },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      beneficiary_name: '',
      bank_name: '',
      beneficiary_clabe: '',
    },
  });

  useEffect(() => {
    if (!business) return;
    reset({
      beneficiary_name: business.bank_holder,
      bank_name: business.bank_name,
      beneficiary_clabe: business.clabe,
    });
  }, [business, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateBank.mutateAsync(values);
    } catch (err) {
      applyApiErrors(err, setError);
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
      <PageHeader
        title="Datos Bancarios"
        subtitle="Usaremos esta cuenta para recibir los anticipos de tus clientes."
      />

      {isLoading ? (
        <Card>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-1000 w-full" />
            <Skeleton className="h-1000 w-full" />
            <Skeleton className="h-1000 w-full" />
          </div>
        </Card>
      ) : error ? (
        <Card>
          <ErrorState
            message="No se pudieron cargar tus datos bancarios."
            onRetry={() => refetch()}
          />
        </Card>
      ) : !business ? (
        <Card>
          <p className="font-sans text-body">
            No encontramos tu negocio. Contacta soporte si crees que es un error.
          </p>
        </Card>
      ) : (
        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-600">
            <Input
              label="Nombre del Beneficiario"
              placeholder="Guadalupe Urias Soto"
              error={errors.beneficiary_name?.message}
              {...register('beneficiary_name')}
            />
            <Input
              label="Banco"
              placeholder="BBVA"
              error={errors.bank_name?.message}
              {...register('bank_name')}
            />
            <Input
              label="CLABE Interbancaria"
              placeholder="18 dígitos"
              inputMode="numeric"
              maxLength={18}
              error={errors.beneficiary_clabe?.message}
              {...register('beneficiary_clabe')}
            />
            <div className="flex items-center justify-end gap-300">
              {isSubmitSuccessful && !updateBank.isPending && (
                <span
                  role="status"
                  className="font-sans text-body-sm text-success"
                >
                  Datos guardados
                </span>
              )}
              <Button
                type="submit"
                isLoading={updateBank.isPending}
                leftIcon={<Save size={16} strokeWidth={1.75} aria-hidden />}
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
