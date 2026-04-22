import type { Category } from '@/api/types/categories';
import { Select } from '@/components/ui/Select';

interface CategoryFilterProps {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
}

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  return (
    <Select
      fullWidth={false}
      containerClassName="w-full md:w-[288px]"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      options={[
        { value: '', label: 'Todos' },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
      ]}
    />
  );
}
