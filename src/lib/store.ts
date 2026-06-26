import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayMenu,
  FoodLogEntry,
  HealthEntry,
  MacroTargets,
  Meal,
  Profile,
  WorkoutDay,
  Exercise,
  WorkoutSession,
} from '../types';
import { DEFAULT_MENU } from '../data/weeklyMenu';
import { PLANS } from '../data/workoutPlans';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';

/* ============================ Ajustes / Perfil ============================ */
interface SettingsState {
  profile: Profile;
  daysPerWeek: 3 | 4 | 5;
  macros: MacroTargets;
  setProfile: (p: Partial<Profile>) => void;
  setDaysPerWeek: (d: 3 | 4 | 5) => void;
  setMacros: (m: Partial<MacroTargets>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      profile: { name: 'Fran', goal: 'perder', heightCm: 186, sex: 'h', age: 38, activity: 'moderado' },
      daysPerWeek: 4,
      macros: { calories: 2250, protein: 180, carbs: 225, fat: 70, bodyFatTarget: 13 },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setDaysPerWeek: (d) => set({ daysPerWeek: d }),
      setMacros: (m) => set((s) => ({ macros: { ...s.macros, ...m } })),
    }),
    {
      name: 'fitfran-settings',
      version: 2,
      // v2: fija el perfil y objetivos personalizados de Fran (su app personal).
      migrate: (persisted: any) => ({
        ...(persisted ?? {}),
        profile: { name: 'Fran', goal: 'perder', heightCm: 186, sex: 'h', age: 38, activity: 'moderado' },
        macros: { calories: 2250, protein: 180, carbs: 225, fat: 70, bodyFatTarget: 13 },
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...p,
          profile: { ...current.profile, ...(p.profile ?? {}) },
          macros: { ...current.macros, ...(p.macros ?? {}) },
        };
      },
    }
  )
);

/* ============================ Registro de entrenos ============================ */
interface WorkoutState {
  sessions: Record<string, WorkoutSession>;
  ensureSession: (date: string, day: WorkoutDay, daysPerWeek: number) => void;
  setField: (
    key: string,
    exId: string,
    setIdx: number,
    field: 'weight' | 'reps',
    value: number
  ) => void;
  toggleSet: (key: string, exId: string, setIdx: number) => void;
  toggleExercise: (key: string, exId: string, sets: number) => void;
  addExercise: (key: string, exercise: Exercise) => void;
  removeExercise: (key: string, exId: string) => void;
  /** Añade una serie extra (vacía) a un ejercicio de la sesión. */
  addSet: (key: string, exId: string) => void;
  /** Quita la última serie de un ejercicio (deja al menos una). */
  removeSet: (key: string, exId: string) => void;
  completeSession: (key: string, when: string) => void;
  resetSession: (key: string) => void;
}

export const sessionKey = (date: string, dayId: string) => `${date}:${dayId}`;

export const useWorkout = create<WorkoutState>()(
  persist(
    (set) => ({
      sessions: {},
      ensureSession: (date, day, daysPerWeek) =>
        set((s) => {
          const key = sessionKey(date, day.id);
          if (s.sessions[key]) return s;
          const logs: WorkoutSession['logs'] = {};
          for (const ex of day.exercises) {
            logs[ex.id] = {
              done: false,
              sets: Array.from({ length: ex.sets }, () => ({
                weight: 0,
                reps: 0,
                done: false,
              })),
            };
          }
          return {
            sessions: {
              ...s.sessions,
              [key]: { date, dayId: day.id, daysPerWeek, logs },
            },
          };
        }),
      setField: (key, exId, setIdx, field, value) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          const log = sess.logs[exId];
          const sets = log.sets.map((st, i) =>
            i === setIdx ? { ...st, [field]: value } : st
          );
          return {
            sessions: {
              ...s.sessions,
              [key]: { ...sess, logs: { ...sess.logs, [exId]: { ...log, sets } } },
            },
          };
        }),
      toggleSet: (key, exId, setIdx) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          const log = sess.logs[exId];
          const sets = log.sets.map((st, i) =>
            i === setIdx ? { ...st, done: !st.done } : st
          );
          const allDone = sets.every((st) => st.done);
          return {
            sessions: {
              ...s.sessions,
              [key]: {
                ...sess,
                logs: { ...sess.logs, [exId]: { ...log, sets, done: allDone } },
              },
            },
          };
        }),
      toggleExercise: (key, exId, _sets) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          const log = sess.logs[exId];
          const next = !log.done;
          const sets = log.sets.map((st) => ({ ...st, done: next }));
          return {
            sessions: {
              ...s.sessions,
              [key]: {
                ...sess,
                logs: { ...sess.logs, [exId]: { ...log, done: next, sets } },
              },
            },
          };
        }),
      addExercise: (key, exercise) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess || sess.logs[exercise.id]) return s;
          return {
            sessions: {
              ...s.sessions,
              [key]: {
                ...sess,
                logs: {
                  ...sess.logs,
                  [exercise.id]: {
                    done: false,
                    sets: Array.from({ length: exercise.sets }, () => ({
                      weight: 0,
                      reps: 0,
                      done: false,
                    })),
                  },
                },
              },
            },
          };
        }),
      removeExercise: (key, exId) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess || !sess.logs[exId]) return s;
          const logs = { ...sess.logs };
          delete logs[exId];
          return {
            sessions: {
              ...s.sessions,
              [key]: { ...sess, logs },
            },
          };
        }),
      addSet: (key, exId) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          const log = sess.logs[exId];
          if (!log) return s;
          const sets = [...log.sets, { weight: 0, reps: 0, done: false }];
          return {
            sessions: {
              ...s.sessions,
              // Una serie nueva está sin hacer, así que el ejercicio deja de
              // estar "completado" hasta que la marques.
              [key]: { ...sess, logs: { ...sess.logs, [exId]: { ...log, sets, done: false } } },
            },
          };
        }),
      removeSet: (key, exId) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          const log = sess.logs[exId];
          if (!log || log.sets.length <= 1) return s;
          const sets = log.sets.slice(0, -1);
          const done = sets.length > 0 && sets.every((st) => st.done);
          return {
            sessions: {
              ...s.sessions,
              [key]: { ...sess, logs: { ...sess.logs, [exId]: { ...log, sets, done } } },
            },
          };
        }),
      completeSession: (key, when) =>
        set((s) => {
          const sess = s.sessions[key];
          if (!sess) return s;
          return {
            sessions: { ...s.sessions, [key]: { ...sess, completedAt: when } },
          };
        }),
      resetSession: (key) =>
        set((s) => {
          const next = { ...s.sessions };
          delete next[key];
          return { sessions: next };
        }),
    }),
    { name: 'fitfran-workouts' }
  )
);

/**
 * Resuelve un ejercicio por su id mirando, en orden: los planes, el catálogo y
 * la biblioteca personal del usuario. Lo usan el detalle del ejercicio y la
 * sesión para mostrar nombre, técnica e historial de cualquier ejercicio,
 * venga de donde venga.
 */
export function findExerciseById(id: string): Exercise | null {
  for (const p of Object.values(PLANS)) {
    for (const d of p.days) {
      const e = [...d.exercises, ...(d.alternatives ?? [])].find((x) => x.id === id);
      if (e) return e;
    }
  }
  const cat = EXERCISE_CATALOG.find((e) => e.id === id);
  if (cat) return cat;
  return useLibrary.getState().exercises[id] ?? null;
}

/** Último peso registrado para un ejercicio (escanea historial). */
export function lastWeightFor(
  sessions: Record<string, WorkoutSession>,
  exId: string
): { weight: number; reps: number; date: string } | null {
  const entries = Object.values(sessions)
    .filter((s) => s.logs[exId])
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const s of entries) {
    const sets = s.logs[exId].sets.filter((st) => st.weight > 0);
    if (sets.length) {
      const top = sets.reduce((a, b) => (b.weight > a.weight ? b : a));
      return { weight: top.weight, reps: top.reps, date: s.date };
    }
  }
  return null;
}

/* ============================ Salud ============================ */
interface HealthState {
  entries: Record<string, HealthEntry>;
  upsert: (e: HealthEntry) => void;
  remove: (date: string) => void;
  importMany: (list: HealthEntry[]) => void;
}

export const useHealth = create<HealthState>()(
  persist(
    (set) => ({
      entries: {},
      upsert: (e) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [e.date]: { ...s.entries[e.date], ...e, date: e.date },
          },
        })),
      remove: (date) =>
        set((s) => {
          const next = { ...s.entries };
          delete next[date];
          return { entries: next };
        }),
      importMany: (list) =>
        set((s) => {
          const next = { ...s.entries };
          for (const e of list) {
            if (!e.date) continue;
            next[e.date] = { ...next[e.date], ...e, date: e.date };
          }
          return { entries: next };
        }),
    }),
    { name: 'fitfran-health' }
  )
);

/* ============================ Menú nutrición ============================ */
interface MenuState {
  menu: DayMenu[];
  updateMeal: (weekday: number, mealId: string, patch: Partial<Meal>) => void;
  resetMenu: () => void;
}

export const useMenu = create<MenuState>()(
  persist(
    (set) => ({
      menu: DEFAULT_MENU,
      updateMeal: (weekday, mealId, patch) =>
        set((s) => ({
          menu: s.menu.map((d) =>
            d.weekday === weekday
              ? {
                  ...d,
                  meals: d.meals.map((m) =>
                    m.id === mealId ? { ...m, ...patch } : m
                  ),
                }
              : d
          ),
        })),
      resetMenu: () => set({ menu: DEFAULT_MENU }),
    }),
    {
      name: 'fitfran-menu',
      version: 3,
      // Al subir de versión, adoptamos el nuevo menú por defecto.
      migrate: () => ({ menu: DEFAULT_MENU }),
    }
  )
);

/* ============================ Biblioteca de ejercicios ============================ */
/** Ejercicios que el usuario crea a mano (los del catálogo no se guardan aquí). */
interface LibraryState {
  exercises: Record<string, Exercise>;
  addExercise: (e: Exercise) => void;
  removeExercise: (id: string) => void;
}

export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      exercises: {},
      addExercise: (e) =>
        set((s) => ({ exercises: { ...s.exercises, [e.id]: e } })),
      removeExercise: (id) =>
        set((s) => {
          const next = { ...s.exercises };
          delete next[id];
          return { exercises: next };
        }),
    }),
    { name: 'fitfran-library' }
  )
);

/** Genera un id estable para un ejercicio creado por el usuario. */
export function newCustomExerciseId(): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `user-${Date.now().toString(36)}-${rnd}`;
}

/* ============================ Diario de comidas ============================ */
/** Lo que el usuario come de verdad cada día (aparte del menú/plan). */
interface FoodLogState {
  /** date (YYYY-MM-DD) -> entradas de ese día */
  entries: Record<string, FoodLogEntry[]>;
  addEntry: (e: FoodLogEntry) => void;
  updateEntry: (date: string, id: string, patch: Partial<FoodLogEntry>) => void;
  removeEntry: (date: string, id: string) => void;
}

export const useFoodLog = create<FoodLogState>()(
  persist(
    (set) => ({
      entries: {},
      addEntry: (e) =>
        set((s) => ({
          entries: { ...s.entries, [e.date]: [...(s.entries[e.date] ?? []), e] },
        })),
      updateEntry: (date, id, patch) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [date]: (s.entries[date] ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)),
          },
        })),
      removeEntry: (date, id) =>
        set((s) => {
          const list = (s.entries[date] ?? []).filter((x) => x.id !== id);
          const entries = { ...s.entries };
          if (list.length) entries[date] = list;
          else delete entries[date];
          return { entries };
        }),
    }),
    { name: 'fitfran-foodlog' }
  )
);

export function newFoodEntryId(): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `f-${Date.now().toString(36)}-${rnd}`;
}

/** Suma kcal y macros de una lista de entradas del diario. */
export function foodLogTotals(list: FoodLogEntry[] = []) {
  return list.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.kcal || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/* ============================ Personalización del plan ============================ */
interface PlanState {
  /** dayId -> día de la semana asignado por el usuario (1..7) */
  weekdayOverride: Record<string, number>;
  /** Asigna un día de la semana a una sesión; si está ocupado, intercambia. */
  assignWeekday: (effective: { id: string; weekday: number }[], dayId: string, weekday: number) => void;
  clearOverrides: () => void;
}

export const usePlan = create<PlanState>()(
  persist(
    (set) => ({
      weekdayOverride: {},
      assignWeekday: (effective, dayId, weekday) =>
        set((s) => {
          const ov = { ...s.weekdayOverride };
          const current = effective.find((d) => d.id === dayId)?.weekday;
          const occupant = effective.find((d) => d.weekday === weekday && d.id !== dayId);
          if (occupant && current != null) ov[occupant.id] = current;
          ov[dayId] = weekday;
          return { weekdayOverride: ov };
        }),
      clearOverrides: () => set({ weekdayOverride: {} }),
    }),
    { name: 'fitfran-plan' }
  )
);

/* ============================ Copia de seguridad ============================ */
export const BACKUP_KEYS = [
  'fitfran-settings',
  'fitfran-workouts',
  'fitfran-health',
  'fitfran-menu',
  'fitfran-plan',
  'fitfran-foodlog',
  'fitfran-library',
];

export function exportData(): string {
  const data: Record<string, unknown> = { _app: 'FitFran', _version: 1 };
  for (const k of BACKUP_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw) data[k] = JSON.parse(raw);
  }
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): boolean {
  const parsed = JSON.parse(json);
  if (!parsed || parsed._app !== 'FitFran') throw new Error('Formato no válido');
  for (const k of BACKUP_KEYS) {
    if (parsed[k]) localStorage.setItem(k, JSON.stringify(parsed[k]));
  }
  return true;
}
