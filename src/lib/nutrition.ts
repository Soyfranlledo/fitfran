import type { MacroTargets, Profile } from '../types';

const ACTIVITY: Record<Profile['activity'], number> = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  alto: 1.725,
};

export interface CalcInput {
  sex: 'h' | 'm';
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Profile['activity'];
  /** % de déficit (cut) o superávit. Negativo = déficit. p.ej. -20 */
  adjustPct: number;
}

export interface CalcResult {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Mifflin-St Jeor + reparto de macros pensado para definición (perder grasa). */
export function computeTargets(i: CalcInput): CalcResult {
  const bmr = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + (i.sex === 'h' ? 5 : -161);
  const tdee = bmr * ACTIVITY[i.activity];
  const calories = Math.max(1200, Math.round((tdee * (1 + i.adjustPct / 100)) / 10) * 10);

  // En déficit: proteína alta para conservar músculo, grasa moderada, resto carbos.
  const protein = Math.round(2.0 * i.weightKg);
  const fat = Math.round(0.8 * i.weightKg);
  const carbsKcal = calories - (protein * 4 + fat * 9);
  const carbs = Math.max(0, Math.round(carbsKcal / 4));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    protein,
    carbs,
    fat,
  };
}

export function macrosKcal(m: Pick<MacroTargets, 'protein' | 'carbs' | 'fat'>): number {
  return m.protein * 4 + m.carbs * 4 + m.fat * 9;
}
