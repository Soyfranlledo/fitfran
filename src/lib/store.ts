import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayMenu,
  HealthEntry,
  MacroTargets,
  Meal,
  Profile,
  WorkoutDay,
  Exercise,
  WorkoutSession,
} from '../types';
import { DEFAULT_MENU } from '../data/weeklyMenu';

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
const BACKUP_KEYS = [
  'fitfran-settings',
  'fitfran-workouts',
  'fitfran-health',
  'fitfran-menu',
  'fitfran-plan',
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
