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

Las cinco claves se incluyen en la exportacion de backup (`BACKUP_KEYS`, ahora
exportado desde `store.ts`).

Existe ademas una clave de configuracion local de la nube:

| Clave | Contenido | Sincronizada |
| --- | --- | --- |
| `fitfran-cloud` | Token de GitHub, `gistId`, `lastSync`, `lastChange` | No |

`fitfran-cloud` no esta en `BACKUP_KEYS`: el token vive solo en el dispositivo,
no se sube al Gist ni aparece en la exportacion JSON.

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

### IDs de ejercicios

Todos los IDs son ahora **explicitos y permanentes** en `workoutPlans.ts`: los
principales como `e0`, `e1`, etc., y las alternativas como `alt-d4-3-hip-thrust`.
Ya no dependen del orden del fichero, asi que insertar o reordenar ejercicios no
afecta al historial existente.

Reglas al editar:

- al añadir un ejercicio, asignale un ID nuevo que no se use en ningun plan;
- no cambies ni reutilices un ID existente sin una migracion (un ID conecta
  plan, sesion, ultimo peso e historial);
- una guarda en modo desarrollo avisa por consola si hay IDs duplicados.

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

## Sincronizacion en la nube

`src/lib/cloud.ts` sincroniza el mismo backup (las cinco `BACKUP_KEYS`) con un
Gist privado de GitHub. Puntos clave para futuros cambios:

- La fusion (`mergeBackups`) sigue la regla "informacion maxima": al unir lo
  local con lo remoto, un registro vacio nunca pisa uno con datos reales. Para
  series compara una puntuacion `done > peso > reps` y conserva la mas completa;
  entrenos y entradas de salud se unen por clave/fecha sin perder ninguno.
- Ajustes y menu (preferencias) se resuelven por el mas reciente segun
  `_meta.updatedAt`, que toma `fitfran-cloud.lastChange` (ultimo cambio real del
  usuario en ese dispositivo), no la hora de sincronizar.
- Al recibir datos remotos se escriben en `localStorage` y se llama a
  `persist.rehydrate()` de cada store; no hace falta recargar la pagina.
- Cualquier store persistido nuevo debe añadirse a `BACKUP_KEYS` para entrar
  tanto en la exportacion como en la sincronizacion.

## Completado de una sesion

`completedAt` es la fuente de verdad de "entreno finalizado". `isSessionComplete`
(`src/lib/workout.ts`) lo considera completado si hay `completedAt` o si todos
los logs activos estan marcados. No volver a decidir el completado solo por el
progreso: al intercambiar un ejercicio la sesion puede quedar a 6/7 y aun asi
estar finalizada. Ver `docs/decisions/0004-workout-completion.md`.

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
