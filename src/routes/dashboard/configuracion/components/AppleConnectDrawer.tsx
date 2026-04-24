import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useConnectApple } from '@/api/hooks/useCalendar';
import { applyApiErrors } from '@/api/formErrors';
import { ApiError } from '@/api/client';
import type { CalendarIntegration } from '@/api/types/calendar';

const schema = z.object({
  email: z.string().trim().email('Ingresa un correo válido'),
  app_password: z.string().min(1, 'Ingresa la contraseña'),
});

type FormValues = z.infer<typeof schema>;

interface AppleConnectDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (integration: CalendarIntegration) => void;
}

export function AppleConnectDrawer({ open, onClose, onSuccess }: AppleConnectDrawerProps) {
  const connect = useConnectApple();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', app_password: '' },
  });

  useEffect(() => {
    if (!open) reset({ email: '', app_password: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const integration = await connect.mutateAsync(values);
      onSuccess(integration);
    } catch (err) {
      const applied = applyApiErrors(err, setError);
      if (applied) return;
      if (err instanceof ApiError && err.status === 401) {
        setError('app_password', { message: err.message });
        return;
      }
      const fallback =
        err instanceof ApiError && err.message
          ? err.message
          : 'No pudimos conectar tu cuenta. Inténtalo de nuevo.';
      setError('app_password', { message: fallback });
    }
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Conectar Apple Calendar"
      ariaLabel="Conectar Apple Calendar"
      footer={
        <div className="flex items-center justify-end gap-300">
          <Button type="button" variant="ghost" onClick={onClose} disabled={connect.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="apple-connect-form" isLoading={connect.isPending}>
            Conectar
          </Button>
        </div>
      }
    >
      <form id="apple-connect-form" onSubmit={onSubmit} className="flex flex-col gap-500">
        <Input
          label="Apple ID"
          type="email"
          autoComplete="username"
          placeholder="tu@icloud.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Contraseña específica de la app"
          type="password"
          autoComplete="current-password"
          placeholder="xxxx-xxxx-xxxx-xxxx"
          error={errors.app_password?.message}
          {...register('app_password')}
        />
        <p className="font-sans text-caption text-muted">
          Apple no permite conectar con tu contraseña normal. Genera una contraseña
          específica de la app en{' '}
          <a
            href="https://appleid.apple.com/account/manage"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline"
          >
            appleid.apple.com
          </a>{' '}
          (sección Seguridad → Contraseñas específicas de la app) y pégala aquí.
        </p>
      </form>
    </Drawer>
  );
}
