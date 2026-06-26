import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Check, Info, History, Timer, Trophy, RotateCcw, Plus, Minus, Search, Dumbbell, X } from 'lucide-react';
import { Header } from '../components/Header';
import { Pill } from '../components/ui';
import { Sheet } from '../components/Sheet';
import {
  useSettings,
  useWorkout,
  useLibrary,
  sessionKey,
  lastWeightFor,
  findExerciseById,
  newCustomExerciseId,
} from '../lib/store';
import { PLANS } from '../data/workoutPlans';
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';
import {
  muscleColor,
  sessionProgress,
  isSessionComplete,
  estimatedMinutesForExercises,
  loadOf,
  LOAD_LABEL,
  weightColumnLabel,
  loadHint,
} from '../lib/workout';
import { isoDate, shortDate } from '../lib/date';
import type { Exercise, LoadType, MuscleGroup } from '../types';

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Pecho', 'Espalda', 'Pierna', 'Glúteo', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio',
];
const LOAD_TYPES: LoadType[] = ['barra', 'mancuerna', 'polea', 'maquina', 'corporal'];

function findDay(dayId: string) {
  for (const p of Object.values(PLANS)) {
    const d = p.days.find((x) => x.id === dayId);
    if (d) return { day: d, plan: p };
  }
  return null;
}

export function WorkoutSessionPage() {
  const { dayId } = useParams();
  const nav = useNavigate();
  const found = dayId ? findDay(dayId) : null;
  const daysPerWeek = useSettings((s) => s.daysPerWeek);

  const sessions = useWorkout((s) => s.sessions);
  const ensureSession = useWorkout((s) => s.ensureSession);
  const addExercise = useWorkout((s) => s.addExercise);
  const removeExercise = useWorkout((s) => s.removeExercise);
  const completeSession = useWorkout((s) => s.completeSession);
  const resetSession = useWorkout((s) => s.resetSession);

  const today = isoDate();
  const key = found ? sessionKey(today, found.day.id) : '';
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (found) ensureSession(today, found.day, daysPerWeek);
  }, [found?.day.id]);

  const session = sessions[key];
  const prog = sessionProgress(session);
  const [celebrate, setCelebrate] = useState(false);

  if (!found) {
    return (
      <div className="p-6">
        <Header title="No encontrado" back />
        <p className="text-muted px-1">Esa sesión no existe.</p>
      </div>
    );
  }

  const { day } = found;
  const allExercises = [...day.exercises, ...(day.alternatives ?? [])];
  const baseById = new Map(allExercises.map((e) => [e.id, e]));
  // Activos = cualquier ejercicio con log en la sesión (plan, alternativa,
  // catálogo o creado a mano). Se resuelve por id para mostrar nombre/carga.
  const selectedExercises: Exercise[] = session
    ? (Object.keys(session.logs)
        .map((id) => baseById.get(id) ?? findExerciseById(id))
        .filter(Boolean) as Exercise[])
    : [];
  const availableExercises = allExercises.filter((ex) => !session?.logs[ex.id]);
  const estimated = estimatedMinutesForExercises(
    selectedExercises.length ? selectedExercises : day.exercises
  );
  const done = isSessionComplete(session);
  const activeIds = new Set(session ? Object.keys(session.logs) : []);

  return (
    <div className="animate-fade">
      <Header
        title={day.name}
        subtitle={`${day.focus} · ≈ ${estimated} min`}
        back
        right={
          <button
            onClick={() => {
              if (confirm('¿Reiniciar el registro de hoy de esta sesión?')) resetSession(key);
            }}
            className="grid place-items-center h-10 w-10 rounded-full text-faint active:bg-card-2"
          >
            <RotateCcw size={18} />
          </button>
        }
      />

      <div className="px-4">
        {/* Barra de progreso */}
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="flex-1 h-2.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${(done ? 1 : prog.pct) * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-muted tabular-nums">
            {done ? prog.total : prog.done}/{prog.total}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3 px-1 mb-3">
          <div>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
              Ejercicios elegidos
            </h2>
            <p className="text-[12px] text-faint mt-1">Haz los que mejor encajen hoy.</p>
          </div>
          <Pill color="var(--color-accent)">{selectedExercises.length} activos</Pill>
        </div>

        <div className="space-y-3">
          {selectedExercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              sessionK={key}
              onRemove={() => {
                const log = session?.logs[ex.id];
                const hasData = log?.done || log?.sets.some((st) => st.done || st.weight > 0 || st.reps > 0);
                if (
                  !hasData ||
                  confirm(`Ya has registrado datos en ${ex.name}. ¿Quieres quitarlo de la sesión de hoy?`)
                ) {
                  removeExercise(key, ex.id);
                }
              }}
            />
          ))}
        </div>

        {/* Añadir de la biblioteca */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 rounded-2xl border border-dashed border-line-strong bg-card/40 py-3.5 flex items-center justify-center gap-2 font-bold text-accent active:scale-[0.99]"
        >
          <Search size={18} /> Añadir ejercicio
        </button>

        {availableExercises.length > 0 && (
          <section className="mt-6">
            <div className="flex items-end justify-between gap-3 px-1 mb-3">
              <div>
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Opciones del día
                </h2>
                <p className="text-[12px] text-faint mt-1">Alternativas y ejercicios que has quitado.</p>
              </div>
              <Pill>{availableExercises.length} opciones</Pill>
            </div>
            <div className="space-y-2.5">
              {availableExercises.map((ex) => (
                <AvailableExerciseCard
                  key={ex.id}
                  ex={ex}
                  isAlternative={Boolean(day.alternatives?.some((altEx) => altEx.id === ex.id))}
                  onAdd={() => addExercise(key, ex)}
                />
              ))}
            </div>
          </section>
        )}

        <button
          onClick={() => {
            completeSession(key, new Date().toISOString());
            setCelebrate(true);
          }}
          className={`w-full mt-5 rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
            done ? 'bg-accent text-ink' : 'bg-card border border-line text-fg'
          }`}
        >
          <Trophy size={20} />
          {session?.completedAt
            ? 'Entreno finalizado ✓'
            : done
              ? 'Finalizar entreno'
              : 'Marcar como completado'}
        </button>
        <div className="h-4" />
      </div>

      <AddExerciseSheet
        open={showAdd}
        onClose={() => setShowAdd(false)}
        activeIds={activeIds}
        onAdd={(ex) => addExercise(key, ex)}
      />

      {celebrate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 animate-fade p-8" onClick={() => nav('/')}>
          <div className="text-center animate-pop">
            <div className="mx-auto grid place-items-center h-24 w-24 rounded-full bg-accent text-ink mb-5">
              <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-extrabold">¡Sesión hecha!</h2>
            <p className="text-muted mt-2">{day.name} · {done ? prog.total : prog.done} de {prog.total} ejercicios</p>
            <p className="text-faint text-sm mt-6">Toca para volver al inicio</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  ex,
  sessionK,
  onRemove,
}: {
  ex: Exercise;
  sessionK: string;
  onRemove: () => void;
}) {
  const sessions = useWorkout((s) => s.sessions);
  const setField = useWorkout((s) => s.setField);
  const toggleSet = useWorkout((s) => s.toggleSet);
  const toggleExercise = useWorkout((s) => s.toggleExercise);
  const addSet = useWorkout((s) => s.addSet);
  const removeSet = useWorkout((s) => s.removeSet);

  const log = sessions[sessionK]?.logs[ex.id];
  const last = lastWeightFor(sessions, ex.id);
  const [open, setOpen] = useState(false);
  const color = muscleColor[ex.muscle] ?? '#b6f23e';
  const load = loadOf(ex);
  const hint = loadHint(load);

  if (!log) return null;
  const exDone = log.done;
  const nSets = log.sets.length;

  return (
    <div className={`rounded-3xl border bg-card overflow-hidden transition-colors ${exDone ? 'border-accent/40' : 'border-line'}`}>
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => toggleExercise(sessionK, ex.id, ex.sets)}
          className={`grid place-items-center h-11 w-11 rounded-2xl shrink-0 border-2 transition-colors ${
            exDone ? 'bg-accent border-accent text-ink' : 'border-line-strong text-transparent'
          }`}
          aria-label="Marcar ejercicio"
        >
          <Check size={22} strokeWidth={3} />
        </button>

        <button onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[11px] font-semibold text-faint uppercase tracking-wide">{ex.muscle}</span>
            <span className="text-[10px] font-semibold text-faint uppercase tracking-wide rounded-full bg-ink-2 px-2 py-0.5">
              {LOAD_LABEL[load]}
            </span>
          </div>
          <h3 className={`font-bold leading-tight ${exDone ? 'line-through text-muted' : ''}`}>{ex.name}</h3>
          <p className="text-[13px] text-muted mt-0.5">
            {nSets} × {ex.reps} · descanso {ex.rest}
          </p>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRemove}
            className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-faint active:scale-95 active:text-danger"
            aria-label={`Quitar ${ex.name}`}
          >
            <Minus size={17} />
          </button>
          <Link
            to={`/entreno/ejercicio/${ex.id}`}
            className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-muted active:scale-95"
          >
            <Info size={17} />
          </Link>
        </div>
      </div>

      {/* Registro de series */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 pb-3 -mt-1"
      >
        <div className="flex items-center gap-2 text-[13px] text-faint">
          {last ? (
            <>
              <History size={14} />
              Último: <span className="text-muted font-semibold">{last.weight} kg × {last.reps}</span>
              <span className="text-faint">· {shortDate(last.date)}</span>
            </>
          ) : (
            <>
              <Timer size={14} /> Registra tus series
            </>
          )}
        </div>
        <span className="text-[13px] font-semibold text-accent">{open ? 'Ocultar' : 'Registrar'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 animate-fade">
          <div className="grid grid-cols-[2.2rem_1fr_1fr_2.6rem] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
            <span>Serie</span>
            <span>{weightColumnLabel(load)}</span>
            <span>Reps</span>
            <span className="text-center">OK</span>
          </div>
          {log.sets.map((st, i) => (
            <div key={i} className="grid grid-cols-[2.2rem_1fr_1fr_2.6rem] gap-2 items-center">
              <span className="grid place-items-center h-11 rounded-xl bg-ink-2 text-sm font-bold text-muted">
                {i + 1}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={st.weight || ''}
                placeholder={last ? String(last.weight) : '0'}
                onChange={(e) => setField(sessionK, ex.id, i, 'weight', parseFloat(e.target.value) || 0)}
                className="h-11 w-full min-w-0 rounded-xl bg-ink-2 border border-line text-center text-lg font-bold focus:border-accent/60 outline-none"
              />
              <input
                type="number"
                inputMode="numeric"
                value={st.reps || ''}
                placeholder={ex.reps.split('-')[0]}
                onChange={(e) => setField(sessionK, ex.id, i, 'reps', parseInt(e.target.value) || 0)}
                className="h-11 w-full min-w-0 rounded-xl bg-ink-2 border border-line text-center text-lg font-bold focus:border-accent/60 outline-none"
              />
              <button
                onClick={() => toggleSet(sessionK, ex.id, i)}
                className={`grid place-items-center h-11 rounded-xl border-2 transition-colors ${
                  st.done ? 'bg-accent border-accent text-ink' : 'border-line-strong text-transparent'
                }`}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          ))}

          {hint && <p className="text-[12px] text-faint px-1 pt-0.5">{hint}</p>}

          {/* Añadir / quitar serie */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => addSet(sessionK, ex.id)}
              className="flex-1 h-10 rounded-xl bg-ink-2 border border-line text-[13px] font-bold text-accent flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Plus size={16} /> Añadir serie
            </button>
            {nSets > 1 && (
              <button
                onClick={() => removeSet(sessionK, ex.id)}
                className="h-10 w-12 rounded-xl bg-ink-2 border border-line text-faint flex items-center justify-center active:scale-95 active:text-danger"
                aria-label="Quitar última serie"
              >
                <Minus size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AvailableExerciseCard({
  ex,
  isAlternative,
  onAdd,
}: {
  ex: Exercise;
  isAlternative: boolean;
  onAdd: () => void;
}) {
  const color = muscleColor[ex.muscle] ?? '#b6f23e';

  return (
    <div className="rounded-3xl border border-line bg-card/70 p-3.5 flex items-center gap-3">
      <button
        onClick={onAdd}
        className="grid place-items-center h-11 w-11 rounded-2xl shrink-0 bg-accent text-ink active:scale-95"
        aria-label={`Añadir ${ex.name}`}
      >
        <Plus size={21} strokeWidth={2.75} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-semibold text-faint uppercase tracking-wide">
            {ex.muscle} · {isAlternative ? 'Alternativa' : 'Quitado'}
          </span>
        </div>
        <h3 className="font-bold leading-tight truncate">{ex.name}</h3>
        <p className="text-[13px] text-muted mt-0.5">
          {ex.sets} × {ex.reps} · descanso {ex.rest}
        </p>
      </div>
      <Link
        to={`/entreno/ejercicio/${ex.id}`}
        className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-muted shrink-0 active:scale-95"
      >
        <Info size={17} />
      </Link>
    </div>
  );
}

/* ---------------------- Buscar / crear ejercicio ---------------------- */
function AddExerciseSheet({
  open,
  onClose,
  activeIds,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  activeIds: Set<string>;
  onAdd: (ex: Exercise) => void;
}) {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | 'Todos'>('Todos');
  const [creating, setCreating] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const customExercises = useLibrary((s) => s.exercises);
  const addToLibrary = useLibrary((s) => s.addExercise);

  const pool = useMemo(
    () => [...Object.values(customExercises), ...EXERCISE_CATALOG],
    [customExercises]
  );

  const results = useMemo(() => {
    const norm = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const nq = norm(q.trim());
    return pool
      .filter((e) => (muscle === 'Todos' ? true : e.muscle === muscle))
      .filter((e) => (nq ? norm(e.name).includes(nq) : true))
      .slice(0, 60);
  }, [pool, q, muscle]);

  function add(ex: Exercise) {
    onAdd(ex);
    setJustAdded(ex.id);
    setTimeout(() => setJustAdded((id) => (id === ex.id ? null : id)), 1200);
  }

  return (
    <Sheet open={open} onClose={onClose} title={creating ? 'Crear ejercicio' : 'Añadir ejercicio'}>
      {creating ? (
        <CreateExerciseForm
          onCancel={() => setCreating(false)}
          onCreate={(ex) => {
            addToLibrary(ex);
            onAdd(ex);
            setCreating(false);
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ejercicio…"
              className="w-full h-11 rounded-xl bg-ink-2 border border-line pl-9 pr-3 outline-none focus:border-accent/60"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1 no-scrollbar">
            {(['Todos', ...MUSCLE_GROUPS] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMuscle(m as MuscleGroup | 'Todos')}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  muscle === m ? 'bg-accent text-ink' : 'bg-ink-2 border border-line text-muted'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[46vh] overflow-y-auto -mx-1 px-1">
            {results.map((ex) => {
              const active = activeIds.has(ex.id);
              const added = justAdded === ex.id;
              const color = muscleColor[ex.muscle] ?? '#b6f23e';
              return (
                <div key={ex.id} className="rounded-2xl border border-line bg-card/70 p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[11px] font-semibold text-faint uppercase tracking-wide">
                        {ex.muscle} · {LOAD_LABEL[loadOf(ex)]}
                      </span>
                    </div>
                    <h3 className="font-bold leading-tight truncate">{ex.name}</h3>
                    <p className="text-[12px] text-muted mt-0.5">{ex.sets} × {ex.reps}</p>
                  </div>
                  <button
                    onClick={() => add(ex)}
                    disabled={active}
                    className={`grid place-items-center h-10 w-10 rounded-xl shrink-0 active:scale-95 ${
                      active || added ? 'bg-accent/20 text-accent' : 'bg-accent text-ink'
                    }`}
                    aria-label={`Añadir ${ex.name}`}
                  >
                    {active || added ? <Check size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={2.75} />}
                  </button>
                </div>
              );
            })}
            {results.length === 0 && (
              <p className="text-center text-sm text-faint py-6">
                Sin resultados. Puedes crearlo a mano.
              </p>
            )}
          </div>

          <button
            onClick={() => setCreating(true)}
            className="w-full rounded-2xl bg-card-2 border border-line py-3 font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Dumbbell size={18} className="text-accent" /> Crear un ejercicio nuevo
          </button>
        </div>
      )}
    </Sheet>
  );
}

function CreateExerciseForm({
  onCreate,
  onCancel,
}: {
  onCreate: (ex: Exercise) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup>('Pecho');
  const [load, setLoad] = useState<LoadType>('barra');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('8-12');

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[12px] font-semibold text-muted">Nombre</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="p. ej. Press inclinado en máquina"
          className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-accent/60"
        />
      </div>

      <div>
        <label className="text-[12px] font-semibold text-muted">Músculo</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                muscle === m ? 'bg-accent text-ink' : 'bg-ink-2 border border-line text-muted'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[12px] font-semibold text-muted">Tipo de carga</label>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {LOAD_TYPES.map((l) => (
            <button
              key={l}
              onClick={() => setLoad(l)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                load === l ? 'bg-accent text-ink' : 'bg-ink-2 border border-line text-muted'
              }`}
            >
              {LOAD_LABEL[l]}
            </button>
          ))}
        </div>
        {loadHint(load) && <p className="text-[12px] text-faint mt-1.5">{loadHint(load)}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-semibold text-muted">Series</label>
          <input
            type="number"
            inputMode="numeric"
            value={sets || ''}
            onChange={(e) => setSets(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line text-center font-bold outline-none focus:border-accent/60"
          />
        </div>
        <div>
          <label className="text-[12px] font-semibold text-muted">Reps</label>
          <input
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8-12"
            className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line text-center font-bold outline-none focus:border-accent/60"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="h-12 px-5 rounded-2xl bg-card-2 border border-line font-bold flex items-center gap-2 active:scale-95"
        >
          <X size={18} /> Cancelar
        </button>
        <button
          onClick={() => {
            const n = name.trim();
            if (!n) return;
            onCreate({
              id: newCustomExerciseId(),
              name: n,
              muscle,
              load,
              sets: Math.max(1, sets),
              reps: reps.trim() || '8-12',
              rest: '90s',
              how: '',
              cues: [],
            });
          }}
          disabled={!name.trim()}
          className="flex-1 h-12 rounded-2xl bg-accent text-ink font-bold flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
        >
          <Plus size={18} /> Crear y añadir
        </button>
      </div>
    </div>
  );
}
