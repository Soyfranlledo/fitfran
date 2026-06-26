/**
 * Asistente de nutrición con IA (OpenAI), para el registro de comidas por voz.
 *
 * Igual que el token de la nube, la clave vive SOLO en este dispositivo
 * (localStorage `fitfran-ai`, fuera de BACKUP_KEYS): no se sube al Gist ni
 * aparece en la exportación. La app llama directamente a la API de OpenAI por
 * `fetch`, sin servidor propio.
 *
 * Dos pasos:
 *  1. transcribeAudio(blob) → texto, con un modelo de transcripción.
 *  2. analyzeMeal(texto)     → items con kcal y macros, con gpt-4o-mini (JSON).
 */

const AI_KEY = 'fitfran-ai'; // config local, NO se sincroniza
const CHAT_MODEL = 'gpt-4o-mini';
const STT_MODELS = ['gpt-4o-mini-transcribe', 'whisper-1'];

/* ----------------------------- Clave (config) ----------------------------- */
function readKey(): string {
  try {
    return JSON.parse(localStorage.getItem(AI_KEY) || '{}').key || '';
  } catch {
    return '';
  }
}
function writeKey(k: string) {
  localStorage.setItem(AI_KEY, JSON.stringify({ key: k }));
}

export function hasAIKey(): boolean {
  return !!readKey();
}

/* -------------------------- Estado / pub-sub -------------------------- */
export interface AIState {
  hasKey: boolean;
}
let state: AIState = { hasKey: !!readKey() };
const listeners = new Set<() => void>();
export function subscribeAI(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function getAI(): AIState {
  return state;
}
function setState(p: Partial<AIState>) {
  state = { ...state, ...p };
  listeners.forEach((l) => l());
}

export function setAIKey(k: string) {
  const t = k.trim();
  writeKey(t);
  setState({ hasKey: !!t });
}
export function clearAIKey() {
  localStorage.removeItem(AI_KEY);
  setState({ hasKey: false });
}

class AIError extends Error {}

function requireKey(): string {
  const k = readKey();
  if (!k) throw new AIError('Añade tu clave de OpenAI en Ajustes → Asistente de nutrición.');
  return k;
}

function friendlyError(status: number, body: any): string {
  const msg = body?.error?.message as string | undefined;
  if (status === 401) return 'Clave de OpenAI inválida o revocada.';
  if (status === 429) return 'Límite o crédito de OpenAI agotado. Revisa tu cuenta.';
  if (msg) return msg;
  return `Error ${status} de OpenAI`;
}

/* ----------------------------- Verificar clave ----------------------------- */
/** Comprueba que una clave es válida (sin gastar tokens). */
export async function verifyAIKey(k: string): Promise<boolean> {
  const t = k.trim();
  if (!t) return false;
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${t}` },
    });
  } catch {
    throw new AIError('Sin conexión con OpenAI.');
  }
  if (res.status === 401) return false;
  if (!res.ok) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new AIError(friendlyError(res.status, body));
  }
  return true;
}

/* ----------------------------- Transcripción ----------------------------- */
function extForMime(mime: string): string {
  if (mime.includes('mp4') || mime.includes('m4a')) return 'm4a';
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  return 'webm';
}

/** Transcribe un audio grabado en la app a texto. */
export async function transcribeAudio(blob: Blob): Promise<string> {
  const key = requireKey();
  const ext = extForMime(blob.type || 'audio/webm');
  let lastErr: Error | null = null;
  for (const model of STT_MODELS) {
    const form = new FormData();
    form.append('file', blob, `comida.${ext}`);
    form.append('model', model);
    form.append('language', 'es');
    let res: Response;
    try {
      res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
    } catch {
      throw new AIError('Sin conexión con OpenAI.');
    }
    if (res.ok) {
      const data = await res.json();
      return (data.text || '').trim();
    }
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    // Si el modelo no existe/está disponible, prueba el siguiente.
    if (res.status === 404 || res.status === 400) {
      lastErr = new AIError(friendlyError(res.status, body));
      continue;
    }
    throw new AIError(friendlyError(res.status, body));
  }
  throw lastErr ?? new AIError('No se pudo transcribir el audio.');
}

/* ----------------------------- Análisis de comida ----------------------------- */
export interface AnalyzedItem {
  name: string;
  qty: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
export interface MealAnalysis {
  title: string;
  items: AnalyzedItem[];
}

const SYSTEM_PROMPT = `Eres un nutricionista que estima calorías y macros de comidas descritas en español.
Te dan una descripción de una comida (posiblemente con cantidades en gramos, mililitros o unidades).
Devuelve SOLO un objeto JSON válido con esta forma exacta:
{"title": string, "items": [{"name": string, "qty": string, "kcal": number, "protein": number, "carbs": number, "fat": number}]}
Reglas:
- Un item por alimento mencionado.
- "qty" es la cantidad (p. ej. "180 g", "2 ud", "300 ml"); si no se indica, estima una ración razonable y refléjala.
- "kcal" son las calorías totales de ese item; "protein", "carbs" y "fat" en gramos.
- Usa valores nutricionales realistas de alimentos comunes.
- "title" es un nombre corto para la comida (p. ej. "Desayuno") inferido del contexto o la hora si se menciona; si no, "Comida".
- No incluyas texto fuera del JSON.`;

function num(x: any): number {
  const n = typeof x === 'number' ? x : parseFloat(x);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Desglosa una descripción de comida en items con kcal y macros. */
export async function analyzeMeal(text: string): Promise<MealAnalysis> {
  const key = requireKey();
  const clean = text.trim();
  if (!clean) throw new AIError('No hay texto que analizar.');
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: clean },
        ],
      }),
    });
  } catch {
    throw new AIError('Sin conexión con OpenAI.');
  }
  if (!res.ok) {
    let body: any = {};
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new AIError(friendlyError(res.status, body));
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AIError('La IA no devolvió un resultado válido. Prueba de nuevo.');
  }
  const items: AnalyzedItem[] = Array.isArray(parsed.items)
    ? parsed.items.map((it: any) => ({
        name: String(it.name ?? '').trim() || 'Alimento',
        qty: String(it.qty ?? '').trim(),
        kcal: num(it.kcal),
        protein: num(it.protein),
        carbs: num(it.carbs),
        fat: num(it.fat),
      }))
    : [];
  if (!items.length) throw new AIError('No se reconoció ningún alimento. Prueba a detallar más.');
  return { title: String(parsed.title ?? '').trim() || 'Comida', items };
}

/** Suma kcal y macros de una lista de items analizados. */
export function sumItems(items: { kcal: number; protein: number; carbs: number; fat: number }[]) {
  return items.reduce(
    (acc, it) => ({
      kcal: acc.kcal + (it.kcal || 0),
      protein: acc.protein + (it.protein || 0),
      carbs: acc.carbs + (it.carbs || 0),
      fat: acc.fat + (it.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
