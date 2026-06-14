import { useState } from 'react';
import { Flame, Pencil, Target, ChevronRight, Clock } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, Segmented, SectionTitle } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';
import { Sheet } from '../components/Sheet';
import { useMenu, useSettings } from '../lib/store';
import { menuTotals } from '../data/weeklyMenu';
import { weekdayOf, WEEKDAYS, WEEKDAYS_LONG } from '../lib/date';
import type { Meal } from '../types';

export function Nutrition() {
  const { macros, setMacros } = useSettings();
  const { menu, updateMeal } = useMenu();
  const [view, setView] = useState<'dia' | 'semana'>('dia');
  const [selDay, setSelDay] = useState(weekdayOf());
  const [editTargets, setEditTargets] = useState(false);
  const [editMeal, setEditMeal] = useState<{ weekday: number; meal: Meal } | null>(null);

  const dayMenu = menu.find((m) => m.weekday === selDay)!;
  const totals = menuTotals(dayMenu);

  return (
    <div className="animate-fade">
      <Header title="Nutrición" subtitle="Tu plan de comidas" />

      <div className="px-4 space-y-5">
        {/* Objetivos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-food" />
              <h3 className="font-bold">Mis objetivos</h3>
            </div>
            <button
              onClick={() => setEditTargets(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-food active:scale-95"
            >
              <Pencil size={15} /> Ajustar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-ink-2 p-4">
              <p className="text-3xl font-extrabold">
                {macros.calories}
                <span className="text-sm text-faint font-semibold"> kcal</span>
              </p>
              <p className="text-[12px] text-muted mt-1">Calorías diarias</p>
            </div>
            <div className="rounded-2xl bg-ink-2 p-4">
              <p className="text-3xl font-extrabold">
                {macros.bodyFatTarget}
                <span className="text-sm text-faint font-semibold"> %</span>
              </p>
              <p className="text-[12px] text-muted mt-1">% grasa objetivo</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <TargetMacro label="Proteína" value={macros.protein} color="#7ee0c0" />
            <TargetMacro label="Carbos" value={macros.carbs} color="#ffb454" />
            <TargetMacro label="Grasa" value={macros.fat} color="#ff9fd0" />
          </div>
        </Card>

        <Segmented
          value={view}
          onChange={(v) => setView(v)}
          options={[
            { label: 'Día', value: 'dia' },
            { label: 'Semana', value: 'semana' },
          ]}
        />

        {view === 'dia' ? (
          <>
            {/* Selector de día */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelDay(d)}
                  className={`flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors ${
                    d === selDay ? 'bg-food text-ink' : 'bg-card border border-line text-muted'
                  }`}
                >
                  {WEEKDAYS[d - 1]}
                </button>
              ))}
            </div>

            {/* Totales del día */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
                    {WEEKDAYS_LONG[selDay - 1]}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    {totals.kcal}
                    <span className="text-base text-muted font-semibold"> / {macros.calories} kcal</span>
                  </h3>
                  <p className={`text-sm mt-1 font-semibold ${totals.kcal > macros.calories ? 'text-danger' : 'text-accent'}`}>
                    {totals.kcal > macros.calories
                      ? `+${totals.kcal - macros.calories} kcal sobre objetivo`
                      : `${macros.calories - totals.kcal} kcal por debajo`}
                  </p>
                </div>
                <ProgressRing value={macros.calories ? totals.kcal / macros.calories : 0} size={70} color="var(--color-food)">
                  <Flame size={22} className="text-food" />
                </ProgressRing>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <MacroMini label="P" value={totals.protein} target={macros.protein} color="#7ee0c0" />
                <MacroMini label="C" value={totals.carbs} target={macros.carbs} color="#ffb454" />
                <MacroMini label="G" value={totals.fat} target={macros.fat} color="#ff9fd0" />
              </div>
            </Card>

            {/* Comidas */}
            <div>
              <SectionTitle>Comidas</SectionTitle>
              <div className="space-y-3">
                {dayMenu.meals.map((meal) => (
                  <Card key={meal.id} className="p-4" onClick={() => setEditMeal({ weekday: selDay, meal })}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{meal.name}</h3>
                          <span className="flex items-center gap-1 text-[12px] text-faint">
                            <Clock size={12} /> {meal.time}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {meal.items.map((it, i) => (
                            <li key={i} className="text-[14px] text-fg/85 flex justify-between gap-3">
                              <span className="truncate">{it.name}</span>
                              {it.qty && <span className="text-faint shrink-0">{it.qty}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Pencil size={15} className="text-faint shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line text-[12px]">
                      <span className="font-bold text-food">{meal.kcal} kcal</span>
                      <span className="text-faint">·</span>
                      <span className="text-muted">P {meal.protein}</span>
                      <span className="text-muted">C {meal.carbs}</span>
                      <span className="text-muted">G {meal.fat}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {menu.map((dm) => {
              const t = menuTotals(dm);
              return (
                <Card
                  key={dm.weekday}
                  className="p-4 flex items-center gap-4"
                  onClick={() => {
                    setSelDay(dm.weekday);
                    setView('dia');
                  }}
                >
                  <div className="grid place-items-center h-12 w-12 rounded-2xl bg-ink-2 shrink-0">
                    <span className="font-bold text-food">{WEEKDAYS[dm.weekday - 1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold">{WEEKDAYS_LONG[dm.weekday - 1]}</h3>
                    <p className="text-[13px] text-muted">
                      {t.kcal} kcal · P{t.protein} C{t.carbs} G{t.fat}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-faint" />
                </Card>
              );
            })}
          </div>
        )}
        <div className="h-2" />
      </div>

      {/* Sheet objetivos */}
      <Sheet open={editTargets} onClose={() => setEditTargets(false)} title="Ajustar objetivos">
        <div className="space-y-4">
          <Field label="Calorías diarias (kcal)" value={macros.calories} onChange={(v) => setMacros({ calories: v })} />
          <Field label="Proteína (g)" value={macros.protein} onChange={(v) => setMacros({ protein: v })} />
          <Field label="Carbohidratos (g)" value={macros.carbs} onChange={(v) => setMacros({ carbs: v })} />
          <Field label="Grasa (g)" value={macros.fat} onChange={(v) => setMacros({ fat: v })} />
          <Field label="% grasa corporal objetivo" value={macros.bodyFatTarget} onChange={(v) => setMacros({ bodyFatTarget: v })} />
          <p className="text-[13px] text-muted leading-relaxed">
            Referencia: 1 g proteína = 4 kcal · 1 g carbos = 4 kcal · 1 g grasa = 9 kcal.
            Tus macros suman <b className="text-fg">{macros.protein * 4 + macros.carbs * 4 + macros.fat * 9} kcal</b>.
          </p>
          <button
            onClick={() => setEditTargets(false)}
            className="w-full rounded-2xl bg-food text-ink py-3.5 font-bold"
          >
            Guardar
          </button>
        </div>
      </Sheet>

      {/* Sheet editar comida */}
      {editMeal && (
        <MealEditor
          weekday={editMeal.weekday}
          meal={editMeal.meal}
          onSave={(patch) => {
            updateMeal(editMeal.weekday, editMeal.meal.id, patch);
            setEditMeal(null);
          }}
          onClose={() => setEditMeal(null)}
        />
      )}
    </div>
  );
}

function MealEditor({
  weekday,
  meal,
  onSave,
  onClose,
}: {
  weekday: number;
  meal: Meal;
  onSave: (patch: Partial<Meal>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(meal.name);
  const [time, setTime] = useState(meal.time);
  const [kcal, setKcal] = useState(meal.kcal);
  const [protein, setProtein] = useState(meal.protein);
  const [carbs, setCarbs] = useState(meal.carbs);
  const [fat, setFat] = useState(meal.fat);
  const [itemsText, setItemsText] = useState(
    meal.items.map((it) => (it.qty ? `${it.name} | ${it.qty}` : it.name)).join('\n')
  );

  return (
    <Sheet open onClose={onClose} title="Editar comida">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-semibold text-muted">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-food/60"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted">Hora</label>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-food/60"
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-muted">
            Alimentos (uno por línea, usa <code className="text-fg">|</code> para la cantidad)
          </label>
          <textarea
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-xl bg-ink-2 border border-line px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-food/60"
            placeholder={'Pechuga de pollo | 180 g\nArroz | 80 g'}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Field small label="kcal" value={kcal} onChange={setKcal} />
          <Field small label="Prot." value={protein} onChange={setProtein} />
          <Field small label="Carb." value={carbs} onChange={setCarbs} />
          <Field small label="Grasa" value={fat} onChange={setFat} />
        </div>

        <button
          onClick={() => {
            const items = itemsText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => {
                const [n, q] = l.split('|');
                return { name: n.trim(), qty: q?.trim() };
              });
            onSave({ name, time, kcal, protein, carbs, fat, items });
          }}
          className="w-full rounded-2xl bg-food text-ink py-3.5 font-bold"
        >
          Guardar comida
        </button>
        <p className="text-center text-[12px] text-muted">Día: {WEEKDAYS_LONG[weekday - 1]}</p>
      </div>
    </Sheet>
  );
}

function Field({
  label,
  value,
  onChange,
  small,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  small?: boolean;
}) {
  return (
    <div>
      <label className={`font-semibold text-muted ${small ? 'text-[11px]' : 'text-[13px]'}`}>{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`mt-1 w-full rounded-xl bg-ink-2 border border-line text-center font-bold outline-none focus:border-food/60 ${
          small ? 'h-12 text-base' : 'h-12 text-lg'
        }`}
      />
    </div>
  );
}

function TargetMacro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl bg-ink-2 p-3 text-center">
      <p className="text-xl font-bold" style={{ color }}>
        {value}
        <span className="text-xs text-faint font-medium">g</span>
      </p>
      <p className="text-[11px] text-muted mt-0.5">{label}</p>
    </div>
  );
}

function MacroMini({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = target ? Math.min(1, value / target) : 0;
  return (
    <div className="rounded-2xl bg-ink-2 p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-bold" style={{ color }}>
          {label}
        </span>
        <span className="text-[12px] text-faint">
          {value}/{target}g
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
