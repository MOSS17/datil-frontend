import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/api/hooks/useAuth';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/api/client';
import { AuthLayout } from './components/AuthLayout';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Por favor, ingresa tu nombre'),
  businessName: z
    .string()
    .trim()
    .min(2, 'Por favor, ingresa el nombre de tu negocio'),
  email: z
    .string()
    .trim()
    .min(1, 'Por favor, ingresa tu email')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const { login } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', businessName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Backend signs the user in immediately on signup — email verification
      // was dropped in phase 1, so skip the OTP step and go straight to the
      // dashboard with the returned token pair.
      const response = await register.mutateAsync({
        name: values.name,
        business_name: values.businessName,
        email: values.email,
        password: values.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      login(response.access_token, response.user, response.refresh_token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No pudimos crear tu cuenta. Inténtalo de nuevo.';
      setError('root', { message });
    }
  });

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-1300">
        <div className="flex flex-col items-center gap-800 text-center whitespace-nowrap">
          <h1 className="font-serif text-h2 text-heading">El orden empieza aquí</h1>
          <p className="font-sans text-body-lg text-primary-400">
            30 días para explorar Datil sin compromisos. Sin tarjeta.
          </p>
        </div>

        <form noValidate onSubmit={onSubmit} className="flex w-[439px] max-w-full flex-col gap-1000">
          <div className="flex flex-col gap-800">
            <Input
              label="Tu Nombre"
              placeholder="Ingresa tu nombre"
              autoComplete="name"
              error={errors.name?.message}
              {...registerField('name')}
            />
            <Input
              label="Nombre del Negocio"
              placeholder="Ingresa el nombre de tu negocio"
              autoComplete="organization"
              error={errors.businessName?.message}
              {...registerField('businessName')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Ingresa tu email"
              autoComplete="email"
              error={errors.email?.message}
              {...registerField('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa una contraseña"
              autoComplete="new-password"
              error={errors.password?.message}
              {...registerField('password')}
            />
          </div>

          <div className="flex flex-col gap-800">
            <div className="flex flex-col items-stretch gap-400">
              <p className="text-center font-sans text-caption text-primary-400">
                Al crear tu cuenta aceptas los{' '}
                <Link to="/terminos" className="text-heading underline">
                  Términos de uso y la Política de Privacidad.
                </Link>
              </p>
              {errors.root?.message && (
                <p className="text-center font-sans text-body-sm font-medium text-error">
                  {errors.root.message}
                </p>
              )}
              <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
                Crear Cuenta
              </Button>
            </div>

            <div className="flex flex-col items-stretch gap-400">
              <p className="text-center font-sans text-body text-body-emphasis">
                ¿Ya tienes cuenta?
              </p>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
