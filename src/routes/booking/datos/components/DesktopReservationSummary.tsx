import { formatPrice, formatDuration } from '@/lib/formatters';
import type { DetailsSelection } from '../../schedule/components/DetailsSheet';

interface DesktopReservationSummaryProps {
  selections: DetailsSelection[];
  dateLine?: string;
  timeLine?: string;
  location?: string | null;
  totalPrice: number;
}

export function DesktopReservationSummary({
  selections,
  dateLine,
  timeLine,
  location,
  totalPrice,
}: DesktopReservationSummaryProps) {
  return (
    <div className="flex w-full flex-col gap-600">
      <h2 className="font-serif text-h5 text-heading">Resumen de la Reserva</h2>
      <div className="flex flex-col gap-400 rounded-md border border-default bg-surface px-500 py-400">
        <section className="flex flex-col gap-300">
          <h3 className="font-sans text-body-sm font-medium text-muted">Servicios</h3>
          <ul className="flex flex-col gap-200">
            {selections.map((sel) => (
              <li key={sel.id} className="flex flex-col gap-200">
                <div className="flex flex-wrap items-center gap-300">
                  <p className="font-sans text-body font-medium text-body-emphasis">
                    {sel.service.name}
                  </p>
                  <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
                  <p className="font-sans text-body text-success">
                    + {formatPrice(sel.service.min_price)}
                  </p>
                  <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
                  <p className="font-sans text-body text-body-emphasis">
                    {formatDuration(sel.service.duration_minutes)}
                  </p>
                </div>
                {sel.extras.map((extra) => (
                  <div key={extra.id} className="flex flex-wrap items-center gap-300">
                    <p className="font-sans text-body font-medium text-body-emphasis">
                      {extra.name}
                    </p>
                    <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
                    <p className="font-sans text-body text-success">
                      + {formatPrice(extra.min_price)}
                    </p>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </section>
        {dateLine || timeLine ? (
          <section className="flex flex-col gap-300 border-t border-default pt-400">
            <h3 className="font-sans text-body-sm font-medium text-muted">Fecha y Hora</h3>
            {dateLine ? (
              <p className="font-sans text-body font-medium text-body-emphasis">{dateLine}</p>
            ) : null}
            {timeLine ? (
              <p className="font-sans text-body font-medium text-body-emphasis">{timeLine}</p>
            ) : null}
          </section>
        ) : null}
        {location ? (
          <section className="flex flex-col gap-300 border-t border-default pt-400">
            <h3 className="font-sans text-body-sm font-medium text-muted">Lugar</h3>
            <p className="font-sans text-body font-medium text-body-emphasis">{location}</p>
          </section>
        ) : null}
        <div className="flex items-center justify-between border-t border-default pt-400">
          <p className="font-sans text-body-lg font-semibold text-body-emphasis">Total</p>
          <p className="font-serif text-h5 font-semibold text-body-emphasis">
            {formatPrice(totalPrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
