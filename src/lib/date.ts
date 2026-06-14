export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const WEEKDAYS_LONG = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

/** Devuelve YYYY-MM-DD en horario local */
export function isoDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 1 = lunes ... 7 = domingo */
export function weekdayOf(d = new Date()): number {
  const js = d.getDay(); // 0=domingo
  return js === 0 ? 7 : js;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function prettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function shortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}/${m}`;
}

/** Lunes de la semana actual */
export function startOfWeek(d = new Date()): Date {
  const wd = weekdayOf(d);
  return addDays(d, -(wd - 1));
}
