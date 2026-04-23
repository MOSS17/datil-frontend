import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext';
import { ApiError } from '@/api/client';
import { useVerifyEmail, useResendCode } from '@/api/hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';
import { OtpInput } from './components/OtpInput';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const navigate = useNavigate();
  const { login } = useAuth();
  const verifyEmail = useVerifyEmail();
  const resendCode = useResendCode();

  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) setErrorMessage(null);
    if (resendNotice) setResendNotice(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (!email) {
    return <Navigate to="/registro" replace />;
  }

  const handleComplete = async (fullCode: string) => {
    try {
      const response = await verifyEmail.mutateAsync({ email, code: fullCode });
      login(response.token, response.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'El código no es válido. Inténtalo de nuevo.';
      setErrorMessage(message);
      setCode('');
    }
  };

  const handleResend = async () => {
    try {
      await resendCode.mutateAsync({ email });
      setResendNotice('Te enviamos un nuevo código.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No pudimos reenviar el código. Inténtalo de nuevo.';
      setErrorMessage(message);
    }
  };

  return (
    <AuthLayout>
      <div className="flex w-full max-w-[439px] flex-col items-center gap-1300">
        <div className="flex flex-col items-center gap-800 text-center">
          <h1 className="font-serif text-h2 text-heading">Verifica tu cuenta</h1>
          <p className="font-sans text-body-lg text-primary-400">
            Escribe el código que hemos enviado a{' '}
            <span className="font-medium text-body-emphasis">{email}</span> para
            confirmar tu cuenta.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-400">
          <OtpInput
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={verifyEmail.isPending}
            error={Boolean(errorMessage)}
          />
          {errorMessage && (
            <p className="text-center font-sans text-body-sm font-medium text-error">
              {errorMessage}
            </p>
          )}
          {resendNotice && !errorMessage && (
            <p className="text-center font-sans text-body-sm text-success">
              {resendNotice}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col items-stretch gap-400">
          <p className="text-center font-sans text-body text-body-emphasis">
            ¿No lo recibiste?
          </p>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            isLoading={resendCode.isPending}
            onClick={handleResend}
          >
            Reenviar Código
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
