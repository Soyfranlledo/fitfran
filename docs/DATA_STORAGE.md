# Datos y persistencia

## Principio general

Todos los datos del usuario se guardan en `localStorage` mediante Zustand
`persist`. El repositorio contiene valores iniciales, pero no contiene el
historial real del usuario.

Nunca asumas que cambiar un valor por defecto modifica los datos ya persistidos.
Las versiones y migraciones de cada store determinan ese comportamiento.

## Claves de localStorage

| Clave | Contenido | Version |
| --- | --- | --- |
| `fitfran-settings` | Perfil, dias por semana y objetivos | 2 |
| `fitfran-workouts` | Sesiones y series | sin version explicita |
| `fitfran-health` | Peso, grasa, pasos y sueño | sin version explicita |
| `fitfran-menu` | Menu semanal editado | 3 |
| `fitfran-plan` | Reasignaciones de dias | sin version explicita |

Las cinco claves se incluyen en la exportacion de backup.

## Contratos principales

Los tipos fuente viven en `src/types.ts`.

### Ejercicio

```ts
interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  sets: number;
  reps: string;
  rest: string;
  how: string;
  cues: string[];
}
```

El `id` conecta plan, sesion, ultimo peso e historial. Es un identificador
persistente, no un detalle visual.

### Dia de entrenamiento

```ts
interface WorkoutDay {
  id: string;
  name: string;
  focus: string;
  weekday: number;
  exercises: Exercise[];
  alternatives?: Exercise[];
}
```

`exercises` son los ejercicios que empiezan activos. `alternatives` son opciones
disponibles que no se añaden a una sesion hasta que el usuario las elige.

### Sesion

```ts
interface WorkoutSession {
  date: string;
  dayId: string;
  daysPerWeek: number;
  logs: Record<string, ExerciseLog>;
  completedAt?: string;
}
```

La clave externa es `${date}:${dayId}`. Dentro de una sesion, la existencia de
`logs[exerciseId]` significa que ese ejercicio esta activo.

Consecuencias:

- añadir un ejercicio crea su log y sus series vacias;
- quitarlo elimina el log de ese dia;
- volver a añadirlo crea series vacias de nuevo;
- quitar un ejercicio con datos descarta esos datos de la sesion, por eso la UI
  pide confirmacion;
- el progreso cuenta los logs activos, no la lista base del plan.

## Historial de ejercicios

`lastWeightFor` y `ExerciseDetail` recorren sesiones que contengan el mismo ID.
Cambiar el ID rompe la continuidad visible del historial aunque los datos sigan
existiendo bajo el ID anterior.

### Riesgo actual de IDs

Los principales usan un contador global en `workoutPlans.ts`. Su ID depende del
orden de construccion. No insertes ni reordenes ejercicios principales sin
estudiar una migracion.

Las alternativas usan IDs explicitos como `alt-d4-3-hip-thrust` y son estables.

## Settings y migracion

`fitfran-settings` esta en version 2. La migracion v2 introdujo el perfil y los
objetivos personalizados. El `merge` mezcla propiedades anidadas para conservar
ediciones compatibles.

Al subir la version:

1. conserva campos existentes siempre que sea posible;
2. añade defaults para campos nuevos;
3. prueba con estado vacio y con un estado antiguo representativo;
4. documenta el cambio aqui y en `CHANGELOG.md`.

## Menu y migracion

`fitfran-menu` esta en version 3. Su migracion actual reemplaza el menu persistido
por `DEFAULT_MENU` cuando cambia la version.

Subir esta version puede borrar personalizaciones del menu. Solo debe hacerse de
forma intencionada y comunicada.

## Backup

`exportData()` genera:

```json
{
  "_app": "FitFran",
  "_version": 1,
  "fitfran-settings": {},
  "fitfran-workouts": {},
  "fitfran-health": {},
  "fitfran-menu": {},
  "fitfran-plan": {}
}
```

`importData()` valida `_app`, escribe las claves presentes y requiere recargar
la pagina para que los stores se rehidraten.

Al añadir un store persistido nuevo:

1. añade su clave a `BACKUP_KEYS`;
2. actualiza este documento;
3. prueba exportacion e importacion;
4. decide si el formato global `_version` necesita subir.

## Datos de salud

Las entradas se indexan por fecha local `YYYY-MM-DD`. Una importacion combina
campos con la entrada existente del mismo dia. No hay validacion clinica ni
sincronizacion directa con Apple Salud.

## Fechas

`isoDate()` construye la fecha en horario local. No reemplazarlo por
`toISOString().slice(0, 10)`, porque UTC puede asignar el entrenamiento al dia
anterior o siguiente.

## Seguridad de cambios

Antes de modificar datos persistidos:

- identifica la clave y su version;
- comprueba si el cambio es retrocompatible;
- evita renombrar IDs o campos sin migracion;
- prueba rehidratacion con datos previos;
- no uses `localStorage.clear()` en codigo normal de producto;
- conserva la exportacion de backup compatible siempre que sea razonable.
