import {
  Apple,
  Calendar as CalendarIcon,
  Check,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useCalendarIntegrations,
  useConnectCalendar,
  useDisconnectCalendar,
} from '@/api/hooks/useCalendar';
import { CALENDAR_PROVIDER, type CalendarProvider } from '@/lib/constants';
import type { CalendarIntegration } from '@/api/types/calendar';

interface ProviderMeta {
  provider: CalendarProvider;
  label: string;
  Icon: typeof CalendarIcon;
  iconClass: string;
  tileClass: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    provider: CALENDAR_PROVIDER.GOOGLE,
    label: 'Google Calendar',
    Icon: CalendarIcon,
    iconClass: 'text-icon-accent',
    tileClass: 'bg-surface-accent-subtle',
  },
  {
    provider: CALENDAR_PROVIDER.APPLE,
    label: 'Apple Calendar',
    Icon: Apple,
    iconClass: 'text-icon-primary',
    tileClass: 'bg-surface-secondary',
  },
];

interface ProviderRowProps {
  meta: ProviderMeta;
  integration: CalendarIntegration | undefined;
  onConnect: (provider: CalendarProvider) => void;
  onDisconnect: (id: string) => void;
  isPending: boolean;
}

function ProviderRow({
  meta,
  integration,
  onConnect,
  onDisconnect,
  isPending,
}: ProviderRowProps) {
  const { label, Icon, iconClass, tileClass, provider } = meta;
  const isConnected = Boolean(integration);
  const subtitle = isConnected
    ? (integration?.account_email ?? 'Conectado')
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
        onClick={() =>
          isConnected && integration ? onDisconnect(integration.id) : onConnect(provider)
        }
      >
        {isConnected ? 'Desconectar' : 'Conectar'}
      </Button>
    </div>
  );
}

export function CalendarIntegrationCard() {
  const { data, isLoading, error, refetch } = useCalendarIntegrations();
  const connect = useConnectCalendar();
  const disconnect = useDisconnectCalendar();

  return (
    <Card>
      <div className="flex flex-col gap-600">
        <div className="flex flex-col gap-100">
          <h2 className="font-serif text-h6 text-heading">Integración de Calendario</h2>
          <p className="font-sans text-body-sm text-muted">
            Sincroniza tus reservas con calendarios externos.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-600">
            <Skeleton className="h-1100" />
            <Skeleton className="h-1100" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-start gap-300">
            <p className="font-sans text-body-sm text-error">
              No se pudieron cargar las integraciones.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-600">
            {PROVIDERS.map((meta, index) => {
              const integration = data?.find((item) => item.provider === meta.provider);
              const pendingThisRow =
                (connect.isPending && connect.variables === meta.provider) ||
                (disconnect.isPending &&
                  integration !== undefined &&
                  disconnect.variables === integration.id);

              return (
                <div key={meta.provider} className="flex flex-col gap-600">
                  {index > 0 && <hr className="border-t border-subtle" aria-hidden />}
                  <ProviderRow
                    meta={meta}
                    integration={integration}
                    onConnect={(provider) => connect.mutate(provider)}
                    onDisconnect={(id) => disconnect.mutate(id)}
                    isPending={pendingThisRow}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
