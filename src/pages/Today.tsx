import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Dumbbell,
  Flame,
  Moon,
  Footprints,
  ChevronRight,
  Check,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';
import { useHealth, useMenu, useSettings, useWorkout, usePlan, sessionKey } from '../lib/store';
import { getPlan } from '../data/workoutPlans';
import { dayForWeekday, sessionProgress, effectivePlan } from '../lib/workout';
import { menuTotals } from '../data/weeklyMenu';
import { isoDate, weekdayOf } from '../lib/date';

export function Today() {
  const { profile, daysPerWeek, macros } = useSettings();
  const sessions = useWorkout((s) => s.sessions);
  const menu = useMenu((s) => s.menu);
  const entries = useHealth((s) => s.entries);

  const overrides = usePlan((s) => s.weekdayOverride);
  const today = isoDate();
  const wd = weekdayOf();
  const plan = effectivePlan(getPlan(daysPerWeek), overrides);
  const todayDay = dayForWeekday(plan, wd);
  const session = todayDay ? sessions[sessionKey(today, todayDay.id)] : undefined;
  const prog = sessionProgress(session);

  const todayMenu = menu.find((m) => m.weekday === wd);
  const totals = todayMenu ? menuTotals(todayMenu) : { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  const latest = Object.values(entries).sort((a, b) => (a.date < b.date ? 1 : -1))[0];

  const hour = new Date().getHours();
  const greet = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="animate-fade">
      <header className="safe-top px-5 pt-5 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
            {greet}
          </p>
          <h1 className="text-[30px] font-extrabold tracking-tight">{profile.name}</h1>
        </div>
        <Link
          to="/ajustes"
          className="grid place-items-center h-11 w-11 rounded-full bg-card border border-line text-muted active:scale-95"
        >
          <SettingsIcon size={20} />
        </Link>
      </header>

      <div className="px-4 space-y-4 mt-2">
        {/* ENTRENO DE HOY */}
        <Link to={todayDay ? `/entreno/sesion/${todayDay.id}` : '/entreno'}>
          <Card className="p-5 active:scale-[0.99] transition-transform">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
                  Entreno de hoy
                </p>
                {todayDay ? (
                  <>
                    <h3 className="text-2xl font-bold mt-1 truncate">{todayDay.name}</h3>
                    <p className="text-muted text-sm mt-0.5">
                      {todayDay.exercises.length} ejercicios + {todayDay.alternatives?.length ?? 0} alternativas
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mt-1">Día de descanso</h3>
                    <p className="text-muted text-sm mt-0.5">Recupera. Toca para ver el plan.</p>
                  </>
                )}
              </div>
              {todayDay ? (
                <ProgressRing value={prog.pct} size={66}>
                  {prog.pct >= 1 ? (
                    <Check className="text-accent" size={26} />
                  ) : (
                    <div className="text-center leading-none">
                      <div className="text-lg font-extrabold">{prog.done}</div>
                      <div className="text-[10px] text-faint">/{prog.total}</div>
                    </div>
                  )}
                </ProgressRing>
              ) : (
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-card-2 text-accent">
                  <Moon size={24} />
                </div>
              )}
            </div>
            {todayDay && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-accent text-ink font-bold py-3 justify-center">
                <Dumbbell size={18} />
                {prog.done === 0 ? 'Empezar entreno' : prog.pct >= 1 ? 'Entreno completado' : 'Continuar entreno'}
              </div>
            )}
          </Card>
        </Link>

        {/* NUTRICIÓN DE HOY */}
        <Link to="/nutricion">
          <Card className="p-5 active:scale-[0.99] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
                  Nutrición de hoy
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {totals.kcal}
                  <span className="text-base text-muted font-semibold"> / {macros.calories} kcal</span>
                </h3>
              </div>
              <ProgressRing value={macros.calories ? totals.kcal / macros.calories : 0} size={66} color="var(--color-food)">
                <Flame className="text-food" size={22} />
              </ProgressRing>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Macro label="Proteína" value={totals.protein} target={macros.protein} color="#7ee0c0" />
              <Macro label="Carbos" value={totals.carbs} target={macros.carbs} color="#ffb454" />
              <Macro label="Grasa" value={totals.fat} target={macros.fat} color="#ff9fd0" />
            </div>
          </Card>
        </Link>

        {/* SALUD */}
        <Link to="/salud">
          <Card className="p-4 active:scale-[0.99] transition-transform">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
                Salud
              </p>
              <ChevronRight size={18} className="text-faint" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <HealthStat Icon={Flame} color="var(--color-health)" label="Peso" value={latest?.weight ? `${latest.weight}` : '—'} unit="kg" />
              <HealthStat Icon={Footprints} color="#b6f23e" label="Pasos" value={latest?.steps ? `${(latest.steps / 1000).toFixed(1)}k` : '—'} unit="" />
              <HealthStat Icon={Moon} color="#c89bff" label="Sueño" value={latest?.sleepHours ? `${latest.sleepHours}` : '—'} unit="h" />
            </div>
          </Card>
        </Link>

        <Link
          to="/entreno"
          className="flex items-center justify-between rounded-3xl border border-line bg-card/50 px-5 py-4 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <CalendarDays size={20} className="text-accent" />
            <span className="font-semibold">Ver plan semanal</span>
          </div>
          <ChevronRight size={18} className="text-faint" />
        </Link>
      </div>
    </div>
  );
}

function Macro({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target ? Math.min(1, value / target) : 0;
  return (
    <div className="rounded-2xl bg-ink-2 p-3">
      <p className="text-[11px] text-muted font-medium">{label}</p>
      <p className="text-base font-bold mt-0.5">
        {value}
        <span className="text-xs text-faint font-medium">/{target}g</span>
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function HealthStat({
  Icon,
  color,
  label,
  value,
  unit,
}: {
  Icon: LucideIcon;
  color: string;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-ink-2 p-3">
      <span style={{ color }} className="block mb-2">
        <Icon size={18} />
      </span>
      <p className="text-xl font-bold leading-none">
        {value}
        <span className="text-xs text-faint font-medium"> {unit}</span>
      </p>
      <p className="text-[11px] text-muted mt-1">{label}</p>
    </div>
  );
}
