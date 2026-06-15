import type { Exercise, WorkoutDay, WorkoutPlan, WorkoutSession } from '../types';

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
