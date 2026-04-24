import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Apple,
  Calendar as CalendarIcon,
  Check,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import {
  useConnectGoogle,
  useDisconnectCalendar,
} from '@/api/hooks/useCalendar';
import { ApiError } from '@/api/client';
import { CALENDAR_PROVIDER, type CalendarProvider } from '@/lib/constants';
import type { CalendarIntegration } from '@/api/types/calendar';
import { AppleConnectDrawer } from './AppleConnectDrawer';

interface ProviderMeta {
  provider: CalendarProvider;
  label: string;
  Icon: typeof CalendarIcon;
  iconClass: string;
  tileClass: string;
  comingSoon?: boolean;
}

const PROVIDERS: ProviderMeta[] = [
  {
    provider: CALENDAR_PROVIDER.GOOGLE,
    label: 'Google Calendar',
    Icon: CalendarIcon,
    iconClass: 'text-icon-accent',
    tileClass: 'bg-surface-accent-subtle',
    comingSoon: true,
  },
  {
    provider: CALENDAR_PROVIDER.APPLE,
    label: 'Apple Calendar',
    Icon: Apple,
    iconClass: 'text-icon-primary',
    tileClass: 'bg-surface-secondary',
  },
];

interface ConnectionState {
  account_email?: string;
}

const STORAGE_PREFIX = 'datil:calendar:';

function readConnection(provider: CalendarProvider): ConnectionState | null {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConnectionState;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return null;
  }
}

function writeConnection(provider: CalendarProvider, state: ConnectionState) {
  window.localStorage.setItem(`${STORAGE_PREFIX}${provider}`, JSON.stringify(state));
}

function clearConnection(provider: CalendarProvider) {
  window.localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
}

const PROVIDER_LABEL: Record<CalendarProvider, string> = {
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
  const name = provider && PROVIDER_LABEL[provider as CalendarProvider];
  return name
    ? `No pudimos conectar ${name} Calendar. Inténtalo de nuevo.`
    : 'No pudimos completar la conexión. Inténtalo de nuevo.';
}

interface ProviderRowProps {
  meta: ProviderMeta;
  connection: ConnectionState | null;
  onConnect: (provider: CalendarProvider) => void;
  onDisconnect: (provider: CalendarProvider) => void;
  isPending: boolean;
}

function ProviderRow({
  meta,
  connection,
  onConnect,
  onDisconnect,
  isPending,
}: ProviderRowProps) {
  const { label, Icon, iconClass, tileClass, provider, comingSoon } = meta;
  const isConnected = connection !== null;
  const hideConnect = Boolean(comingSoon) && !isConnected;
  const subtitle = isConnected
    ? (connection?.account_email ?? 'Conectado')
    : comingSoon
      ? 'Próximamente'
      : 'No Conectado';

  return (
    <div className="flex items-center justify-between gap-400">
      <div className="flex min-w-0 items-center gap-400">
        <span
          aria-hidden
          className={`flex h-1100 w-1100 shrink-0 items-center justify-center rounded-lg ${tileClass}`}
        >
          <Icon size={24} strokeWidth={1.75} className={iconClass} />
        </span>
        <div className="flex min-w-0 flex-col gap-100">
          <span className="flex items-center gap-100 font-sans text-body font-medium text-body-emphasis">
            {label}
            {isConnected && (
              <Check
                aria-label="Conectado"
                size={16}
                strokeWidth={2.25}
                className="text-icon-success"
              />
            )}
          </span>
          <span className="truncate font-sans text-caption font-medium text-muted">
            {subtitle}
          </span>
        </div>
      </div>
      {!hideConnect && (
        <Button
          variant="secondary"
          size="md"
          leftIcon={
            isConnected ? (
              <Unlink aria-hidden size={16} strokeWidth={1.75} />
            ) : (
              <LinkIcon aria-hidden size={16} strokeWidth={1.75} />
            )
          }
          isLoading={isPending}
          onClick={() => (isConnected ? onDisconnect(provider) : onConnect(provider))}
        >
          {isConnected ? 'Desconectar' : 'Conectar'}
        </Button>
      )}
    </div>
  );
}

export function CalendarIntegrationCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [google, setGoogle] = useState<ConnectionState | null>(() =>
    readConnection(CALENDAR_PROVIDER.GOOGLE),
  );
  const [apple, setApple] = useState<ConnectionState | null>(() =>
    readConnection(CALENDAR_PROVIDER.APPLE),
  );
  const [appleDrawerOpen, setAppleDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [pendingProvider, setPendingProvider] = useState<CalendarProvider | null>(null);

  const connectGoogle = useConnectGoogle();
  const disconnect = useDisconnectCalendar();

  const setConnected = useCallback(
    (provider: CalendarProvider, state: ConnectionState) => {
      writeConnection(provider, state);
      if (provider === CALENDAR_PROVIDER.GOOGLE) setGoogle(state);
      else setApple(state);
    },
    [],
  );

  const setDisconnected = useCallback((provider: CalendarProvider) => {
    clearConnection(provider);
    if (provider === CALENDAR_PROVIDER.GOOGLE) setGoogle(null);
    else setApple(null);
  }, []);

  // Handle the OAuth callback's ?connected / ?error query params on mount.
  useEffect(() => {
    const connected = searchParams.get('connected');
    const errorCode = searchParams.get('error');
    const provider = searchParams.get('provider');
    if (!connected && !errorCode) return;

    if (connected === CALENDAR_PROVIDER.GOOGLE || connected === CALENDAR_PROVIDER.APPLE) {
      setConnected(connected, readConnection(connected) ?? {});
      setToast({
        message: `${PROVIDER_LABEL[connected]} Calendar conectado`,
        variant: 'success',
      });
    } else if (errorCode) {
      setToast({ message: errorMessage(errorCode, provider), variant: 'error' });
    }

    const next = new URLSearchParams(searchParams);
    next.delete('connected');
    next.delete('error');
    next.delete('provider');
    setSearchParams(next, { replace: true });
    // Only fire on first mount; subsequent setSearchParams updates would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = (provider: CalendarProvider) => {
    if (provider === CALENDAR_PROVIDER.APPLE) {
      setAppleDrawerOpen(true);
      return;
    }
    setPendingProvider(provider);
    connectGoogle.mutate(undefined, {
      onError: (err) => {
        setPendingProvider(null);
        const msg =
          err instanceof ApiError && err.status === 503
            ? 'Google Calendar no está configurado en este servidor.'
            : err instanceof ApiError && err.message
              ? err.message
              : 'No pudimos iniciar la conexión con Google. Inténtalo de nuevo.';
        setToast({ message: msg, variant: 'error' });
      },
      // onSuccess: the hook itself does window.location.assign, so we never
      // unmount cleanly; no need to clear pendingProvider here.
    });
  };

  const handleDisconnect = (provider: CalendarProvider) => {
    setPendingProvider(provider);
    disconnect.mutate(provider, {
      onSuccess: () => {
        setPendingProvider(null);
        setDisconnected(provider);
        setToast({
          message: `${PROVIDER_LABEL[provider]} Calendar desconectado`,
          variant: 'success',
        });
      },
      onError: (err) => {
        setPendingProvider(null);
        // 404 = backend says it wasn't connected; treat as already-disconnected.
        if (err instanceof ApiError && err.status === 404) {
          setDisconnected(provider);
          setToast({
            message: `${PROVIDER_LABEL[provider]} Calendar desconectado`,
            variant: 'success',
          });
          return;
        }
        const msg =
          err instanceof ApiError && err.message
            ? err.message
            : 'No pudimos desconectar la cuenta. Inténtalo de nuevo.';
        setToast({ message: msg, variant: 'error' });
      },
    });
  };

  const handleAppleSuccess = (integration: CalendarIntegration) => {
    setAppleDrawerOpen(false);
    setConnected(CALENDAR_PROVIDER.APPLE, {
      account_email: integration.account_email,
    });
    setToast({ message: 'Apple Calendar conectado', variant: 'success' });
  };

  return (
    <>
      <Card>
        <div className="flex flex-col gap-600">
          <div className="flex flex-col gap-100">
            <h2 className="font-serif text-h6 text-heading">Integración de Calendario</h2>
            <p className="font-sans text-body-sm text-muted">
              Sincroniza tus reservas con calendarios externos.
            </p>
          </div>

          <div className="flex flex-col gap-600">
            {PROVIDERS.map((meta, index) => {
              const connection =
                meta.provider === CALENDAR_PROVIDER.GOOGLE ? google : apple;
              return (
                <div key={meta.provider} className="flex flex-col gap-600">
                  {index > 0 && <hr className="border-t border-subtle" aria-hidden />}
                  <ProviderRow
                    meta={meta}
                    connection={connection}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    isPending={pendingProvider === meta.provider}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <AppleConnectDrawer
        open={appleDrawerOpen}
        onClose={() => setAppleDrawerOpen(false)}
        onSuccess={handleAppleSuccess}
      />

      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        onClose={() => setToast(null)}
      />
    </>
  );
}
