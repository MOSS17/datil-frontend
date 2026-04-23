interface BusinessHeroProps {
  name: string;
  description?: string;
  location?: string;
  logoUrl?: string;
}

export function BusinessHero({ name, description, location, logoUrl }: BusinessHeroProps) {
  return (
    <section className="flex flex-col items-center gap-600 px-600 py-800 md:px-1200">
      <div className="h-[98px] w-[98px] overflow-hidden rounded-md bg-surface-brand-subtle">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col items-center gap-200">
        <h1 className="text-center font-serif text-h4-mobile text-heading md:text-h4">
          {name}
        </h1>
        {(description || location) && (
          <p className="text-center font-sans text-body text-muted">
            {description}
            {description && location ? ' | ' : ''}
            {location ? <span className="inline-flex items-center gap-100">📍 {location}</span> : null}
          </p>
        )}
      </div>
      <p className="font-sans text-body font-medium text-body-emphasis">
        – Reserva una Cita –
      </p>
    </section>
  );
}
