import { useState } from 'react';
import {
  Scale,
  Percent,
  Footprints,
  Moon,
  Apple,
  Plus,
  Check,
  Trash2,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card, SectionTitle, Segmented } from '../components/ui';
import { Sparkline } from '../components/Sparkline';
import { Sheet } from '../components/Sheet';
import { useHealth, useSettings } from '../lib/store';
import { isoDate, prettyDate, shortDate } from '../lib/date';
import type { HealthEntry } from '../types';

type Metric = 'weight' | 'bodyFat' | 'steps' | 'sleepHours';

const META: Record<Metric, { label: string; unit: string; color: string; Icon: LucideIcon }> = {
  weight: { label: 'Peso', unit: 'kg', color: '#5ec8ff', Icon: Scale },
  bodyFat: { label: '% Grasa', unit: '%', color: '#ff9fd0', Icon: Percent },
  steps: { label: 'Pasos', unit: '', color: '#b6f23e', Icon: Footprints },
  sleepHours: { label: 'Sueño', unit: 'h', color: '#c89bff', Icon: Moon },
};

export function Health() {
  const { entries, upsert, remove, importMany } = useHealth();
  const { macros } = useSettings();
  const today = isoDate();
  const todayEntry = entries[today] ?? { date: today };

  const [metric, setMetric] = useState<Metric>('weight');
  const [showAdd, setShowAdd] = useState(false);
  const [showApple, setShowApple] = useState(false);

  const sorted = Object.values(entries).sort((a, b) => (a.date < b.date ? -1 : 1));
  const latest = [...sorted].reverse()[0];

  const series = sorted
    .filter((e) => e[metric] != null)
    .map((e) => ({ x: e.date, y: e[metric] as number }));

  const m = META[metric];
  const first = series[0]?.y;
  const last = series[series.length - 1]?.y;
  const delta = first != null && last != null ? last - first : 0;

  return (
    <div className="animate-fade">
      <Header
        title="Salud"
        subtitle="Tu cuerpo en datos"
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="grid place-items-center h-11 w-11 rounded-full bg-health/15 text-health active:scale-95"
          >
            <Plus size={22} />
          </button>
        }
      />

      <div className="px-4 space-y-5">
        {/* Stats actuales */}
        <div className="grid grid-cols-2 gap-3">
          <BigStat metric="weight" value={latest?.weight} />
          <BigStat metric="bodyFat" value={latest?.bodyFat} sub={`objetivo ${macros.bodyFatTarget}%`} />
          <BigStat metric="steps" value={latest?.steps} />
          <BigStat metric="sleepHours" value={latest?.sleepHours} />
        </div>

        {/* Gráfica */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                <span style={{ color: m.color }}>
                  <m.Icon size={18} />
                </span>
                <h3 className="font-bold">{m.label}</h3>
              </div>
              {series.length >= 2 && (
                <p className="text-[13px] mt-0.5" style={{ color: delta === 0 ? 'var(--color-muted)' : m.color }}>
                  {delta > 0 ? '▲' : delta < 0 ? '▼' : ''} {Math.abs(delta).toFixed(metric === 'steps' ? 0 : 1)} {m.unit} en el periodo
                </p>
              )}
            </div>
            {last != null && (
              <span className="text-2xl font-extrabold" style={{ color: m.color }}>
                {metric === 'steps' ? last.toLocaleString('es-ES') : last}
                <span className="text-sm text-faint font-semibold"> {m.unit}</span>
              </span>
            )}
          </div>
          <div className="mt-3">
            <Sparkline data={series} color={m.color} />
          </div>
          <div className="mt-4">
            <Segmented
              value={metric}
              onChange={(v) => setMetric(v)}
              options={[
                { label: 'Peso', value: 'weight' },
                { label: 'Grasa', value: 'bodyFat' },
                { label: 'Pasos', value: 'steps' },
                { label: 'Sueño', value: 'sleepHours' },
              ]}
            />
          </div>
        </Card>

        {/* Apple Health */}
        <Card className="p-5" onClick={() => setShowApple(true)}>
          <div className="flex items-center gap-4">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-white/10 shrink-0">
              <Apple size={24} className="text-fg" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold">Conectar con Apple Salud</h3>
              <p className="text-[13px] text-muted mt-0.5">Importa peso, pasos y sueño con un Atajo</p>
            </div>
            <Download size={18} className="text-faint" />
          </div>
        </Card>

        {/* Historial */}
        {sorted.length > 0 && (
          <div>
            <SectionTitle>Historial</SectionTitle>
            <div className="space-y-2">
              {[...sorted].reverse().slice(0, 30).map((e) => (
                <Card key={e.date} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-12 text-center shrink-0">
                    <p className="text-[11px] text-faint font-semibold">{shortDate(e.date)}</p>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px]">
                    {e.weight != null && <span><b className="text-fg">{e.weight}</b> <span className="text-faint">kg</span></span>}
                    {e.bodyFat != null && <span><b className="text-fg">{e.bodyFat}</b> <span className="text-faint">%</span></span>}
                    {e.steps != null && <span><b className="text-fg">{e.steps.toLocaleString('es-ES')}</b> <span className="text-faint">pasos</span></span>}
                    {e.sleepHours != null && <span><b className="text-fg">{e.sleepHours}</b> <span className="text-faint">h</span></span>}
                  </div>
                  <button onClick={() => remove(e.date)} className="text-faint active:text-danger shrink-0">
                    <Trash2 size={16} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
        <div className="h-2" />
      </div>

      {showAdd && (
        <AddEntry
          entry={todayEntry}
          onSave={(e) => {
            upsert(e);
            setShowAdd(false);
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      <AppleSheet open={showApple} onClose={() => setShowApple(false)} onImport={importMany} />
    </div>
  );
}

function BigStat({ metric, value, sub }: { metric: Metric; value?: number; sub?: string }) {
  const m = META[metric];
  return (
    <div className="rounded-3xl bg-card border border-line p-4">
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: m.color }}>
          <m.Icon size={18} />
        </span>
        <span className="text-[12px] text-muted font-semibold">{m.label}</span>
      </div>
      <p className="text-3xl font-extrabold leading-none">
        {value != null ? (metric === 'steps' ? value.toLocaleString('es-ES') : value) : '—'}
        {value != null && m.unit && <span className="text-sm text-faint font-semibold"> {m.unit}</span>}
      </p>
      {sub && <p className="text-[12px] text-faint mt-1.5">{sub}</p>}
    </div>
  );
}

function AddEntry({
  entry,
  onSave,
  onClose,
}: {
  entry: HealthEntry;
  onSave: (e: HealthEntry) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(entry.date);
  const [weight, setWeight] = useState(entry.weight ?? ('' as number | ''));
  const [bodyFat, setBodyFat] = useState(entry.bodyFat ?? ('' as number | ''));
  const [steps, setSteps] = useState(entry.steps ?? ('' as number | ''));
  const [sleepHours, setSleep] = useState(entry.sleepHours ?? ('' as number | ''));

  const num = (v: number | '') => (v === '' ? undefined : Number(v));

  return (
    <Sheet open onClose={onClose} title="Registrar datos">
      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-semibold text-muted">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-health/60 text-fg"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <HField label="Peso (kg)" value={weight} onChange={setWeight} color="#5ec8ff" />
          <HField label="% Grasa" value={bodyFat} onChange={setBodyFat} color="#ff9fd0" />
          <HField label="Pasos" value={steps} onChange={setSteps} color="#b6f23e" />
          <HField label="Sueño (h)" value={sleepHours} onChange={setSleep} color="#c89bff" />
        </div>
        <button
          onClick={() => onSave({ date, weight: num(weight), bodyFat: num(bodyFat), steps: num(steps), sleepHours: num(sleepHours) })}
          className="w-full rounded-2xl bg-health text-ink py-3.5 font-bold flex items-center justify-center gap-2"
        >
          <Check size={20} /> Guardar
        </button>
      </div>
    </Sheet>
  );
}

function HField({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number | '';
  onChange: (v: number | '') => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-muted">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
        style={{ borderColor: undefined }}
        className="mt-1 w-full h-12 rounded-xl bg-ink-2 border border-line text-center text-lg font-bold outline-none focus:border-health/60"
      />
    </div>
  );
}

function AppleSheet({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (list: HealthEntry[]) => void;
}) {
  const [json, setJson] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  function doImport() {
    try {
      const parsed = JSON.parse(json);
      const arr: HealthEntry[] = Array.isArray(parsed) ? parsed : [parsed];
      const clean = arr
        .map((e: any) => ({
          date: e.date,
          weight: e.weight != null ? Number(e.weight) : undefined,
          bodyFat: e.bodyFat != null ? Number(e.bodyFat) : undefined,
          steps: e.steps != null ? Number(e.steps) : undefined,
          sleepHours: e.sleepHours != null ? Number(e.sleepHours) : undefined,
        }))
        .filter((e) => e.date);
      if (!clean.length) throw new Error('vacío');
      onImport(clean);
      setMsg(`Importados ${clean.length} registros ✓`);
      setJson('');
    } catch {
      setMsg('JSON no válido. Revisa el formato.');
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Apple Salud">
      <div className="space-y-4 text-[14px] leading-relaxed">
        <p className="text-muted">
          Por seguridad, una web no puede leer Apple Salud directamente. La forma sencilla de traer tus
          datos es con un <b className="text-fg">Atajo de Apple</b> que exporta a este formato y lo pegas aquí.
        </p>

        <div className="rounded-2xl bg-ink-2 border border-line p-4">
          <p className="font-bold mb-2">Cómo crear el Atajo (1 vez)</p>
          <ol className="space-y-1.5 text-muted list-decimal list-inside">
            <li>Abre <b className="text-fg">Atajos</b> → nuevo atajo.</li>
            <li>Añade <b className="text-fg">«Obtener muestras de salud»</b> (peso, pasos, sueño).</li>
            <li>Usa <b className="text-fg">«Texto»</b> para dar formato JSON con tus valores.</li>
            <li>Añade <b className="text-fg">«Copiar al portapapeles»</b>.</li>
            <li>Ejecútalo y pega aquí 👇</li>
          </ol>
        </div>

        <div className="rounded-2xl bg-ink-2 border border-line p-4">
          <p className="font-bold mb-2">Formato esperado</p>
          <pre className="text-[12px] text-accent/90 whitespace-pre-wrap leading-relaxed">{`[
  { "date": "2026-06-14", "weight": 78.4,
    "bodyFat": 15.2, "steps": 9230, "sleepHours": 7.5 },
  { "date": "2026-06-13", "weight": 78.6, "steps": 11020 }
]`}</pre>
        </div>

        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setMsg(null);
          }}
          rows={5}
          placeholder="Pega aquí el JSON exportado…"
          className="w-full rounded-xl bg-ink-2 border border-line px-3 py-2.5 text-[14px] outline-none focus:border-health/60 font-mono"
        />
        {msg && <p className={`text-sm font-semibold ${msg.includes('✓') ? 'text-accent' : 'text-danger'}`}>{msg}</p>}
        <button onClick={doImport} className="w-full rounded-2xl bg-health text-ink py-3.5 font-bold flex items-center justify-center gap-2">
          <Download size={20} /> Importar datos
        </button>
        <p className="text-[12px] text-faint text-center">
          También puedes meter los datos a mano con el botón ＋ — funciona perfecto desde el iPhone.
        </p>
      </div>
    </Sheet>
  );
}
