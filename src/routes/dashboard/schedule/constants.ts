export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

function generateTimeOptions() {
  const options: { value: string; label: string }[] = [];
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const label = `${hour12}:${String(m).padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

export const TIME_OPTIONS = generateTimeOptions();
