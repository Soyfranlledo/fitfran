import { Dumbbell, Flame, CalendarCheck, TrendingUp, Trophy, type LucideIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, SectionTitle } from '../components/ui';
import { Sparkline } from '../components/Sparkline';
import { useWorkout } from '../lib/store';
import { PLANS } from '../data/workoutPlans';
import { isoDate, shortDate, startOfWeek, prettyDate } from '../lib/date';
import type { WorkoutSession } from '../types';

function dayName(dayId: string): string {
  for (const p of Object.values(PLANS)) {
    const d = p.days.find((x) => x.id === dayId);
    if (d) return d.name;
  }
  return 'Sesión';
}

function sessionVolume(s: WorkoutSession): number {
  let vol = 0;
  for (const log of Object.values(s.logs)) {
    for (const set of log.sets) {
      if (set.weight > 0 && set.reps > 0) vol += set.weight * set.reps;
    }
  }
  return vol;
}

function setsDone(s: WorkoutSession): number {
  let n = 0;
  for (const log of Object.values(s.logs)) n += log.sets.filter((st) => st.done).length;
  return n;
}

export function TrainingHistory() {
  const sessions = useWorkout((s) => s.sessions);

  const all = Object.values(sessions)
    .map((s) => ({ s, vol: sessionVolume(s), done: setsDone(s) }))
    .filter((x) => x.vol > 0 || x.s.completedAt)
    .sort((a, b) => (a.s.date < b.s.date ? 1 : -1));

  const completed = all.filter((x) => x.s.completedAt);
  const totalVol = all.reduce((acc, x) => acc + x.vol, 0);
  const weekStart = isoDate(startOfWeek());
  const thisWeek = all.filter((x) => x.s.date >= weekStart).length;
  const best = all.reduce((m, x) => Math.max(m, x.vol), 0);

  const trend = [...all].reverse().slice(-14).map((x) => ({ x: x.s.date, y: Math.round(x.vol) }));

  return (
    <div className="animate-fade">
      <Header title="Historial" subtitle="Tu progreso" back />

      <div className="px-4 space-y-5">
        {all.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-full bg-card-2 text-faint mb-4">
              <Dumbbell size={28} />
            </div>
            <h3 className="font-bold text-lg">Aún no hay registros</h3>
            <p className="text-muted text-sm mt-1">
              Cuando entrenes y anotes pesos, aquí verás tu historial, el volumen total y tu evolución.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat Icon={CalendarCheck} color="#b6f23e" label="Sesiones hechas" value={String(completed.length)} />
              <Stat Icon={Flame} color="#ffb454" label="Esta semana" value={String(thisWeek)} />
              <Stat Icon={Dumbbell} color="#5ec8ff" label="Volumen total" value={`${Math.round(totalVol).toLocaleString('es-ES')} kg`} />
              <Stat Icon={Trophy} color="#c89bff" label="Mejor sesión" value={`${Math.round(best).toLocaleString('es-ES')} kg`} />
            </div>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-accent" />
                <h3 className="font-bold">Volumen por sesión</h3>
              </div>
              <Sparkline data={trend} color="#b6f23e" />
              <p className="text-[12px] text-faint mt-2 text-center">
                Volumen = peso × repeticiones de todas las series. Subir con el tiempo = progreso.
              </p>
            </Card>

            <div>
              <SectionTitle>Sesiones</SectionTitle>
              <div className="space-y-2.5">
                {all.map(({ s, vol, done }) => (
                  <Card key={`${s.date}-${s.dayId}`} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold truncate">{dayName(s.dayId)}</h3>
                        <p className="text-[12px] text-muted capitalize">{prettyDate(s.date)}</p>
                      </div>
                      {s.completedAt ? (
                        <span className="text-[11px] font-bold text-accent bg-accent/15 rounded-full px-2.5 py-1 shrink-0">
                          Completada
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-faint shrink-0">{shortDate(s.date)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line text-[13px]">
                      <span className="text-muted">
                        <b className="text-fg">{Math.round(vol).toLocaleString('es-ES')}</b> kg vol.
                      </span>
                      <span className="text-muted">
                        <b className="text-fg">{done}</b> series
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="h-2" />
      </div>
    </div>
  );
}

function Stat({
  Icon,
  color,
  label,
  value,
}: {
  Icon: LucideIcon;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-card border border-line p-4">
      <span style={{ color }} className="inline-block mb-2">
        <Icon size={20} />
      </span>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-[12px] text-muted mt-1.5">{label}</p>
    </div>
  );
}
