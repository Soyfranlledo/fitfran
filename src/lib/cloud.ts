/**
 * Sincronización en la nube vía un Gist privado de GitHub.
 *
 * Por qué Gist: la app es estática (GitHub Pages) y de un solo usuario, así que
 * no hace falta montar backend. El dato vive en un archivo privado del propio
 * usuario y se sincroniza con un token que se guarda SOLO en este dispositivo
 * (nunca se sube al Gist; no está en BACKUP_KEYS).
 *
 * Regla de oro de la fusión: "información máxima". Al unir lo local con lo de la
 * nube, un registro vacío NUNCA pisa uno con datos. Eso evita exactamente el
 * fallo que borró el entreno (un cajón vacío sobrescribiendo los pesos reales).
 */
import {
  BACKUP_KEYS,
  useSettings,
  useWorkout,
  useHealth,
  useMenu,
  usePlan,
} from './store';

const API = 'https://api.github.com';
const FILE = 'fitfran-backup.json';
const GIST_DESC = 'FitFran · copia privada (no borrar)';
const CLOUD_KEY = 'fitfran-cloud'; // config local, NO se sincroniza

/* ----------------------------- Tipos ----------------------------- */
type Backup = Record<string, any> & {
  _app?: string;
  _meta?: { updatedAt?: string; device?: string };
};

interface CloudConfig {
  token?: string;
  gistId?: string;
  lastSync?: string;
  /** Última vez que el usuario cambió datos en ESTE dispositivo. */
  lastChange?: string;
}

export type CloudStatus =
  | 'disconnected'
  | 'idle'
  | 'syncing'
  | 'ok'
  | 'error';

export interface CloudState {
  connected: boolean;
  status: CloudStatus;
  lastSync?: string;
  lastDevice?: string;
  error?: string;
}

class CloudError extends Error {}

/* ----------------------------- Config ----------------------------- */
function readConfig(): CloudConfig {
  try {
    return JSON.parse(localStorage.getItem(CLOUD_KEY) || '{}');
  } catch {
    return {};
  }
}
function writeConfig(patch: Partial<CloudConfig>) {
  writeConfigRaw({ ...readConfig(), ...patch });
}
function writeConfigRaw(c: CloudConfig) {
  localStorage.setItem(CLOUD_KEY, JSON.stringify(c));
}

/* -------------------------- Estado / pub-sub -------------------------- */
let state: CloudState = (() => {
  const c = readConfig();
  return {
    connected: !!c.token,
    status: c.token ? 'idle' : 'disconnected',
    lastSync: c.lastSync,
  };
})();

const listeners = new Set<() => void>();
export function subscribeCloud(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function getCloud(): CloudState {
  return state;
}
function setState(p: Partial<CloudState>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

/* ----------------------------- Dispositivo ----------------------------- */
function deviceLabel(): string {
  const ua = navigator.userAgent;
  let name = 'Dispositivo';
  if (/iPhone/.test(ua)) name = 'iPhone';
  else if (/iPad/.test(ua)) name = 'iPad';
  else if (/Android/.test(ua)) name = 'Android';
  else if (/Macintosh|Mac OS X/.test(ua)) name = 'Mac';
  else if (/Windows/.test(ua)) name = 'PC';
  const standalone =
    (navigator as any).standalone === true ||
    (typeof matchMedia === 'function' &&
      matchMedia('(display-mode: standalone)').matches);
  return `${name} · ${standalone ? 'app' : 'navegador'}`;
}

/* ----------------------- Lectura/escritura local ----------------------- */
function localBackup(): Backup {
  const data: Backup = { _app: 'FitFran', _version: 1 };
  for (const k of BACKUP_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        data[k] = JSON.parse(raw);
      } catch {
        /* ignora claves corruptas */
      }
    }
  }
  data._meta = {
    // Marca de tiempo del último CAMBIO real del usuario aquí (no "ahora"),
    // para que la fusión sepa qué lado tiene los ajustes más recientes.
    updatedAt: readConfig().lastChange || '1970-01-01T00:00:00.000Z',
    device: deviceLabel(),
  };
  return data;
}

let applyingRemote = false;
function applyBackup(obj: Backup) {
  applyingRemote = true;
  for (const k of BACKUP_KEYS) {
    if (obj[k]) localStorage.setItem(k, JSON.stringify(obj[k]));
  }
  // Rehidrata los stores en caliente: la app se actualiza sin recargar.
  useSettings.persist.rehydrate();
  useWorkout.persist.rehydrate();
  useHealth.persist.rehydrate();
  useMenu.persist.rehydrate();
  usePlan.persist.rehydrate();
  // Suelta el guard tras el ciclo de rehidratación para no auto-disparar push.
  setTimeout(() => {
    applyingRemote = false;
  }, 50);
}

/* ------------------------------ Fusión ------------------------------ */
type SetLog = { weight: number; reps: number; done: boolean };
function setScore(s: SetLog): number {
  return (s?.done ? 1 : 0) * 1e9 + (s?.weight || 0) * 1000 + (s?.reps || 0);
}
function mergeSets(a: SetLog[] = [], b: SetLog[] = []): SetLog[] {
  const n = Math.max(a.length, b.length);
  const out: SetLog[] = [];
  for (let i = 0; i < n; i++) {
    const x = a[i];
    const y = b[i];
    if (x && y) out.push(setScore(y) > setScore(x) ? y : x);
    else out.push(x || y);
  }
  return out;
}
function mergeLog(a: any, b: any) {
  return {
    done: !!(a?.done || b?.done),
    sets: mergeSets(a?.sets, b?.sets),
  };
}
function mergeSession(a: any, b: any) {
  const logs: Record<string, any> = { ...(a.logs || {}) };
  for (const [k, v] of Object.entries(b.logs || {})) {
    logs[k] = logs[k] ? mergeLog(logs[k], v) : v;
  }
  const completedAt =
    a.completedAt && b.completedAt
      ? a.completedAt > b.completedAt
        ? a.completedAt
        : b.completedAt
      : a.completedAt || b.completedAt;
  return { ...a, ...b, logs, completedAt };
}
function mergeWorkoutsState(a: any = {}, b: any = {}) {
  const sessions: Record<string, any> = { ...(a.sessions || {}) };
  for (const [k, v] of Object.entries(b.sessions || {})) {
    sessions[k] = sessions[k] ? mergeSession(sessions[k], v) : v;
  }
  return { ...a, ...b, sessions };
}
function mergeHealthState(a: any = {}, b: any = {}) {
  const entries: Record<string, any> = { ...(a.entries || {}) };
  for (const [d, e] of Object.entries(b.entries || {}) as [string, any][]) {
    const cur = entries[d];
    if (!cur) {
      entries[d] = e;
      continue;
    }
    const m: any = { ...cur };
    for (const f of ['weight', 'bodyFat', 'steps', 'sleepHours']) {
      if (e[f] != null && e[f] !== 0) m[f] = e[f];
      else if (m[f] == null) m[f] = e[f];
    }
    m.date = d;
    entries[d] = m;
  }
  return { ...a, ...b, entries };
}
function mergeStateKey(
  a: any,
  b: any,
  fn: (x: any, y: any) => any
) {
  if (!a) return b;
  if (!b) return a;
  return {
    ...a,
    ...b,
    state: fn(a.state || {}, b.state || {}),
    version: Math.max(a.version || 0, b.version || 0),
  };
}

/** Une dos copias completas sin perder nunca información. */
export function mergeBackups(a: Backup | null, b: Backup | null): Backup {
  if (!a) return b as Backup;
  if (!b) return a as Backup;
  const au = a._meta?.updatedAt || '';
  const bu = b._meta?.updatedAt || '';
  const aNewer = au >= bu;
  const newer = aNewer ? a : b;
  const older = aNewer ? b : a;

  const out: Backup = { _app: 'FitFran', _version: 1 };

  // Entrenos y salud: unión "información máxima" (independiente del orden).
  out['fitfran-workouts'] = mergeStateKey(
    a['fitfran-workouts'],
    b['fitfran-workouts'],
    mergeWorkoutsState
  );
  out['fitfran-health'] = mergeStateKey(
    a['fitfran-health'],
    b['fitfran-health'],
    mergeHealthState
  );

  // Plan (días asignados): unión; en conflicto manda el más reciente.
  out['fitfran-plan'] = mergeStateKey(
    a['fitfran-plan'],
    b['fitfran-plan'],
    (x: any = {}, y: any = {}) => {
      const wo: Record<string, number> = { ...(x.weekdayOverride || {}) };
      for (const [k, v] of Object.entries(y.weekdayOverride || {}))
        wo[k] = v as number;
      const newerWO =
        (aNewer ? x.weekdayOverride : y.weekdayOverride) || {};
      for (const [k, v] of Object.entries(newerWO)) wo[k] = v as number;
      return { ...x, ...y, weekdayOverride: wo };
    }
  );

  // Ajustes y menú: preferencias del usuario → manda la copia más reciente.
  out['fitfran-settings'] =
    newer['fitfran-settings'] || older['fitfran-settings'];
  out['fitfran-menu'] = newer['fitfran-menu'] || older['fitfran-menu'];

  out._meta = {
    updatedAt: aNewer ? au : bu,
    device: deviceLabel(),
  };
  return out;
}

/* ------------------------------ GitHub API ------------------------------ */
async function gh(path: string, init?: RequestInit): Promise<Response> {
  const { token } = readConfig();
  if (!token) throw new CloudError('No conectado');
  let res: Response;
  try {
    res = await fetch(API + path, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new CloudError('Sin conexión');
  }
  if (!res.ok) {
    if (res.status === 401) throw new CloudError('Token inválido o caducado');
    if (res.status === 403) throw new CloudError('GitHub rechazó la petición (permisos/límite)');
    throw new CloudError(`Error ${res.status} de GitHub`);
  }
  return res;
}

async function ensureGist(): Promise<string> {
  const cfg = readConfig();
  if (cfg.gistId) return cfg.gistId;
  // ¿Ya existe un Gist de FitFran con este token? (otro dispositivo lo creó)
  const list = (await (await gh('/gists?per_page=100')).json()) as any[];
  const found = list.find((g) => g.files && g.files[FILE]);
  if (found) {
    writeConfig({ gistId: found.id });
    return found.id;
  }
  const created = (await (
    await gh('/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: GIST_DESC,
        public: false,
        files: { [FILE]: { content: JSON.stringify(localBackup(), null, 2) } },
      }),
    })
  ).json()) as any;
  writeConfig({ gistId: created.id });
  return created.id;
}

async function pullRemote(): Promise<Backup | null> {
  const id = await ensureGist();
  const g = (await (await gh(`/gists/${id}`)).json()) as any;
  const file = g.files?.[FILE];
  if (!file) return null;
  let content: string = file.content;
  if (file.truncated && file.raw_url) {
    content = await (await fetch(file.raw_url)).text();
  }
  try {
    return JSON.parse(content) as Backup;
  } catch {
    return null;
  }
}

async function pushRemote(obj: Backup): Promise<void> {
  const id = await ensureGist();
  await gh(`/gists/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      files: { [FILE]: { content: JSON.stringify(obj, null, 2) } },
    }),
  });
}

/* --------------------------- Orquestación --------------------------- */
let syncing = false;
let pendingAgain = false;

export async function syncNow(): Promise<void> {
  if (!readConfig().token) return;
  if (syncing) {
    pendingAgain = true;
    return;
  }
  syncing = true;
  setState({ status: 'syncing', error: undefined });
  try {
    const local = localBackup();
    const remote = await pullRemote();
    const merged = remote ? mergeBackups(local, remote) : local;
    if (remote) applyBackup(merged);
    await pushRemote(merged);
    const now = new Date().toISOString();
    writeConfig({ lastSync: now });
    setState({
      status: 'ok',
      connected: true,
      lastSync: now,
      lastDevice: merged._meta?.device,
      error: undefined,
    });
  } catch (e: any) {
    setState({ status: 'error', error: e?.message || 'Error de sincronización' });
  } finally {
    syncing = false;
    if (pendingAgain) {
      pendingAgain = false;
      void syncNow();
    }
  }
}

export async function connectCloud(token: string): Promise<void> {
  const t = token.trim();
  if (!t) return;
  writeConfig({ token: t });
  setState({ connected: true, status: 'syncing', error: undefined });
  try {
    await ensureGist(); // valida el token
    await syncNow();
  } catch (e: any) {
    if (/Token inválido/.test(e?.message || '')) {
      // Token malo: olvídalo para no quedar en estado falso "conectado".
      const c = readConfig();
      delete c.token;
      delete c.gistId;
      writeConfigRaw(c);
      setState({ connected: false, status: 'disconnected', error: e.message });
    } else {
      setState({ status: 'error', error: e?.message || 'No se pudo conectar' });
    }
  }
}

export function disconnectCloud() {
  writeConfigRaw({});
  setState({
    connected: false,
    status: 'disconnected',
    lastSync: undefined,
    lastDevice: undefined,
    error: undefined,
  });
}

/* ------------------------- Arranque / auto-sync ------------------------- */
let inited = false;
let debounceT: ReturnType<typeof setTimeout> | undefined;

function scheduleSync() {
  if (applyingRemote) return; // cambio provocado por la propia rehidratación
  if (!readConfig().token) return;
  writeConfig({ lastChange: new Date().toISOString() });
  clearTimeout(debounceT);
  debounceT = setTimeout(() => void syncNow(), 4000);
}

export function initCloudSync() {
  if (inited) return;
  inited = true;

  // Sube en cuanto cambian los datos (con un pequeño respiro).
  useSettings.subscribe(scheduleSync);
  useWorkout.subscribe(scheduleSync);
  useHealth.subscribe(scheduleSync);
  useMenu.subscribe(scheduleSync);
  usePlan.subscribe(scheduleSync);

  // Al volver a la app, baja por si otro dispositivo escribió.
  const onVisible = () => {
    if (readConfig().token && document.visibilityState === 'visible') {
      void syncNow();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', () => {
    if (readConfig().token) void syncNow();
  });

  // Primera sincronización al abrir.
  if (readConfig().token) void syncNow();
}
