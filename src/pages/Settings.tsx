import { useRef, useState } from 'react';
import { User, CalendarRange, RefreshCw, Trash2, Share, Info, Download, Upload, DatabaseBackup } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, SectionTitle, Segmented } from '../components/ui';
import { useMenu, useSettings, exportData, importData } from '../lib/store';
import { isoDate } from '../lib/date';

export function Settings() {
  const { profile, setProfile, daysPerWeek, setDaysPerWeek, macros } = useSettings();
  const resetMenu = useMenu((s) => s.resetMenu);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function doExport() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitfran-backup-${isoDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(String(reader.result));
        setMsg('Datos importados ✓ Recargando…');
        setTimeout(() => location.reload(), 800);
      } catch {
        setMsg('Archivo no válido.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="animate-fade">
      <Header title="Ajustes" back />

      <div className="px-4 space-y-5">
        {/* Perfil */}
        <div>
          <SectionTitle>Perfil</SectionTitle>
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-12 w-12 rounded-2xl bg-accent/15 text-accent shrink-0">
                <User size={22} />
              </div>
              <div className="flex-1">
                <label className="text-[12px] font-semibold text-muted">Nombre</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ name: e.target.value })}
                  className="mt-0.5 w-full h-10 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-accent/60"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted">Objetivo</label>
              <div className="mt-1">
                <Segmented
                  value={profile.goal}
                  onChange={(v) => setProfile({ goal: v })}
                  options={[
                    { label: 'Perder', value: 'perder' },
                    { label: 'Mantener', value: 'mantener' },
                    { label: 'Ganar', value: 'ganar' },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-muted">Altura (cm)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={profile.heightCm || ''}
                  onChange={(e) => setProfile({ heightCm: parseInt(e.target.value) || 0 })}
                  className="mt-0.5 w-full h-10 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-accent/60"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-muted">Edad</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ age: parseInt(e.target.value) || 0 })}
                  className="mt-0.5 w-full h-10 rounded-xl bg-ink-2 border border-line px-3 font-semibold outline-none focus:border-accent/60"
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted">Sexo</label>
              <div className="mt-1">
                <Segmented
                  value={profile.sex}
                  onChange={(v) => setProfile({ sex: v })}
                  options={[
                    { label: 'Hombre', value: 'h' },
                    { label: 'Mujer', value: 'm' },
                  ]}
                />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-muted">Nivel de actividad</label>
              <div className="mt-1">
                <Segmented
                  value={profile.activity}
                  onChange={(v) => setProfile({ activity: v })}
                  options={[
                    { label: 'Sedent.', value: 'sedentario' },
                    { label: 'Ligero', value: 'ligero' },
                    { label: 'Moder.', value: 'moderado' },
                    { label: 'Alto', value: 'alto' },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Entrenamiento */}
        <div>
          <SectionTitle>Entrenamiento</SectionTitle>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarRange size={18} className="text-accent" />
              <span className="font-semibold">Días por semana</span>
            </div>
            <Segmented
              value={daysPerWeek}
              onChange={(v) => setDaysPerWeek(v as 3 | 4 | 5)}
              options={[
                { label: '3 días', value: 3 },
                { label: '4 días', value: 4 },
                { label: '5 días', value: 5 },
              ]}
            />
          </Card>
        </div>

        {/* Resumen macros */}
        <div>
          <SectionTitle>Objetivos nutricionales</SectionTitle>
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <Row label="Calorías" value={`${macros.calories} kcal`} />
              <Row label="% grasa objetivo" value={`${macros.bodyFatTarget} %`} />
              <Row label="Proteína" value={`${macros.protein} g`} />
              <Row label="Carbohidratos" value={`${macros.carbs} g`} />
              <Row label="Grasa" value={`${macros.fat} g`} />
            </div>
            <p className="text-[12px] text-muted mt-3">Edítalos desde la pestaña Nutrición → Ajustar.</p>
          </Card>
        </div>

        {/* Copia de seguridad */}
        <div>
          <SectionTitle>Copia de seguridad</SectionTitle>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DatabaseBackup size={18} className="text-health" />
              <h3 className="font-bold">Tus datos, a salvo</h3>
            </div>
            <p className="text-[14px] text-muted leading-relaxed mb-4">
              Todo se guarda en este dispositivo. Exporta un archivo de respaldo de vez en cuando
              (entrenos, pesos, salud y menú) para no perder tu registro o pasarlo a otro móvil.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={doExport}
                className="flex items-center justify-center gap-2 rounded-2xl bg-health text-ink py-3 font-bold active:scale-95"
              >
                <Download size={18} /> Exportar
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-card-2 border border-line text-fg py-3 font-bold active:scale-95"
              >
                <Upload size={18} /> Importar
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doImport(f);
                e.target.value = '';
              }}
            />
            {msg && <p className={`text-sm font-semibold mt-3 ${msg.includes('✓') ? 'text-accent' : 'text-danger'}`}>{msg}</p>}
          </Card>
        </div>

        {/* Datos */}
        <div>
          <SectionTitle>Datos</SectionTitle>
          <Card className="divide-y divide-line">
            <button
              onClick={() => {
                if (confirm('¿Restaurar el menú semanal por defecto? Perderás tus cambios del menú.')) resetMenu();
              }}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-card-2"
            >
              <RefreshCw size={18} className="text-food" />
              <span className="font-semibold">Restaurar menú por defecto</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Esto borra TODOS tus datos (entrenos, salud, menú, ajustes). ¿Seguro?')) {
                  localStorage.clear();
                  location.reload();
                }
              }}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-card-2"
            >
              <Trash2 size={18} className="text-danger" />
              <span className="font-semibold text-danger">Borrar todos los datos</span>
            </button>
          </Card>
        </div>

        {/* Instalar */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Share size={18} className="text-health" />
            <h3 className="font-bold">Instalar en el iPhone</h3>
          </div>
          <p className="text-[14px] text-muted leading-relaxed">
            En Safari, toca <b className="text-fg">Compartir</b> → <b className="text-fg">«Añadir a pantalla de inicio»</b>.
            Quedará como una app, a pantalla completa y funciona sin conexión.
          </p>
        </Card>

        <div className="flex items-center justify-center gap-2 text-faint text-[12px] pt-2">
          <Info size={13} /> FitFran · tus datos se guardan solo en tu dispositivo
        </div>
        <div className="h-2" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
