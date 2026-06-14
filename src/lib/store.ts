import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DayMenu,
  HealthEntry,
  MacroTargets,
  Meal,
  Profile,
  WorkoutDay,
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
      profile: { name: 'Fran', goal: 'mantener', heightCm: 178 },
      daysPerWeek: 4,
      macros: { calories: 2300, protein: 180, carbs: 220, fat: 70, bodyFatTarget: 15 },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setDaysPerWeek: (d) => set({ daysPerWeek: d }),
      setMacros: (m) => set((s) => ({ macros: { ...s.macros, ...m } })),
    }),
    { name: 'fitfran-settings' }
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
    { name: 'fitfran-menu', version: 1 }
  )
);
