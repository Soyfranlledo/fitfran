# 0006 - Registro de comidas con IA y biblioteca de ejercicios

- Estado: aceptada
- Fecha: 26 de junio de 2026

## Contexto

Se pidieron cinco mejoras: añadir series extra en caliente, una biblioteca de
ejercicios buscable (no solo las alternativas del plan), ver la evolucion de
peso/reps por ejercicio con un indice que pondere ambos, distinguir el peso de
mancuerna del peso total, y un diario de comidas real con entrada por voz que
calcule calorias y macros.

Dos de ellas chocan con el principio local-first (ver `0001`): la voz necesita
transcripcion y el calculo de macros de texto libre necesita conocimiento
nutricional amplio. Ninguna se resuelve bien con datos empaquetados.

## Decision

### Catalogo de ejercicios empaquetado (no API)

La biblioteca es un fichero versionado (`src/data/exerciseCatalog.ts`), en
espanol y offline (~105 ejercicios), con IDs `cat-...`. El usuario tambien puede crear ejercicios
a mano: viven en un store nuevo `useLibrary` (`fitfran-library`) con IDs
`user-...`. Un resolver unico `findExerciseById` busca en planes, catalogo y
biblioteca, asi el detalle y el historial resuelven cualquier ejercicio. Encaja
con local-first y no añade dependencias.

### Progreso con 1RM estimado (Epley)

El indice que pondera peso y repeticiones es el **1RM estimado** con la formula
de Epley: `1RM ≈ peso × (1 + reps/30)`. Se muestra junto al volumen
(`Σ peso × reps`) y una tabla por fecha o por semana. Es el estandar de la
industria para medir progreso real cuando cambian a la vez carga y reps.

### Tipo de carga por inferencia

`Exercise.load` es opcional (`barra | mancuerna | polea | maquina | corporal`).
El catalogo y los ejercicios creados lo declaran; los de los planes base se
infieren por el nombre con `loadOf` en `workout.ts`, sin tocar sus IDs ni datos.
La columna de peso se etiqueta "Mancuerna" o "Peso (kg)" segun el caso.

### Nutricion por voz con OpenAI (clave en el dispositivo)

Se eligio **una sola clave de OpenAI**, guardada solo en el dispositivo
(`fitfran-ai`, fuera de `BACKUP_KEYS`, igual que el token de la nube). El flujo
es: grabar audio en la app (`MediaRecorder`) → transcribir
(`/v1/audio/transcriptions`) → desglosar en items con kcal y macros
(`/v1/chat/completions`, `gpt-4o-mini`, salida JSON). El resultado es editable
antes de guardarse en el diario (`useFoodLog`, `fitfran-foodlog`). La app llama
directa a `api.openai.com` por `fetch` (CORS permitido), sin backend propio.

## Alternativas consideradas

- **API externa de ejercicios** (wger, ExerciseDB): mas amplia, pero en ingles,
  online y una dependencia mas. Descartada por local-first.
- **Base de datos de alimentos offline / Open Food Facts**: sin clave ni coste,
  pero floja con descripciones libres en espanol ("100 g de arroz cocido") y con
  recetas. La IA da mejor resultado para el caso real de uso.
- **Dos claves (OpenAI para voz + Anthropic para macros)**: Anthropic no
  transcribe audio, asi que la voz exige otro proveedor. Mantener Claude para los
  macros obligaba a dos cuentas/claves; se prefirio un solo proveedor.
- **Anthropic (Claude) para los macros**: descartado al unificar en un proveedor
  porque no cubre la transcripcion.

## Consecuencias

Positivas:

- biblioteca y progreso funcionan offline y sin backend;
- el diario y la biblioteca se sincronizan y exportan como el resto;
- el coste de la IA es de centimos por comida y solo al usarla.

Negativas y limites:

- la voz y el calculo automatico **requieren clave** y conexion; sin clave, el
  diario admite entrada manual;
- el texto/audio de la comida se envia a OpenAI (se documenta al usuario);
- `MediaRecorder`/microfono exigen contexto seguro (HTTPS): funciona en la app
  instalada y en produccion, no en `http://` de red local;
- la clave queda en `localStorage` del dispositivo (app personal): conviene
  ponerle un limite de gasto en la cuenta de OpenAI.

Esta decision no reemplaza `0001`: amplia el modelo permitiendo una API externa
opcional con la clave en el dispositivo, sin servidor propio.
