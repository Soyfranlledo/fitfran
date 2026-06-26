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

/**
 * Tipo de carga de un ejercicio. Determina qué peso anota el usuario:
 * - `mancuerna`: el peso de UNA mancuerna (por mano).
 * - `barra` / `polea` / `maquina`: el peso total seleccionado.
 * - `corporal`: peso del cuerpo; el campo de peso registra el lastre/extra.
 */
export type LoadType = 'barra' | 'mancuerna' | 'polea' | 'maquina' | 'corporal';

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
  /** Tipo de carga (opcional; por defecto se interpreta como peso total). */
  load?: LoadType;
}

export interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  /** Día de la semana asignado (1=lunes ... 7=domingo) */
  weekday: number;
  exercises: Exercise[];
  /** Opciones extra que el usuario puede añadir o intercambiar durante la sesión */
  alternatives?: Exercise[];
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

/* ---- Diario de comidas real (lo que de verdad comes) ---- */

export interface FoodLogItem {
  name: string;
  /** Cantidad descrita, p. ej. "180 g" o "2 ud". */
  qty?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodLogEntry {
  id: string;
  /** YYYY-MM-DD (día local en que se comió). */
  date: string;
  /** Hora opcional, p. ej. "08:30". */
  time?: string;
  /** Título corto, p. ej. "Desayuno". */
  title?: string;
  items: FoodLogItem[];
  /** Totales de la entrada (suma de los items). */
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Cómo se creó la entrada. */
  source: 'voz' | 'manual';
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
  sex: 'h' | 'm';
  age: number;
  activity: 'sedentario' | 'ligero' | 'moderado' | 'alto';
}
