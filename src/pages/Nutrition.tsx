import { useRef, useState } from 'react';
import {
  Flame, Pencil, Target, ChevronRight, Clock, Calculator,
  Plus, Mic, Square, Trash2, Sparkles, X, Check, AlertCircle, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card, Segmented, SectionTitle } from '../components/ui';
import { ProgressRing } from '../components/ProgressRing';
import { Sheet } from '../components/Sheet';
import { useMenu, useSettings, useHealth, useFoodLog, foodLogTotals, newFoodEntryId } from '../lib/store';
import { menuTotals } from '../data/weeklyMenu';
import { computeTargets, type CalcResult } from '../lib/nutrition';
import { hasAIKey, transcribeAudio, analyzeMeal, sumItems, type AnalyzedItem } from '../lib/ai';
import { weekdayOf, WEEKDAYS, WEEKDAYS_LONG, isoDate } from '../lib/date';
import type { Meal, Profile, FoodLogEntry } from '../types';

export function Nutrition() {
  const { macros, setMacros, profile, setProfile } = useSettings();
  const { menu, updateMeal } = useMenu();
  const healthEntries = useHealth((s) => s.entries);
  const [tab, setTab] = useState<'diario' | 'menu'>('diario');
  const [view, setView] = useState<'dia' | 'semana'>('dia');
  const [selDay, setSelDay] = useState(weekdayOf());
  const [editTargets, setEditTargets] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [editMeal, setEditMeal] = useState<{ weekday: number; meal: Meal } | null>(null);

  const latestWeight = Object.values(healthEntries)
    .filter((e) => e.weight != null)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0]?.weight;

  const dayMenu = menu.find((m) => m.weekday === selDay)!;
  const totals = menuTotals(dayMenu);

  return (
    <div className="animate-fade">
      <Header title="Nutrición" subtitle="Objetivos, tu día y el menú" />

      <div className="px-4 space-y-5">
        {/* Objetivos */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-food" />
              <h3 className="font-bold">Mis objetivos</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCalc(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-health active:scale-95"
              >
                <Calculator size={15} /> Calcular
              </button>
              <button
                onClick={() => setEditTargets(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-food active:scale-95"
              >
                <Pencil size={15} /> Ajustar
              </button>
            </div>
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
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            { label: 'Mi día', value: 'diario' },
            { label: 'Menú', value: 'menu' },
          ]}
        />

        {tab === 'diario' ? (
          <FoodDiary />
        ) : (
          <>
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
                  <SectionTitle>Comidas del menú</SectionTitle>
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
          </>
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

      {/* Sheet calculadora */}
      <CalcSheet
        open={showCalc}
        onClose={() => setShowCalc(false)}
        profile={profile}
        startWeight={latestWeight ?? 80}
        onApply={(r, p) => {
          setMacros({ calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat });
          setProfile(p);
          setShowCalc(false);
        }}
      />

      {/* Sheet editar comida del menú */}
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

/* ============================ Diario de comidas (Mi día) ============================ */
function FoodDiary() {
  const macros = useSettings((s) => s.macros);
  const allEntries = useFoodLog((s) => s.entries);
  const removeEntry = useFoodLog((s) => s.removeEntry);
  const today = isoDate();
  const entries = allEntries[today] ?? [];
  const totals = foodLogTotals(entries);
  const [capture, setCapture] = useState(false);
  const [editing, setEditing] = useState<FoodLogEntry | null>(null);

  const over = totals.kcal > macros.calories;

  return (
    <div className="space-y-4">
      {/* Totales de hoy (comido vs objetivo) */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">Hoy · comido</p>
            <h3 className="text-2xl font-bold mt-1">
              {totals.kcal}
              <span className="text-base text-muted font-semibold"> / {macros.calories} kcal</span>
            </h3>
            <p className={`text-sm mt-1 font-semibold ${over ? 'text-danger' : 'text-accent'}`}>
              {over
                ? `+${totals.kcal - macros.calories} kcal sobre objetivo`
                : `${macros.calories - totals.kcal} kcal disponibles`}
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

      {/* Botón añadir */}
      <button
        onClick={() => { setEditing(null); setCapture(true); }}
        className="w-full rounded-2xl bg-food text-ink py-3.5 font-bold flex items-center justify-center gap-2 active:scale-[0.99]"
      >
        <Mic size={18} /> Registrar comida por voz
      </button>

      {/* Entradas de hoy */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          <SectionTitle>Lo que has comido hoy</SectionTitle>
          {entries.map((e) => (
            <Card key={e.id} className="p-4" onClick={() => { setEditing(e); setCapture(true); }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{e.title || 'Comida'}</h3>
                    {e.time && (
                      <span className="flex items-center gap-1 text-[12px] text-faint">
                        <Clock size={12} /> {e.time}
                      </span>
                    )}
                    {e.source === 'voz' && <Mic size={12} className="text-food" />}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {e.items.map((it, i) => (
                      <li key={i} className="text-[14px] text-fg/85 flex justify-between gap-3">
                        <span className="truncate">{it.name}</span>
                        <span className="text-faint shrink-0">
                          {it.qty ? `${it.qty} · ` : ''}{it.kcal} kcal
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (confirm('¿Quitar esta comida del registro de hoy?')) removeEntry(today, e.id);
                  }}
                  className="grid place-items-center h-9 w-9 rounded-full bg-card-2 text-faint shrink-0 active:scale-95 active:text-danger"
                  aria-label="Quitar comida"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line text-[12px]">
                <span className="font-bold text-food">{e.kcal} kcal</span>
                <span className="text-faint">·</span>
                <span className="text-muted">P {e.protein}</span>
                <span className="text-muted">C {e.carbs}</span>
                <span className="text-muted">G {e.fat}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <Sparkles size={26} className="text-food mx-auto mb-2" />
          <p className="text-[15px] font-semibold">Registra lo que comes</p>
          <p className="text-[13px] text-muted mt-1 leading-relaxed">
            Dile a la app por voz lo que has comido (con cantidades) y calcula calorías y macros por ti.
          </p>
        </Card>
      )}

      {capture && (
        <FoodCaptureSheet
          date={today}
          editing={editing}
          onClose={() => { setCapture(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------- Captura de comida (voz / manual) ---------------------- */
type CaptureStage = 'input' | 'recording' | 'working' | 'review' | 'error';

function pickAudioMime(): string {
  const cands = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg'];
  const MR: any = typeof MediaRecorder !== 'undefined' ? MediaRecorder : null;
  if (MR?.isTypeSupported) {
    for (const m of cands) if (MR.isTypeSupported(m)) return m;
  }
  return '';
}

function FoodCaptureSheet({
  date,
  editing,
  onClose,
}: {
  date: string;
  editing: FoodLogEntry | null;
  onClose: () => void;
}) {
  const addEntry = useFoodLog((s) => s.addEntry);
  const updateEntry = useFoodLog((s) => s.updateEntry);

  const [stage, setStage] = useState<CaptureStage>(editing ? 'review' : 'input');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState('');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [items, setItems] = useState<AnalyzedItem[]>(
    editing ? editing.items.map((it) => ({ ...it, qty: it.qty ?? '' })) : []
  );

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const keyMissing = !hasAIKey();

  const totals = sumItems(items);

  async function startRecording() {
    setError('');
    if (keyMissing) { setError('Añade tu clave de OpenAI en Ajustes para usar la voz.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => { if (ev.data.size) chunksRef.current.push(ev.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime || 'audio/webm' });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        void processAudio(blob);
      };
      recRef.current = rec;
      rec.start();
      setStage('recording');
    } catch {
      setError('No se pudo acceder al micrófono. Revisa los permisos.');
      setStage('error');
    }
  }

  function stopRecording() {
    recRef.current?.stop();
    setStage('working');
    setWorking('Transcribiendo…');
  }

  async function processAudio(blob: Blob) {
    try {
      setStage('working');
      setWorking('Transcribiendo…');
      const transcript = await transcribeAudio(blob);
      if (!transcript) throw new Error('No se entendió el audio. Inténtalo de nuevo.');
      setText(transcript);
      setWorking('Calculando calorías…');
      const result = await analyzeMeal(transcript);
      setTitle(result.title);
      setItems(result.items);
      setStage('review');
    } catch (e: any) {
      setError(e?.message || 'Algo salió mal.');
      setStage('error');
    }
  }

  async function analyzeText() {
    setError('');
    if (keyMissing) { setError('Añade tu clave de OpenAI en Ajustes para calcular macros.'); return; }
    const clean = text.trim();
    if (!clean) return;
    try {
      setStage('working');
      setWorking('Calculando calorías…');
      const result = await analyzeMeal(clean);
      setTitle(result.title);
      setItems(result.items);
      setStage('review');
    } catch (e: any) {
      setError(e?.message || 'Algo salió mal.');
      setStage('error');
    }
  }

  function patchItem(i: number, patch: Partial<AnalyzedItem>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeItem(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }
  function addEmptyItem() {
    setItems((arr) => [...arr, { name: '', qty: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }]);
  }

  function save() {
    const clean = items
      .map((it) => ({ ...it, name: it.name.trim() }))
      .filter((it) => it.name);
    if (!clean.length) { setError('Añade al menos un alimento.'); return; }
    const t = sumItems(clean);
    if (editing) {
      updateEntry(date, editing.id, {
        title: title.trim() || 'Comida',
        items: clean,
        kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat,
      });
    } else {
      const now = new Date();
      const entry: FoodLogEntry = {
        id: newFoodEntryId(),
        date,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        title: title.trim() || 'Comida',
        items: clean,
        kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat,
        source: text.trim() ? 'voz' : 'manual',
      };
      addEntry(entry);
    }
    onClose();
  }

  return (
    <Sheet open onClose={onClose} title={editing ? 'Editar comida' : 'Registrar comida'}>
      {keyMissing && stage === 'input' && (
        <div className="rounded-2xl bg-ink-2 border border-line p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-food shrink-0 mt-0.5" />
          <p className="text-[13px] text-muted leading-relaxed">
            Para la voz y el cálculo automático, añade tu clave de OpenAI en{' '}
            <Link to="/ajustes" className="text-food font-semibold underline" onClick={onClose}>
              Ajustes
            </Link>
            . También puedes escribir los alimentos a mano abajo.
          </p>
        </div>
      )}

      {stage === 'input' && (
        <div className="space-y-4">
          {/* Voz */}
          <div className="grid place-items-center py-2">
            <button
              onClick={startRecording}
              disabled={keyMissing}
              className="grid place-items-center h-24 w-24 rounded-full bg-food text-ink active:scale-95 disabled:opacity-40 shadow-lg"
              aria-label="Grabar"
            >
              <Mic size={40} />
            </button>
            <p className="text-[13px] text-muted mt-3 text-center max-w-[15rem]">
              Toca y di lo que has comido, con cantidades. P. ej.: «dos huevos, 60 g de avena y un plátano».
            </p>
          </div>

          <div className="flex items-center gap-3 text-faint text-[12px]">
            <div className="flex-1 h-px bg-line" /> o escríbelo <div className="flex-1 h-px bg-line" />
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Pechuga de pollo 180 g, arroz 100 g, aceite 10 ml…"
            className="w-full rounded-xl bg-ink-2 border border-line px-3 py-2.5 text-[15px] leading-relaxed outline-none focus:border-food/60"
          />
          <button
            onClick={analyzeText}
            disabled={!text.trim() || keyMissing}
            className="w-full rounded-2xl bg-food text-ink py-3.5 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={18} /> Calcular calorías
          </button>
        </div>
      )}

      {stage === 'recording' && (
        <div className="grid place-items-center py-6">
          <button
            onClick={stopRecording}
            className="grid place-items-center h-24 w-24 rounded-full bg-danger text-white active:scale-95 animate-pulse"
            aria-label="Parar"
          >
            <Square size={36} fill="currentColor" />
          </button>
          <p className="text-[14px] font-semibold mt-4">Grabando… toca para parar</p>
        </div>
      )}

      {stage === 'working' && (
        <div className="grid place-items-center py-10">
          <Loader2 size={32} className="text-food animate-spin" />
          <p className="text-[14px] font-semibold mt-4">{working}</p>
        </div>
      )}

      {stage === 'error' && (
        <div className="space-y-4 py-2">
          <div className="rounded-2xl bg-danger/10 border border-danger/30 p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
            <p className="text-[14px] text-fg/90 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => { setError(''); setStage('input'); }}
            className="w-full rounded-2xl bg-card-2 border border-line py-3 font-bold"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {stage === 'review' && (
        <div className="space-y-4">
          {!!text.trim() && (
            <p className="text-[13px] text-faint italic leading-relaxed">«{text.trim()}»</p>
          )}
          <div>
            <label className="text-[12px] font-semibold text-muted">Nombre de la comida</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Desayuno"
              className="mt-1 w-full h-11 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-food/60"
            />
          </div>

          <div className="space-y-2.5">
            {items.map((it, i) => (
              <div key={i} className="rounded-2xl bg-ink-2 border border-line p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={it.name}
                    onChange={(e) => patchItem(i, { name: e.target.value })}
                    placeholder="Alimento"
                    className="flex-1 h-10 rounded-lg bg-card border border-line px-3 font-semibold text-[15px] outline-none focus:border-food/60"
                  />
                  <input
                    value={it.qty}
                    onChange={(e) => patchItem(i, { qty: e.target.value })}
                    placeholder="cant."
                    className="w-20 h-10 rounded-lg bg-card border border-line px-2 text-center text-[14px] outline-none focus:border-food/60"
                  />
                  <button
                    onClick={() => removeItem(i)}
                    className="grid place-items-center h-10 w-9 rounded-lg text-faint active:text-danger shrink-0"
                    aria-label="Quitar"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <MiniNum label="kcal" value={it.kcal} onChange={(v) => patchItem(i, { kcal: v })} />
                  <MiniNum label="P" value={it.protein} onChange={(v) => patchItem(i, { protein: v })} />
                  <MiniNum label="C" value={it.carbs} onChange={(v) => patchItem(i, { carbs: v })} />
                  <MiniNum label="G" value={it.fat} onChange={(v) => patchItem(i, { fat: v })} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addEmptyItem}
            className="w-full rounded-xl bg-card-2 border border-line py-2.5 text-[13px] font-bold text-food flex items-center justify-center gap-1.5"
          >
            <Plus size={16} /> Añadir alimento
          </button>

          {/* Totales */}
          <div className="rounded-2xl bg-card border border-line p-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-muted">Total</span>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="font-bold text-food">{totals.kcal} kcal</span>
              <span className="text-muted">P {totals.protein}</span>
              <span className="text-muted">C {totals.carbs}</span>
              <span className="text-muted">G {totals.fat}</span>
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-danger">{error}</p>}

          <button
            onClick={save}
            className="w-full rounded-2xl bg-food text-ink py-3.5 font-bold flex items-center justify-center gap-2"
          >
            <Check size={18} /> {editing ? 'Guardar cambios' : 'Guardar en el diario'}
          </button>
        </div>
      )}
    </Sheet>
  );
}

function MiniNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-faint uppercase">{label}</label>
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-0.5 w-full h-10 rounded-lg bg-card border border-line text-center font-bold outline-none focus:border-food/60"
      />
    </div>
  );
}

function CalcSheet({
  open,
  onClose,
  profile,
  startWeight,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  startWeight: number;
  onApply: (r: CalcResult, p: Partial<Profile>) => void;
}) {
  const [sex, setSex] = useState<'h' | 'm'>(profile.sex);
  const [age, setAge] = useState(profile.age);
  const [heightCm, setHeight] = useState(profile.heightCm);
  const [weight, setWeight] = useState(startWeight);
  const [activity, setActivity] = useState<Profile['activity']>(profile.activity);
  const [adjustPct, setAdjust] = useState(-20);

  const r = computeTargets({ sex, age, heightCm, weightKg: weight, activity, adjustPct });
  const goal: Profile['goal'] = adjustPct < 0 ? 'perder' : adjustPct > 0 ? 'ganar' : 'mantener';

  return (
    <Sheet open={open} onClose={onClose} title="Calculadora de calorías">
      <div className="space-y-4">
        <p className="text-[13px] text-muted leading-relaxed -mt-1">
          Mete tus datos y la app calcula tus calorías y macros. Fórmula Mifflin-St Jeor.
        </p>

        <Segmented
          value={sex}
          onChange={(v) => setSex(v)}
          options={[
            { label: 'Hombre', value: 'h' },
            { label: 'Mujer', value: 'm' },
          ]}
        />

        <div className="grid grid-cols-3 gap-2">
          <Field small label="Edad" value={age} onChange={setAge} />
          <Field small label="Altura cm" value={heightCm} onChange={setHeight} />
          <Field small label="Peso kg" value={weight} onChange={setWeight} />
        </div>

        <div>
          <label className="text-[12px] font-semibold text-muted">Nivel de actividad</label>
          <div className="mt-1">
            <Segmented
              value={activity}
              onChange={(v) => setActivity(v)}
              options={[
                { label: 'Sedent.', value: 'sedentario' },
                { label: 'Ligero', value: 'ligero' },
                { label: 'Moder.', value: 'moderado' },
                { label: 'Alto', value: 'alto' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-semibold text-muted">Objetivo</label>
          <div className="mt-1">
            <Segmented
              value={adjustPct}
              onChange={(v) => setAdjust(v)}
              options={[
                { label: 'Perder grasa', value: -20 },
                { label: 'Mantener', value: 0 },
                { label: 'Ganar', value: 10 },
              ]}
            />
          </div>
        </div>

        {/* Resultado */}
        <div className="rounded-2xl bg-ink-2 border border-line p-4">
          <div className="flex items-center justify-between text-[13px] text-muted">
            <span>Gasto diario estimado (TDEE)</span>
            <span className="font-semibold text-fg">{r.tdee} kcal</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-[13px] text-muted">Tu objetivo</span>
            <span className="text-3xl font-extrabold text-health">
              {r.calories}
              <span className="text-sm text-faint font-semibold"> kcal</span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <CalcMacro label="Proteína" value={r.protein} color="#7ee0c0" />
            <CalcMacro label="Carbos" value={r.carbs} color="#ffb454" />
            <CalcMacro label="Grasa" value={r.fat} color="#ff9fd0" />
          </div>
        </div>

        <button
          onClick={() => onApply(r, { sex, age, heightCm, activity, goal })}
          className="w-full rounded-2xl bg-health text-ink py-3.5 font-bold"
        >
          Aplicar a mis objetivos
        </button>
      </div>
    </Sheet>
  );
}

function CalcMacro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-card p-3 text-center">
      <p className="text-lg font-bold" style={{ color }}>
        {value}
        <span className="text-xs text-faint font-medium">g</span>
      </p>
      <p className="text-[11px] text-muted mt-0.5">{label}</p>
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
