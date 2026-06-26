import { useRef, useState, useSyncExternalStore } from 'react';
import { User, CalendarRange, RefreshCw, Trash2, Share, Info, Download, Upload, DatabaseBackup, Cloud, CloudOff, Link2, LogOut, Check, Sparkles, KeyRound } from 'lucide-react';
import { Header } from '../components/Header';
import { Card, SectionTitle, Segmented } from '../components/ui';
import { useMenu, useSettings, exportData, importData } from '../lib/store';
import { subscribeCloud, getCloud, connectCloud, disconnectCloud, syncNow } from '../lib/cloud';
import { subscribeAI, getAI, setAIKey, clearAIKey, verifyAIKey } from '../lib/ai';
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

        {/* Sincronización en la nube */}
        <CloudCard />

        {/* Asistente de nutrición (IA) */}
        <AICard />

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

function relTime(iso?: string): string {
  if (!iso) return '';
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

function AICard() {
  const ai = useSyncExternalStore(subscribeAI, getAI);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onConnect() {
    const t = key.trim();
    if (!t) return;
    setBusy(true);
    setError('');
    try {
      const ok = await verifyAIKey(t);
      if (ok) {
        setAIKey(t);
        setKey('');
      } else {
        setError('Clave de OpenAI inválida.');
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo verificar la clave.');
    } finally {
      setBusy(false);
    }
  }

  const keyUrl = 'https://platform.openai.com/api-keys';

  return (
    <div>
      <SectionTitle>Asistente de nutrición (IA)</SectionTitle>
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className={ai.hasKey ? 'text-food' : 'text-faint'} />
          <h3 className="font-bold">{ai.hasKey ? 'Conectado a OpenAI' : 'Registra comidas por voz'}</h3>
        </div>

        {!ai.hasKey ? (
          <>
            <p className="text-[14px] text-muted leading-relaxed mb-4">
              Con una clave de OpenAI puedes dictar lo que comes y la app calcula las calorías y
              macros. La clave se guarda <b className="text-fg">solo en este dispositivo</b> (no se
              sube a la nube ni a la copia). El coste por comida es de céntimos.
            </p>
            <input
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Pega aquí tu clave (sk-…)"
              className="w-full h-11 rounded-xl bg-ink-2 border border-line px-3 font-mono text-sm outline-none focus:border-food/60 mb-3"
            />
            <button
              onClick={onConnect}
              disabled={busy || !key.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-food text-ink py-3 font-bold active:scale-95 disabled:opacity-50"
            >
              <KeyRound size={18} /> {busy ? 'Verificando…' : 'Guardar clave'}
            </button>
            {error && <p className="text-sm font-semibold text-danger mt-3">⚠ {error}</p>}
            <details className="mt-4 text-[13px] text-muted">
              <summary className="cursor-pointer font-semibold text-fg">¿Cómo consigo la clave?</summary>
              <ol className="list-decimal pl-5 mt-2 space-y-1 leading-relaxed">
                <li>
                  Abre{' '}
                  <a className="text-food underline" href={keyUrl} target="_blank" rel="noreferrer">
                    platform.openai.com/api-keys
                  </a>{' '}
                  e inicia sesión.
                </li>
                <li>Pulsa <b className="text-fg">Create new secret key</b> y cópiala.</li>
                <li>Pégala arriba. Conviene ponerle un límite de gasto en tu cuenta.</li>
              </ol>
              <p className="mt-2">
                El texto de tus comidas (y el audio) se envía a OpenAI solo para calcular los macros.
              </p>
            </details>
          </>
        ) : (
          <>
            <p className="text-[14px] text-muted leading-relaxed mb-4">
              Listo. Ve a <b className="text-fg">Nutrición → Mi día</b> y registra una comida por voz.
              La clave vive solo aquí; puedes quitarla cuando quieras.
            </p>
            <button
              onClick={() => {
                if (confirm('¿Quitar la clave de OpenAI de este dispositivo?')) clearAIKey();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-card-2 border border-line text-fg py-3 font-bold active:scale-95"
            >
              <LogOut size={18} /> Quitar clave
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

function CloudCard() {
  const cloud = useSyncExternalStore(subscribeCloud, getCloud);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);

  async function onConnect() {
    if (!token.trim()) return;
    setBusy(true);
    await connectCloud(token.trim());
    setBusy(false);
    setToken('');
  }

  const tokenUrl =
    'https://github.com/settings/tokens/new?scopes=gist&description=FitFran';

  return (
    <div>
      <SectionTitle>Sincronización en la nube</SectionTitle>
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {cloud.connected ? (
            <Cloud size={18} className="text-accent" />
          ) : (
            <CloudOff size={18} className="text-faint" />
          )}
          <h3 className="font-bold">
            {cloud.connected ? 'Conectado a tu Gist privado' : 'Tus datos, en la nube'}
          </h3>
        </div>

        {!cloud.connected ? (
          <>
            <p className="text-[14px] text-muted leading-relaxed mb-4">
              Guarda tus entrenos en un archivo privado de tu GitHub. Así son los mismos en el
              móvil y en el ordenador, en Safari y en la app instalada, y sobreviven a las
              actualizaciones. Solo tienes que pegar un token una vez por dispositivo.
            </p>
            <input
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pega aquí tu token de GitHub"
              className="w-full h-11 rounded-xl bg-ink-2 border border-line px-3 font-mono text-sm outline-none focus:border-accent/60 mb-3"
            />
            <button
              onClick={onConnect}
              disabled={busy || !token.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-accent text-ink py-3 font-bold active:scale-95 disabled:opacity-50"
            >
              <Link2 size={18} /> {busy ? 'Conectando…' : 'Conectar'}
            </button>
            {cloud.status === 'error' && cloud.error && (
              <p className="text-sm font-semibold text-danger mt-3">⚠ {cloud.error}</p>
            )}
            <details className="mt-4 text-[13px] text-muted">
              <summary className="cursor-pointer font-semibold text-fg">¿Cómo consigo el token?</summary>
              <ol className="list-decimal pl-5 mt-2 space-y-1 leading-relaxed">
                <li>
                  Abre{' '}
                  <a className="text-accent underline" href={tokenUrl} target="_blank" rel="noreferrer">
                    esta página de GitHub
                  </a>{' '}
                  (ya viene preparada).
                </li>
                <li>
                  Elige caducidad (p. ej. «No expiration») y pulsa <b className="text-fg">Generate token</b>.
                </li>
                <li>
                  Copia el token (<span className="font-mono">ghp_…</span>) y pégalo arriba.
                </li>
              </ol>
              <p className="mt-2">
                Solo concede permiso a <b className="text-fg">gists</b>: no puede tocar tu código ni
                nada más, y lo puedes revocar cuando quieras.
              </p>
            </details>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-[14px] mb-3 min-h-6">
              {cloud.status === 'syncing' && (
                <span className="text-muted flex items-center gap-2">
                  <RefreshCw size={15} className="animate-spin" /> Sincronizando…
                </span>
              )}
              {cloud.status === 'ok' && (
                <span className="text-accent flex items-center gap-2">
                  <Check size={15} /> Sincronizado{relTime(cloud.lastSync) ? ` · ${relTime(cloud.lastSync)}` : ''}
                </span>
              )}
              {cloud.status === 'idle' && (
                <span className="text-muted">
                  {cloud.lastSync ? `Última sync ${relTime(cloud.lastSync)}` : 'Listo para sincronizar'}
                </span>
              )}
              {cloud.status === 'error' && (
                <span className="text-danger">⚠ {cloud.error}</span>
              )}
            </div>
            {cloud.lastDevice && (
              <p className="text-[12px] text-faint -mt-1 mb-3">Última escritura desde: {cloud.lastDevice}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => syncNow()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-accent text-ink py-3 font-bold active:scale-95"
              >
                <RefreshCw size={18} /> Sincronizar
              </button>
              <button
                onClick={() => {
                  if (confirm('¿Desconectar la nube en este dispositivo? Tus datos seguirán a salvo en la nube y en este móvil.'))
                    disconnectCloud();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-card-2 border border-line text-fg py-3 font-bold active:scale-95"
              >
                <LogOut size={18} /> Desconectar
              </button>
            </div>
            <p className="text-[12px] text-faint mt-3">
              Se sincroniza solo al guardar un cambio y al volver a abrir la app.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
