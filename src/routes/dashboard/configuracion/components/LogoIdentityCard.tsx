import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useUploadBusinessLogo } from '@/api/hooks/useBusiness';
import type { Business } from '@/api/types/business';
import type { ConfiguracionFormValues } from '../schema';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPTED_LOGO_MIME = ['image/png', 'image/jpeg', 'image/svg+xml'];

interface LogoIdentityCardProps {
  business: Business;
}

export function LogoIdentityCard({ business }: LogoIdentityCardProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ConfiguracionFormValues>();
  const uploadLogo = useUploadBusinessLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const handleFilePick = () => {
    setLogoError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_LOGO_MIME.includes(file.type)) {
      setLogoError('Formato no soportado. Usa PNG, JPG o SVG.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError('El archivo supera 2 MB.');
      return;
    }

    try {
      await uploadLogo.mutateAsync({ id: business.id, file });
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'No se pudo subir el logo');
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-600">
        <h2 className="font-serif text-h6 text-heading">Logo e Identidad</h2>

        <div className="flex items-start gap-600">
          <div
            aria-hidden
            className="flex h-1400 w-1400 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-brand-subtle"
          >
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={24} className="text-icon-secondary-subtle" />
            )}
          </div>
          <div className="flex flex-col gap-200">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Upload aria-hidden size={14} strokeWidth={1.75} />}
              onClick={handleFilePick}
              isLoading={uploadLogo.isPending}
            >
              Subir Logo
            </Button>
            <p className="font-sans text-caption text-muted">PNG, JPG o SVG. Máx 2MB.</p>
            {logoError && (
              <p role="alert" className="font-sans text-caption text-error">
                {logoError}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_LOGO_MIME.join(',')}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Input
          label="Nombre  del Negocio"
          placeholder="Lupita Urias Makeup Artist"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="URL de Página de Citas"
          leftAddon={<span>datil.app/</span>}
          placeholder="lupita-urias"
          error={errors.slug?.message}
          {...register('slug')}
        />
      </div>
    </Card>
  );
}
