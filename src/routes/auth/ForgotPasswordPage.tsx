import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPassword } from '@/api/hooks/useAuth';
import { ApiError } from '@/api/client';
import { AuthLayout } from './components/AuthLayout';
import { AuthBackLink } from './components/AuthBackLink';

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Por favor, ingresa tu email')
    .email('Ingresa un email válido'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgot.mutateAsync(values);
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No pudimos enviar el enlace. Inténtalo de nuevo.';
      setError('email', { message });
    }
  });

  return (
    <AuthLayout>
      <div className="flex flex-col items-center gap-1300">
        <div className="flex flex-col items-start gap-800">
          <AuthBackLink to="/login" />
          <div className="flex w-full flex-col items-center gap-800 text-center">
            <h1 className="whitespace-nowrap font-serif text-h2 text-heading">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="max-w-[434px] font-sans text-body-lg text-primary-400">
              Escribe tu correo y te enviamos un enlace para crear una nueva.
            </p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex w-[439px] max-w-full flex-col gap-1000"
        >
          <Input
            label="Email"
            type="email"
            placeholder="Ingresa tu email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col items-stretch gap-600">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSubmitting}
              disabled={submitted}
            >
              Enviar Enlace
            </Button>
            {submitted && (
              <p
                role="status"
                className="text-center font-sans text-body text-primary-400"
              >
                Listo! Si ese correo está registrado, te llegará un enlace en unos
                minutos. Revisa también tu carpeta de spam.
              </p>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
