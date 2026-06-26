import type { Exercise, LoadType, WorkoutDay, WorkoutPlan, WorkoutSession } from '../types';
import { isoDate, shortDate, startOfWeek } from './date';

export function dayForWeekday(plan: WorkoutPlan, weekday: number): WorkoutDay | undefined {
  return plan.days.find((d) => d.weekday === weekday);
}

/** Devuelve el plan con los días reasignados por el usuario y ordenados por día de la semana. */
export function effectivePlan(plan: WorkoutPlan, overrides: Record<string, number>): WorkoutPlan {
  const days = plan.days
    .map((d) => ({ ...d, weekday: overrides[d.id] ?? d.weekday }))
    .sort((a, b) => a.weekday - b.weekday);
  return { ...plan, days };
}

/** Duración estimada de una sesión en minutos (calentamiento + series + descansos). */
export function estimatedMinutes(day: WorkoutDay): number {
  return estimatedMinutesForExercises(day.exercises);
}

export function estimatedMinutesForExercises(exercises: Exercise[]): number {
  const WARMUP = 8 * 60;
  const WORK = 45; // seg por serie
  const TRANSITION = 30; // seg de montaje por serie
  let secs = WARMUP;
  for (const ex of exercises) {
    const rest = parseInt(ex.rest) || 60;
    secs += ex.sets * (WORK + TRANSITION + rest);
  }
  return Math.round(secs / 60 / 5) * 5;
}

export function sessionProgress(session?: WorkoutSession): { done: number; total: number; pct: number } {
  if (!session) return { done: 0, total: 0, pct: 0 };
  const logs = Object.values(session.logs);
  const total = logs.length;
  const done = logs.filter((l) => l.done).length;
  return { done, total, pct: total ? done / total : 0 };
}

/**
 * Una sesión está "completada" si el usuario la finalizó explícitamente
 * (`completedAt`) o si tiene todos los ejercicios marcados. Usar `completedAt`
 * evita que, al intercambiar un ejercicio por una alternativa, el entreno
 * quede a medias (p. ej. 6/7) aunque ya lo hayas dado por terminado.
 */
export function isSessionComplete(session?: WorkoutSession): boolean {
  if (!session) return false;
  if (session.completedAt) return true;
  const { total, pct } = sessionProgress(session);
  return total > 0 && pct >= 1;
}

/* ============================ Tipo de carga ============================ */

/**
 * Determina el tipo de carga de un ejercicio. Si está declarado (`ex.load`,
 * como en el catálogo o en los ejercicios creados a mano) se usa tal cual; si
 * no, se infiere por el nombre para los ejercicios de los planes base.
 */
export function loadOf(ex: { name: string; load?: LoadType }): LoadType {
  if (ex.load) return ex.load;
  const n = ex.name.toLowerCase();
  if (/m[aá]quina|prensa|pec-?deck|pec deck|hack|contractor|multipower/.test(n)) return 'maquina';
  if (/curl femoral|extensi[oó]n de cu[aá]driceps|gemelos|abductor|aductor/.test(n)) return 'maquina';
  if (/dominad|fondos|flexion|plancha|colgad|hollow|mountain|sissy|remo invertido|puente de gl|rueda abdominal/.test(n))
    return 'corporal';
  if (/polea|cuerda|cruces|face ?pull|jal[oó]n|crunch en polea/.test(n)) return 'polea';
  if (/barra/.test(n)) return 'barra';
  if (/mancuerna|martillo|arnold/.test(n)) return 'mancuerna';
  if (/elevaciones? (laterales|frontales)|p[aá]jaros|concentrado/.test(n)) return 'mancuerna';
  return 'barra';
}

export const LOAD_LABEL: Record<LoadType, string> = {
  barra: 'Barra',
  mancuerna: 'Mancuerna',
  polea: 'Polea',
  maquina: 'Máquina',
  corporal: 'Peso corporal',
};

/** Cabecera corta de la columna de peso al registrar series. */
export function weightColumnLabel(load: LoadType): string {
  if (load === 'mancuerna') return 'Mancuerna';
  if (load === 'corporal') return 'Lastre';
  return 'Peso (kg)';
}

/** Aclaración de qué peso anotar (vacío cuando es peso total y obvio). */
export function loadHint(load: LoadType): string {
  if (load === 'mancuerna') return 'Anota el peso de una mancuerna (por mano).';
  if (load === 'corporal') return 'Peso extra/lastre; deja 0 si es solo tu peso corporal.';
  return '';
}

/** ¿El peso registrado es por mancuerna (no el total)? */
export function isPerDumbbell(load: LoadType): boolean {
  return load === 'mancuerna';
}

/* ============================ Progreso por ejercicio ============================ */

/** 1RM estimado (fórmula de Epley): combina peso y repeticiones en un número. */
export function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

export interface ProgressPoint {
  /** Clave de orden (fecha o lunes de la semana, en ISO). */
  key: string;
  /** Etiqueta corta para el eje/tabla. */
  label: string;
  /** Mejor peso del periodo. */
  weight: number;
  /** Repeticiones de la mejor serie por peso. */
  reps: number;
  /** Mejor 1RM estimado del periodo. */
  e1rm: number;
  /** Volumen total (Σ peso × reps) del periodo. */
  volume: number;
}

interface SessionAgg {
  date: string;
  weight: number;
  reps: number;
  e1rm: number;
  volume: number;
}

function sessionAggregates(
  sessions: Record<string, WorkoutSession>,
  exId: string
): SessionAgg[] {
  const out: SessionAgg[] = [];
  for (const s of Object.values(sessions)) {
    const log = s.logs[exId];
    if (!log) continue;
    const sets = log.sets.filter((st) => st.weight > 0);
    if (!sets.length) continue;
    const top = sets.reduce((a, b) => (b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a));
    const e1rm = Math.max(...sets.map((st) => epley1RM(st.weight, st.reps)));
    const volume = sets.reduce((acc, st) => acc + st.weight * (st.reps || 0), 0);
    out.push({ date: s.date, weight: top.weight, reps: top.reps, e1rm, volume });
  }
  return out;
}

/**
 * Serie temporal de progreso de un ejercicio, agrupada por fecha o por semana.
 * En modo semana suma el volumen de la semana y toma el mejor peso/e1RM.
 */
export function exerciseProgress(
  sessions: Record<string, WorkoutSession>,
  exId: string,
  mode: 'fecha' | 'semana' = 'fecha'
): ProgressPoint[] {
  const aggs = sessionAggregates(sessions, exId);
  if (mode === 'fecha') {
    return aggs
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((a) => ({
        key: a.date,
        label: shortDate(a.date),
        weight: a.weight,
        reps: a.reps,
        e1rm: Math.round(a.e1rm * 10) / 10,
        volume: Math.round(a.volume),
      }));
  }
  // Agrupar por semana (lunes de cada semana).
  const groups = new Map<string, SessionAgg[]>();
  for (const a of aggs) {
    const [y, m, d] = a.date.split('-').map(Number);
    const wk = isoDate(startOfWeek(new Date(y, m - 1, d)));
    const arr = groups.get(wk) ?? [];
    arr.push(a);
    groups.set(wk, arr);
  }
  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([wk, arr]) => {
      const best = arr.reduce((x, y) => (y.weight > x.weight ? y : x));
      return {
        key: wk,
        label: `sem ${shortDate(wk)}`,
        weight: best.weight,
        reps: best.reps,
        e1rm: Math.round(Math.max(...arr.map((a) => a.e1rm)) * 10) / 10,
        volume: Math.round(arr.reduce((acc, a) => acc + a.volume, 0)),
      };
    });
}

export const muscleColor: Record<string, string> = {
  Pecho: '#ff7a7a',
  Espalda: '#5ec8ff',
  Pierna: '#b6f23e',
  Glúteo: '#c89bff',
  Hombro: '#ffb454',
  Bíceps: '#7ee0c0',
  Tríceps: '#ff9fd0',
  Core: '#ffd95e',
  Cardio: '#9aa6b4',
};
