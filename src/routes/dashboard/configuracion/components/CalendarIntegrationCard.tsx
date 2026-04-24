import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Apple,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Info,
  Link as LinkIcon,
  RefreshCw,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import {
  useConnectGoogle,
  useConnectIcs,
  useDisconnectGoogle,
  useDisconnectIcs,
  useIcsConnection,
  useRotateIcsToken,
} from '@/api/hooks/useCalendar';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';

type Provider = 'google' | 'apple';

const PROVIDER_LABEL: Record<Provider, string> = {
  google: 'Google',
  apple: 'Apple',
};

const ERROR_COPY: Record<string, string> = {
  access_denied: 'Cancelaste la conexión.',
  invalid_state: 'La sesión de autorización expiró. Inténtalo de nuevo.',
  invalid_grant: 'No pudimos completar la autorización. Inténtalo de nuevo.',
  exchange_failed: 'No pudimos completar la autorización. Inténtalo de nuevo.',
  not_configured: 'Google Calendar no está configurado en este servidor.',
};

function errorMessage(code: string, provider: string | null): string {
  const friendly = ERROR_COPY[code];
  if (friendly) return friendly;
  const name = provider && PROVIDER_LABEL[provider as Provider];
  return name
    ? `No pudimos conectar ${name} Calendar. Inténtalo de nuevo.`
    : 'No pudimos completar la conexión. Inténtalo de nuevo.';
}

interface ToastState {
  message: string;
  variant: ToastVariant;
}

export function CalendarIntegrationCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);

  const showToast = useCallback(
    (message: string, variant: ToastVariant) => setToast({ message, variant }),
    [],
  );

  // Handle the OAuth callback's ?connected / ?error query params on mount.
  useEffect(() => {
    const connected = searchParams.get('connected');
    const errorCode = searchParams.get('error');
    const provider = searchParams.get('provider');
    if (!connected && !errorCode) return;

    if (connected === 'google') {
      setGoogleConnected(true);
      showToast('Google Calendar conectado', 'success');
    } else if (errorCode) {
      showToast(errorMessage(errorCode, provider), 'error');
    }

    const next = new URLSearchParams(searchParams);
    next.delete('connected');
    next.delete('error');
    next.delete('provider');
    setSearchParams(next, { replace: true });
    // Mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card>
        <div className="flex flex-col gap-700">
          <div className="flex flex-col gap-100">
            <h2 className="font-serif text-h6 text-heading">Integración de Calendario</h2>
            <p className="font-sans text-body-sm text-muted">
              Sincroniza tus reservas con calendarios externos.
            </p>
          </div>

          <GoogleProvider
            connected={googleConnected}
            onDisconnected={() => setGoogleConnected(false)}
            showToast={showToast}
          />
          <hr className="border-t border-subtle" aria-hidden />
          <AppleProvider showToast={showToast} />
        </div>
      </Card>

      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        onClose={() => setToast(null)}
      />
    </>
  );
}

// ── Google ────────────────────────────────────────────────────────────────

interface GoogleProviderProps {
  connected: boolean;
  onDisconnected: () => void;
  showToast: (message: string, variant: ToastVariant) => void;
}

function GoogleProvider({
  connected,
  onDisconnected,
  showToast,
}: GoogleProviderProps) {
  const connect = useConnectGoogle();
  const disconnect = useDisconnectGoogle();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConnect = () => {
    connect.mutate(undefined, {
      onError: (err) => {
        const msg =
          err instanceof ApiError && err.status === 503
            ? 'Google Calendar no está configurado en este servidor. Contacta al administrador.'
            : err instanceof ApiError && err.message
              ? err.message
              : 'No pudimos iniciar la conexión con Google. Inténtalo de nuevo.';
        showToast(msg, 'error');
      },
    });
  };

  const handleConfirmDisconnect = () => {
    disconnect.mutate(undefined, {
      onSuccess: () => {
        setConfirmOpen(false);
        onDisconnected();
        showToast('Google Calendar desconectado', 'success');
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 404) {
          setConfirmOpen(false);
          onDisconnected();
          showToast('Google Calendar desconectado', 'success');
          return;
        }
        const msg =
          err instanceof ApiError && err.message
            ? err.message
            : 'No pudimos desconectar la cuenta. Inténtalo de nuevo.';
        showToast(msg, 'error');
      },
    });
  };

  return (
    <>
      <ProviderHeader
        Icon={CalendarIcon}
        iconClass="text-icon-accent"
        tileClass="bg-surface-accent-subtle"
        label="Google Calendar"
        connected={connected}
        action={
          connected ? (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Unlink aria-hidden size={16} strokeWidth={1.75} />}
              onClick={() => setConfirmOpen(true)}
            >
              Desconectar
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<LinkIcon aria-hidden size={16} strokeWidth={1.75} />}
              isLoading={connect.isPending}
              onClick={handleConnect}
            >
              Conectar
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDisconnect}
        title="¿Desconectar Google Calendar?"
        description="Tus citas dejarán de sincronizarse con Google Calendar. Las citas ya creadas en Google se quedan ahí."
        confirmLabel="Desconectar"
        tone="danger"
        isLoading={disconnect.isPending}
      />
    </>
  );
}

// ── Apple (ICS subscription) ──────────────────────────────────────────────

interface AppleProviderProps {
  showToast: (message: string, variant: ToastVariant) => void;
}

function AppleProvider({ showToast }: AppleProviderProps) {
  const { data: connection } = useIcsConnection();
  const connect = useConnectIcs();
  const rotate = useRotateIcsToken();
  const disconnect = useDisconnectIcs();

  const [moreOpen, setMoreOpen] = useState(false);
  const [rotateConfirm, setRotateConfirm] = useState(false);
  const [disconnectConfirm, setDisconnectConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    connect.mutate(undefined, {
      onError: (err) => {
        const msg =
          err instanceof ApiError && err.message
            ? err.message
            : 'No pudimos crear el enlace. Inténtalo de nuevo.';
        showToast(msg, 'error');
      },
      // onSuccess: hook navigates to webcal:// URL — no-op here.
    });
  };

  const handleOpenInApple = () => {
    if (!connection) return;
    window.location.href = connection.webcal_url;
  };

  const handleCopy = async () => {
    if (!connection) return;
    try {
      await navigator.clipboard.writeText(connection.https_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('No pudimos copiar el enlace.', 'error');
    }
  };

  const handleConfirmRotate = () => {
    rotate.mutate(undefined, {
      onSuccess: () => {
        setRotateConfirm(false);
        showToast('Enlace regenerado. Vuelve a conectar Apple Calendar.', 'success');
      },
      onError: (err) => {
        const msg =
          err instanceof ApiError && err.message
            ? err.message
            : 'No pudimos regenerar el enlace. Inténtalo de nuevo.';
        showToast(msg, 'error');
      },
    });
  };

  const handleConfirmDisconnect = () => {
    disconnect.mutate(undefined, {
      onSuccess: () => {
        setDisconnectConfirm(false);
        setMoreOpen(false);
        showToast('Apple Calendar desconectado', 'success');
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 404) {
          setDisconnectConfirm(false);
          setMoreOpen(false);
          showToast('Apple Calendar desconectado', 'success');
          return;
        }
        const msg =
          err instanceof ApiError && err.message
            ? err.message
            : 'No pudimos desconectar Apple Calendar. Inténtalo de nuevo.';
        showToast(msg, 'error');
      },
    });
  };

  if (!connection) {
    return (
      <div className="flex flex-col gap-500">
        <ProviderHeader
          Icon={Apple}
          iconClass="text-icon-primary"
          tileClass="bg-surface-secondary"
          label="Apple Calendar"
          connected={false}
          action={
            <Button
              variant="secondary"
              size="md"
              leftIcon={<LinkIcon aria-hidden size={16} strokeWidth={1.75} />}
              isLoading={connect.isPending}
              onClick={handleConnect}
            >
              Conectar Apple Calendar
            </Button>
          }
        />
        <p className="font-sans text-body-sm text-muted">
          Añade tus citas de Dátil a tu calendario de Apple automáticamente.
          Funciona en iPhone, iPad y Mac.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-500">
      <ProviderHeader
        Icon={Apple}
        iconClass="text-icon-primary"
        tileClass="bg-surface-secondary"
        label="Apple Calendar"
        connected
        action={
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ExternalLink aria-hidden size={16} strokeWidth={1.75} />}
            onClick={handleOpenInApple}
          >
            Abrir en Apple Calendar
          </Button>
        }
      />

      <button
        type="button"
        onClick={() => setMoreOpen((v) => !v)}
        aria-expanded={moreOpen}
        className="flex items-center gap-200 self-start font-sans text-body-sm font-medium text-primary"
      >
        <ChevronDown
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className={cn('transition-transform', moreOpen && 'rotate-180')}
        />
        Más opciones
      </button>

      {moreOpen && (
        <div className="flex flex-col gap-500">
          <div className="flex flex-col gap-200">
            <label
              htmlFor="ics-https-url"
              className="font-sans text-body-sm font-medium text-body-emphasis"
            >
              Enlace HTTPS (para Outlook, Fastmail, Google Calendar, etc.)
            </label>
            <div className="flex items-stretch overflow-hidden rounded-md border border-default bg-surface">
              <input
                id="ics-https-url"
                type="text"
                readOnly
                value={connection.https_url}
                onFocus={(e) => e.target.select()}
                className="w-full bg-transparent px-300 py-300 font-mono text-body-sm text-body-emphasis focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-200 border-l border-default bg-surface-secondary-subtle px-400 font-sans text-body-sm font-medium text-primary hover:bg-surface-secondary"
              >
                {copied ? (
                  <>
                    <Check aria-hidden size={16} strokeWidth={1.75} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy aria-hidden size={16} strokeWidth={1.75} />
                    Copiar enlace
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-300">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<RefreshCw aria-hidden size={16} strokeWidth={1.75} />}
              onClick={() => setRotateConfirm(true)}
            >
              Regenerar enlace
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Unlink aria-hidden size={16} strokeWidth={1.75} />}
              onClick={() => setDisconnectConfirm(true)}
            >
              Desconectar
            </Button>
          </div>

          <div className="flex items-start gap-300 rounded-md bg-surface-secondary-subtle p-400">
            <Info
              aria-hidden
              size={16}
              strokeWidth={1.75}
              className="mt-px shrink-0 text-icon"
            />
            <p className="font-sans text-caption text-muted">
              Las citas pueden tardar hasta 1 hora en aparecer. Para
              actualizaciones más rápidas, cambia la frecuencia de actualización
              en los ajustes de la suscripción en Apple Calendar.
            </p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={rotateConfirm}
        onClose={() => setRotateConfirm(false)}
        onConfirm={handleConfirmRotate}
        title="¿Regenerar el enlace?"
        description="Tu Apple Calendar dejará de actualizarse hasta que vuelvas a conectar con el nuevo enlace."
        confirmLabel="Regenerar"
        tone="danger"
        isLoading={rotate.isPending}
      />

      <ConfirmDialog
        open={disconnectConfirm}
        onClose={() => setDisconnectConfirm(false)}
        onConfirm={handleConfirmDisconnect}
        title="¿Desconectar Apple Calendar?"
        description="El enlace dejará de funcionar y tus citas dejarán de aparecer en Apple Calendar."
        confirmLabel="Desconectar"
        tone="danger"
        isLoading={disconnect.isPending}
      />
    </div>
  );
}

// ── Shared row header ─────────────────────────────────────────────────────

interface ProviderHeaderProps {
  Icon: typeof CalendarIcon;
  iconClass: string;
  tileClass: string;
  label: string;
  connected: boolean;
  action?: React.ReactNode;
}

function ProviderHeader({
  Icon,
  iconClass,
  tileClass,
  label,
  connected,
  action,
}: ProviderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-400">
      <div className="flex min-w-0 items-center gap-400">
        <span
          aria-hidden
          className={cn(
            'flex h-1100 w-1100 shrink-0 items-center justify-center rounded-lg',
            tileClass,
          )}
        >
          <Icon size={24} strokeWidth={1.75} className={iconClass} />
        </span>
        <div className="flex min-w-0 flex-col gap-100">
          <span className="flex items-center gap-100 font-sans text-body font-medium text-body-emphasis">
            {label}
            {connected && (
              <Check
                aria-label="Conectado"
                size={16}
                strokeWidth={2.25}
                className="text-icon-success"
              />
            )}
          </span>
          <span className="truncate font-sans text-caption font-medium text-muted">
            {connected ? 'Conectado' : 'No conectado'}
          </span>
        </div>
      </div>
      {action}
    </div>
  );
}
