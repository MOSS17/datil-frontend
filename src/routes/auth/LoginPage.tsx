import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/api/hooks/useAuth';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/api/client';
import { AuthLayout } from './components/AuthLayout';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Por favor, ingresa tu email')
    .email('Ingresa un email válido'),
  password: z.string().min(1, 'Por favor, ingresa tu contraseña'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function ResetSuccessNotice() {
  return (
    <div
      role="status"
      className="flex items-center gap-200 rounded-md border border-success bg-surface-success-subtle px-400 py-300"
    >
      <Info aria-hidden size={20} className="shrink-0 text-success" />
      <p className="font-sans text-body text-success">
        <span className="font-medium">¡Listo! Tu contraseña se actualizó.</span>{' '}
        Ya puedes entrar con tus nuevos datos.
      </p>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const resetSuccess = searchParams.get('reset') === 'success';
  const redirect = searchParams.get('redirect') ?? '/dashboard';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await loginMutation.mutateAsync(values);
      login(response.access_token, response.user, response.refresh_token);
      navigate(redirect, { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? 'Tu correo o tu contraseña es incorrecta. Por favor intenta de nuevo'
          : error instanceof ApiError
            ? error.message
            : 'No pudimos iniciar sesión. Inténtalo de nuevo.';
      setError('password', { message });
    }
  });

  return (
    <AuthLayout notice={resetSuccess ? <ResetSuccessNotice /> : undefined}>
      <div className="flex flex-col items-center gap-1300">
        <div className="flex flex-col items-center gap-800 text-center whitespace-nowrap">
          <h1 className="font-serif text-h2 text-heading">Hora de empezar el día</h1>
          <p className="font-sans text-body-lg text-primary-400">
            Que lindo verte de vuelta.
          </p>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex w-[439px] max-w-full flex-col gap-1000"
        >
          <div className="flex flex-col gap-800">
            <Input
              label="Email"
              type="email"
              placeholder="Ingresa tu email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Link
            to="/login/recuperar"
            className="font-sans text-body font-medium text-primary underline"
          >
            Olvidé mi contraseña
          </Link>

          <div className="flex flex-col gap-600">
            <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
              Iniciar Sesión
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/registro')}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
