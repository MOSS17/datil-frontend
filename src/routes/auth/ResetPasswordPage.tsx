import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useResetPassword } from '@/api/hooks/useAuth';
import { ApiError } from '@/api/client';
import { AuthLayout } from './components/AuthLayout';
import { AuthBackLink } from './components/AuthBackLink';

const resetSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return <Navigate to="/login/recuperar" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await reset.mutateAsync({ token, password: values.password });
      navigate('/login?reset=success', { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No pudimos guardar tu contraseña. Inténtalo de nuevo.';
      setError('password', { message });
    }
  });

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-1300">
        <div className="flex flex-col items-start gap-800">
          <AuthBackLink to="/login" />
          <div className="flex w-full flex-col items-center gap-800 text-center">
            <h1 className="whitespace-nowrap font-serif text-h2 text-heading">
              Crea una nueva contraseña
            </h1>
            <p className="max-w-[434px] font-sans text-body-lg text-primary-400">
              Elige una contraseña segura para tu cuenta.
            </p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex w-[439px] max-w-full flex-col gap-1000"
        >
          <div className="flex flex-col gap-800">
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Ingresa una nueva contraseña"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Ingresa la misma contraseña"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Guardar contraseña
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
