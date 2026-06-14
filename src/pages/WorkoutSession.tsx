import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Check, Info, History, Timer, Trophy, RotateCcw } from 'lucide-react';
import { Header } from '../components/Header';
import { Pill } from '../components/ui';
import {
  useSettings,
  useWorkout,
  sessionKey,
  lastWeightFor,
} from '../lib/store';
import { PLANS } from '../data/workoutPlans';
import { muscleColor, sessionProgress, estimatedMinutes } from '../lib/workout';
import { isoDate, prettyDate, shortDate } from '../lib/date';
import type { Exercise } from '../types';

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
  const completeSession = useWorkout((s) => s.completeSession);
  const resetSession = useWorkout((s) => s.resetSession);

  const today = isoDate();
  const key = found ? sessionKey(today, found.day.id) : '';

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
  const done = prog.total > 0 && prog.pct >= 1;

  return (
    <div className="animate-fade">
      <Header
        title={day.name}
        subtitle={`${day.focus} · ≈ ${estimatedMinutes(day)} min`}
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
              style={{ width: `${prog.pct * 100}%` }}
            />
          </div>
          <span className="text-sm font-bold text-muted tabular-nums">
            {prog.done}/{prog.total}
          </span>
        </div>

        <div className="space-y-3">
          {day.exercises.map((ex) => (
            <ExerciseCard key={ex.id} ex={ex} sessionK={key} />
          ))}
        </div>

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
          {done ? 'Finalizar entreno' : 'Marcar como completado'}
        </button>
        <div className="h-4" />
      </div>

      {celebrate && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 animate-fade p-8" onClick={() => nav('/')}>
          <div className="text-center animate-pop">
            <div className="mx-auto grid place-items-center h-24 w-24 rounded-full bg-accent text-ink mb-5">
              <Trophy size={48} />
            </div>
            <h2 className="text-3xl font-extrabold">¡Sesión hecha!</h2>
            <p className="text-muted mt-2">{day.name} · {prog.done} de {prog.total} ejercicios</p>
            <p className="text-faint text-sm mt-6">Toca para volver al inicio</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ ex, sessionK }: { ex: Exercise; sessionK: string }) {
  const sessions = useWorkout((s) => s.sessions);
  const setField = useWorkout((s) => s.setField);
  const toggleSet = useWorkout((s) => s.toggleSet);
  const toggleExercise = useWorkout((s) => s.toggleExercise);

  const log = sessions[sessionK]?.logs[ex.id];
  const last = lastWeightFor(sessions, ex.id);
  const [open, setOpen] = useState(false);
  const color = muscleColor[ex.muscle] ?? '#b6f23e';

  if (!log) return null;
  const exDone = log.done;

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
          </div>
          <h3 className={`font-bold leading-tight ${exDone ? 'line-through text-muted' : ''}`}>{ex.name}</h3>
          <p className="text-[13px] text-muted mt-0.5">
            {ex.sets} × {ex.reps} · descanso {ex.rest}
          </p>
        </button>

        <Link
          to={`/entreno/ejercicio/${ex.id}`}
          className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-muted shrink-0 active:scale-95"
        >
          <Info size={17} />
        </Link>
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
            <span>Peso (kg)</span>
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
        </div>
      )}
    </div>
  );
}
