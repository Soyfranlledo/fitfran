export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Pierna'
  | 'Glúteo'
  | 'Hombro'
  | 'Bíceps'
  | 'Tríceps'
  | 'Core'
  | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  sets: number;
  reps: string;
  rest: string;
  /** Breve explicación de la técnica */
  how: string;
  /** Puntos clave a recordar */
  cues: string[];
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  /** Día de la semana asignado (1=lunes ... 7=domingo) */
  weekday: number;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  daysPerWeek: 3 | 4 | 5;
  title: string;
  subtitle: string;
  days: WorkoutDay[];
}

/* ---- Registro de entrenos ---- */

export interface SetLog {
  weight: number;
  reps: number;
  done: boolean;
}

export interface ExerciseLog {
  sets: SetLog[];
  done: boolean;
}

export interface WorkoutSession {
  /** YYYY-MM-DD */
  date: string;
  dayId: string;
  daysPerWeek: number;
  logs: Record<string, ExerciseLog>;
  completedAt?: string;
}

/* ---- Nutrición ---- */

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** % de grasa corporal objetivo */
  bodyFatTarget: number;
}

export interface MealItem {
  name: string;
  qty?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: MealItem[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayMenu {
  /** 1=lunes ... 7=domingo */
  weekday: number;
  meals: Meal[];
}

/* ---- Salud ---- */

export interface HealthEntry {
  /** YYYY-MM-DD */
  date: string;
  weight?: number;
  bodyFat?: number;
  steps?: number;
  sleepHours?: number;
}

export interface Profile {
  name: string;
  goal: 'perder' | 'mantener' | 'ganar';
  heightCm: number;
}
