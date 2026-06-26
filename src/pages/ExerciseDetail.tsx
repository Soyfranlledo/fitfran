import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lightbulb, ListChecks, TrendingUp, Repeat, Timer, Layers, Dumbbell, type LucideIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, Segmented } from '../components/ui';
import { Sparkline } from '../components/Sparkline';
import { useWorkout, findExerciseById } from '../lib/store';
import { muscleColor, loadOf, LOAD_LABEL, exerciseProgress } from '../lib/workout';

export function ExerciseDetail() {
  const { exId } = useParams();
  const ex = exId ? findExerciseById(exId) : null;
  const sessions = useWorkout((s) => s.sessions);
  const [mode, setMode] = useState<'fecha' | 'semana'>('fecha');

  if (!ex) {
    return (
      <div>
        <Header title="Ejercicio" back />
        <p className="text-muted px-5">No encontrado.</p>
      </div>
    );
  }

  const color = muscleColor[ex.muscle] ?? '#b6f23e';
  const load = loadOf(ex);
  const progress = exerciseProgress(sessions, ex.id, mode);

  const bestE1rm = progress.length ? Math.max(...progress.map((p) => p.e1rm)) : 0;
  const lastPoint = progress[progress.length - 1];
  const perDumbbell = load === 'mancuerna';

  return (
    <div className="animate-fade">
      <Header title={ex.name} subtitle={`${ex.muscle} · ${LOAD_LABEL[load]}`} back />

      <div className="px-4 space-y-4">
        {/* Resumen prescripción */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <Spec Icon={Layers} label="Series" value={String(ex.sets)} color={color} />
            <Spec Icon={Repeat} label="Reps" value={ex.reps} color={color} />
            <Spec Icon={Timer} label="Descanso" value={ex.rest} color={color} />
            <Spec Icon={Dumbbell} label="Carga" value={LOAD_LABEL[load]} color={color} />
          </div>
        </Card>

        {/* Técnica (solo si la hay) */}
        {ex.how && (
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={18} className="text-accent" />
              <h3 className="font-bold">Cómo hacerlo</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-fg/90">{ex.how}</p>
          </Card>
        )}

        {/* Cues (solo si los hay) */}
        {ex.cues.length > 0 && (
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
        )}

        {/* Progreso */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              <h3 className="font-bold">Tu progreso</h3>
            </div>
            {bestE1rm > 0 && (
              <span className="text-sm font-bold" style={{ color }}>
                Récord {Math.round(bestE1rm)} kg
              </span>
            )}
          </div>

          {progress.length > 0 ? (
            <>
              <Segmented
                value={mode}
                onChange={(v) => setMode(v)}
                options={[
                  { label: 'Por fecha', value: 'fecha' },
                  { label: 'Por semana', value: 'semana' },
                ]}
              />

              {/* Fuerza estimada (1RM) */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">
                    Fuerza estimada (1RM)
                  </span>
                  {lastPoint && (
                    <span className="text-sm font-bold" style={{ color }}>
                      {Math.round(lastPoint.e1rm)} kg
                    </span>
                  )}
                </div>
                <Sparkline data={progress.map((p) => ({ x: p.key, y: p.e1rm }))} color={color} />
              </div>

              {/* Volumen */}
              <div className="mt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-faint">
                    Volumen ({mode === 'semana' ? 'por semana' : 'por sesión'})
                  </span>
                  {lastPoint && (
                    <span className="text-sm font-bold text-health">{lastPoint.volume.toLocaleString('es-ES')} kg</span>
                  )}
                </div>
                <Sparkline data={progress.map((p) => ({ x: p.key, y: p.volume }))} color="var(--color-health)" />
              </div>

              {/* Tabla */}
              <div className="mt-5">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-faint">
                  <span>{mode === 'semana' ? 'Semana' : 'Fecha'}</span>
                  <span className="text-right">Peso×reps</span>
                  <span className="text-right">1RM</span>
                  <span className="text-right">Vol.</span>
                </div>
                {progress
                  .slice(-8)
                  .reverse()
                  .map((p, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-3 text-sm py-1.5 border-b border-line last:border-0"
                    >
                      <span className="text-muted">{p.label}</span>
                      <span className="text-right font-semibold tabular-nums">
                        {p.weight}×{p.reps}
                      </span>
                      <span className="text-right font-semibold tabular-nums" style={{ color }}>
                        {Math.round(p.e1rm)}
                      </span>
                      <span className="text-right text-faint tabular-nums">{p.volume.toLocaleString('es-ES')}</span>
                    </div>
                  ))}
              </div>

              <p className="text-[12px] text-faint mt-3 leading-relaxed">
                1RM estimado (fórmula de Epley) combina peso y repeticiones, así ves tu progreso real.
                {perDumbbell ? ' El peso es por mancuerna.' : ''}
              </p>
            </>
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
      <p className="text-[15px] font-bold leading-none truncate">{value}</p>
      <p className="text-[11px] text-muted mt-1">{label}</p>
    </div>
  );
}
