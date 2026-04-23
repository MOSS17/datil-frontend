import { ChevronDown } from 'lucide-react';

export function CountryCodeBox() {
  return (
    <div className="flex shrink-0 items-center gap-200 rounded-md border border-default bg-surface px-300 py-300 font-sans text-body-sm text-body-emphasis">
      <span>+52</span>
      <ChevronDown size={14} strokeWidth={1.75} aria-hidden className="text-muted" />
    </div>
  );
}
