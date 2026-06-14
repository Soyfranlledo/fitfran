import { useParams } from 'react-router-dom';
import { Lightbulb, ListChecks, TrendingUp, Repeat, Timer, Layers, type LucideIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/ui';
import { Sparkline } from '../components/Sparkline';
import { PLANS } from '../data/workoutPlans';
import { useWorkout } from '../lib/store';
import { muscleColor } from '../lib/workout';
import { shortDate } from '../lib/date';
import type { Exercise } from '../types';

function findExercise(exId: string): Exercise | null {
  for (const p of Object.values(PLANS)) {
    for (const d of p.days) {
      const e = d.exercises.find((x) => x.id === exId);
      if (e) return e;
    }
  }
  return null;
}

export function ExerciseDetail() {
  const { exId } = useParams();
  const ex = exId ? findExercise(exId) : null;
  const sessions = useWorkout((s) => s.sessions);

  if (!ex) {
    return (
      <div>
        <Header title="Ejercicio" back />
        <p className="text-muted px-5">No encontrado.</p>
      </div>
    );
  }

  const color = muscleColor[ex.muscle] ?? '#b6f23e';

  // Historial: peso máximo por fecha
  const history = Object.values(sessions)
    .filter((s) => s.logs[ex.id])
    .map((s) => {
      const sets = s.logs[ex.id].sets.filter((st) => st.weight > 0);
      const top = sets.length ? Math.max(...sets.map((st) => st.weight)) : 0;
      const reps = sets.length ? sets.reduce((a, b) => (b.weight >= a.weight ? b : a)).reps : 0;
      return { date: s.date, weight: top, reps };
    })
    .filter((h) => h.weight > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const best = history.length ? Math.max(...history.map((h) => h.weight)) : 0;

  return (
    <div className="animate-fade">
      <Header title={ex.name} subtitle={ex.muscle} back />

      <div className="px-4 space-y-4">
        {/* Resumen prescripción */}
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-2">
            <Spec Icon={Layers} label="Series" value={String(ex.sets)} color={color} />
            <Spec Icon={Repeat} label="Reps" value={ex.reps} color={color} />
            <Spec Icon={Timer} label="Descanso" value={ex.rest} color={color} />
          </div>
        </Card>

        {/* Técnica */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={18} className="text-accent" />
            <h3 className="font-bold">Cómo hacerlo</h3>
          </div>
          <p className="text-[15px] leading-relaxed text-fg/90">{ex.how}</p>
        </Card>

        {/* Cues */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={18} className="text-accent" />
            <h3 className="font-bold">Puntos clave</h3>
          </div>
          <ul className="space-y-2.5">
            {ex.cues.map((c, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[15px] text-fg/90">{c}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Historial */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              <h3 className="font-bold">Tu progreso</h3>
            </div>
            {best > 0 && (
              <span className="text-sm font-bold" style={{ color }}>
                Récord {best} kg
              </span>
            )}
          </div>
          <Sparkline data={history.map((h) => ({ x: h.date, y: h.weight }))} color={color} />
          {history.length > 0 ? (
            <div className="mt-4 space-y-1.5">
              {history
                .slice(-6)
                .reverse()
                .map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-line last:border-0">
                    <span className="text-muted">{shortDate(h.date)}</span>
                    <span className="font-semibold">
                      {h.weight} kg <span className="text-faint font-normal">× {h.reps}</span>
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-faint mt-3 text-center">
              Registra pesos en tus sesiones y verás aquí tu evolución.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Spec({
  Icon,
  label,
  value,
  color,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-ink-2 p-3 text-center">
      <span style={{ color }} className="inline-block mb-1.5">
        <Icon size={18} />
      </span>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="text-[11px] text-muted mt-1">{label}</p>
    </div>
  );
}
