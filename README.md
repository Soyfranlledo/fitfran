# FitFran 🏋️‍♂️🥗

Tu app personal de **entrenamiento y nutrición**. Minimalista, mobile-first y pensada para usar en el gym desde el iPhone. Todos tus datos se guardan **en tu dispositivo** (no hay servidor ni cuentas).

**🌐 App publicada (HTTPS, instalable, offline):** https://soyfranlledo.github.io/fitfran/

> Cada `git push` a `main` reconstruye y redespliega la app automáticamente (GitHub Actions → Pages).

## Qué incluye

- **Hoy** — resumen del día: entreno, nutrición y salud de un vistazo.
- **Entreno** — rutina de **3, 4 o 5 días** (por defecto 4). Cada sesión incluye ejercicios principales y **alternativas que puedes añadir o quitar según las máquinas disponibles**, todas con registro de pesos y repeticiones serie a serie. Ficha de cada ejercicio con técnica, consejos y tu progreso (gráfica de cargas).
- **Nutrición** — **menú semanal y diario** editable, con calorías y macros por comida. Ajusta tus objetivos: **calorías, % de grasa y macros (proteína / carbos / grasa)**.
- **Salud** — registra **peso, % grasa, pasos y sueño** con gráficas de evolución. Importación desde **Apple Salud** mediante un Atajo (ver abajo).
- **Sincronización en la nube** — opcional. Guarda tus datos en un **Gist privado de tu GitHub** para tenerlos iguales en el móvil y el ordenador, en Safari y en la app instalada, y que sobrevivan a las actualizaciones (ver abajo).

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

## Sincronización en la nube (opcional)

Tus datos viven en tu dispositivo. Para tenerlos **iguales en todos lados** y a salvo de actualizaciones, la app los sincroniza con un **Gist privado de tu cuenta de GitHub** (sin montar servidores ni crear cuentas nuevas).

En **Ajustes → Sincronización en la nube**:

1. Abre el enlace «¿Cómo consigo el token?» → te lleva a GitHub con el permiso `gist` ya marcado.
2. Genera el token y pégalo en la app → **Conectar**.
3. Repite con el **mismo token** en cada sitio que uses (Chrome/Safari del móvil, el icono instalado, el ordenador).

Notas:

- En iPhone, **cada navegador y la app instalada tienen su propio almacén** separado; conecta el token en cada uno y quedan unidos.
- El token se guarda **solo en tu dispositivo** (no se sube al Gist ni a la copia JSON) y da permiso únicamente a `gists`. Puedes revocarlo cuando quieras desde GitHub.
- La fusión nunca pierde datos: al unir dispositivos, un registro vacío no pisa uno con datos reales.

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

## Documentacion del proyecto

Para continuar el desarrollo en una sesion nueva:

1. Lee [`AGENTS.md`](AGENTS.md).
2. Revisa el [estado actual](docs/PROJECT_STATUS.md).
3. Usa el [indice de documentacion](docs/README.md) para arquitectura, datos,
   flujo de trabajo y decisiones.
4. Consulta [`CHANGELOG.md`](CHANGELOG.md) para saber que se hizo y cuando.
