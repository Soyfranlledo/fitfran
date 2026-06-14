# FitFran 🏋️‍♂️🥗

Tu app personal de **entrenamiento y nutrición**. Minimalista, mobile-first y pensada para usar en el gym desde el iPhone. Todos tus datos se guardan **en tu dispositivo** (no hay servidor ni cuentas).

**🌐 App publicada (HTTPS, instalable, offline):** https://soyfranlledo.github.io/fitfran/

> Cada `git push` a `main` reconstruye y redespliega la app automáticamente (GitHub Actions → Pages).

## Qué incluye

- **Hoy** — resumen del día: entreno, nutrición y salud de un vistazo.
- **Entreno** — rutina de **3, 4 o 5 días** (por defecto 4). Lista de ejercicios para marcar como hechos y **registrar pesos y repeticiones** serie a serie. Ficha de cada ejercicio con técnica, consejos y tu progreso (gráfica de cargas).
- **Nutrición** — **menú semanal y diario** editable, con calorías y macros por comida. Ajusta tus objetivos: **calorías, % de grasa y macros (proteína / carbos / grasa)**.
- **Salud** — registra **peso, % grasa, pasos y sueño** con gráficas de evolución. Importación desde **Apple Salud** mediante un Atajo (ver abajo).

## Cómo arrancarla

```bash
npm install      # solo la primera vez
npm run dev      # arranca en modo desarrollo (accesible en tu red local)
```

Verás dos URLs en la terminal:
- **Local** → `http://localhost:5173` (en el Mac)
- **Network** → `http://192.168.x.x:5173` (ábrela en el iPhone, con el móvil en el **mismo WiFi**)

## Instalarla en el iPhone (como app)

1. Abre la URL **Network** en **Safari** en el iPhone.
2. Toca **Compartir** → **«Añadir a pantalla de inicio»**.
3. Se abrirá a pantalla completa, con su icono, como una app nativa.

> Para que funcione **100% offline** (con service worker) Safari necesita HTTPS. En red local funciona y se instala, pero el cacheo offline completo solo se activa si la sirves por HTTPS. Si quieres una URL fija con HTTPS, despliega la carpeta `dist/` (tras `npm run build`) en un hosting estático gratuito (Vercel, Netlify, GitHub Pages). Dime y te lo dejo montado.

## Conectar con Apple Salud

Por seguridad, una web **no puede** leer Apple Salud directamente (eso solo lo hace una app nativa). La forma sencilla y sin cuenta de desarrollador:

1. En la app: pestaña **Salud → Conectar con Apple Salud**.
2. Sigue los pasos para crear un **Atajo de Apple** que lee tus datos (peso, pasos, sueño) y los copia como JSON.
3. Pega el JSON en la app y pulsa **Importar**. Formato:

```json
[
  { "date": "2026-06-14", "weight": 78.4, "bodyFat": 15.2, "steps": 9230, "sleepHours": 7.5 },
  { "date": "2026-06-13", "weight": 78.6, "steps": 11020 }
]
```

También puedes meter los datos a mano con el botón **＋** (rápido desde el móvil).

## Personalizar

- **Rutinas** → `src/data/workoutPlans.ts` (ejercicios, series, reps, técnica).
- **Menú** → `src/data/weeklyMenu.ts` (o edítalo desde la propia app, comida a comida).
- **Colores / estilo** → `src/index.css` (variables de tema).

## Stack

React + TypeScript + Vite + Tailwind v4 + Zustand (persistencia local) + PWA.
