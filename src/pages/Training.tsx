import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronRight,
  Dumbbell,
  Clock,
  ListChecks,
  Pencil,
  GripVertical,
  History,
  RotateCcw,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card, Segmented, SectionTitle } from '../components/ui';
import { useSettings, useWorkout, usePlan, sessionKey } from '../lib/store';
import { getPlan } from '../data/workoutPlans';
import { sessionProgress, muscleColor, estimatedMinutes, effectivePlan } from '../lib/workout';
import { isoDate, weekdayOf, WEEKDAYS } from '../lib/date';

export function Training() {
  const { daysPerWeek, setDaysPerWeek } = useSettings();
  const sessions = useWorkout((s) => s.sessions);
  const overrides = usePlan((s) => s.weekdayOverride);
  const assignWeekday = usePlan((s) => s.assignWeekday);
  const clearOverrides = usePlan((s) => s.clearOverrides);

  const [edit, setEdit] = useState(false);
  const plan = effectivePlan(getPlan(daysPerWeek), overrides);
  const today = isoDate();
  const wd = weekdayOf();
  const effList = plan.days.map((d) => ({ id: d.id, weekday: d.weekday }));

  return (
    <div className="animate-fade">
      <Header
        title="Entreno"
        subtitle={plan.title}
        right={
          <button
            onClick={() => setEdit((e) => !e)}
            className={`flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold active:scale-95 ${
              edit ? 'bg-accent text-ink' : 'bg-card border border-line text-fg'
            }`}
          >
            {edit ? <Check size={16} /> : <Pencil size={15} />}
            {edit ? 'Listo' : 'Editar'}
          </button>
        }
      />

      <div className="px-4 space-y-5">
        <div>
          <SectionTitle>Días por semana</SectionTitle>
          <Segmented
            value={daysPerWeek}
            onChange={(v) => setDaysPerWeek(v as 3 | 4 | 5)}
            options={[
              { label: '3 días', value: 3 },
              { label: '4 días', value: 4 },
              { label: '5 días', value: 5 },
            ]}
          />
          <p className="text-sm text-muted mt-2 px-1">{plan.subtitle}</p>
        </div>

        {/* Tira semanal */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => {
            const day = plan.days.find((x) => x.weekday === d);
            const isToday = d === wd;
            return (
              <div
                key={d}
                className={`flex-1 rounded-2xl py-2.5 text-center border ${
                  isToday ? 'border-accent/60 bg-accent/10' : 'border-line bg-card/40'
                }`}
              >
                <div className={`text-[11px] font-semibold ${isToday ? 'text-accent' : 'text-faint'}`}>
                  {WEEKDAYS[d - 1]}
                </div>
                <div className="mt-1.5 grid place-items-center">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: day ? muscleColor[day.exercises[0].muscle] ?? '#b6f23e' : 'var(--color-line-strong)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <SectionTitle
            action={
              edit ? (
                <button
                  onClick={clearOverrides}
                  className="flex items-center gap-1 text-[12px] font-semibold text-muted active:text-fg"
                >
                  <RotateCcw size={13} /> Restablecer
                </button>
              ) : (
                <Link to="/entreno/historial" className="flex items-center gap-1 text-[12px] font-semibold text-accent">
                  <History size={13} /> Historial
                </Link>
              )
            }
          >
            Tus sesiones
          </SectionTitle>

          {edit && (
            <p className="text-[13px] text-muted px-1 mb-3 -mt-1">
              Cambia el día de cada sesión. Si el día está ocupado, se intercambian.
            </p>
          )}

          <div className="space-y-3">
            {plan.days.map((day) => {
              const sess = sessions[sessionKey(today, day.id)];
              const prog = sessionProgress(sess);
              const done = prog.total > 0 && prog.pct >= 1;
              const muscles = [...new Set(day.exercises.map((e) => e.muscle))];
              const color = muscleColor[day.exercises[0].muscle] ?? '#b6f23e';

              const inner = (
                <Card className={`p-4 flex items-center gap-4 ${!edit ? 'active:scale-[0.99] transition-transform' : ''}`}>
                  <div
                    className="grid place-items-center h-12 w-12 rounded-2xl shrink-0"
                    style={{ backgroundColor: 'color-mix(in srgb, ' + color + ' 16%, transparent)' }}
                  >
                    {edit ? (
                      <GripVertical size={22} style={{ color }} />
                    ) : done ? (
                      <Check size={22} className="text-accent" />
                    ) : (
                      <Dumbbell size={22} style={{ color }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                        {WEEKDAYS[day.weekday - 1]}
                      </span>
                      {prog.done > 0 && !done && (
                        <span className="text-[11px] font-semibold text-accent">
                          {prog.done}/{prog.total}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg leading-tight truncate">{day.name}</h3>
                    {edit ? (
                      <select
                        value={day.weekday}
                        onChange={(e) => assignWeekday(effList, day.id, Number(e.target.value))}
                        className="mt-2 w-full h-10 rounded-xl bg-ink-2 border border-line px-3 font-semibold text-fg outline-none focus:border-accent/60"
                      >
                        {WEEKDAYS.map((w, i) => (
                          <option key={i} value={i + 1}>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <p className="text-[13px] text-muted truncate">{muscles.join(' · ')}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-faint">
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> ≈ {estimatedMinutes(day)} min
                          </span>
                          <span className="flex items-center gap-1">
                            <ListChecks size={13} /> {day.exercises.length} ejercicios
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {!edit && <ChevronRight size={20} className="text-faint shrink-0" />}
                </Card>
              );

              return edit ? (
                <div key={day.id}>{inner}</div>
              ) : (
                <Link key={day.id} to={`/entreno/sesion/${day.id}`}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
