# Arquitectura

## Vista general

FitFran es una aplicacion React estatica y local-first:

```text
Pantallas React
    |
    +-- componentes visuales compartidos
    |
    +-- stores Zustand persistidos
    |       |
    |       +-- localStorage del navegador
    |
    +-- datos base TypeScript
            |
            +-- planes de entrenamiento
            +-- menu semanal
```

No hay API, base de datos remota, autenticacion ni procesos de servidor.

## Stack

- React 18
- TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand 5 con middleware `persist`
- React Router con `HashRouter`
- Lucide React
- `vite-plugin-pwa`
- GitHub Actions y GitHub Pages

## Estructura del repositorio

```text
.
|-- AGENTS.md                 # entrada para sesiones nuevas
|-- CHANGELOG.md              # historial visible del producto
|-- docs/                     # contexto tecnico y operativo
|-- public/                   # iconos y recursos PWA
|-- scripts/                  # utilidades de mantenimiento
|-- src/
|   |-- components/           # UI reutilizable
|   |-- data/                 # planes y menu inicial
|   |-- lib/                  # stores y logica de dominio
|   |-- pages/                # pantallas y rutas
|   |-- index.css             # tema, tokens y animaciones
|   |-- main.tsx              # router y montaje
|   `-- types.ts              # contratos de dominio
|-- vite.config.ts            # build y PWA
`-- .github/workflows/        # despliegue
```

## Rutas

La aplicacion usa hash routing para funcionar correctamente en GitHub Pages.

| Ruta | Pantalla | Responsabilidad |
| --- | --- | --- |
| `#/` | `Today` | Resumen del dia |
| `#/entreno` | `Training` | Plan semanal y reasignacion |
| `#/entreno/historial` | `TrainingHistory` | Sesiones y volumen |
| `#/entreno/sesion/:dayId` | `WorkoutSessionPage` | Registro del entreno |
| `#/entreno/ejercicio/:exId` | `ExerciseDetail` | Tecnica e historial |
| `#/nutricion` | `Nutrition` | Menu y objetivos |
| `#/salud` | `Health` | Metricas e importacion |
| `#/ajustes` | `Settings` | Perfil, backup y datos |

La barra inferior solo muestra Hoy, Entreno, Nutricion y Salud. Ajustes se abre
desde Hoy.

## Capas

### Paginas

Las paginas conectan UI, stores y helpers de dominio. La mayor parte del flujo
de usuario se resuelve en esta capa.

### Componentes

- `Header`: titulo, subtitulo, volver y accion derecha.
- `TabBar`: navegacion principal.
- `Card`, `Pill`, `Segmented`, `SectionTitle`: primitivas visuales.
- `Sheet`: panel modal inferior.
- `ProgressRing` y `Sparkline`: visualizacion de progreso.

### Datos base

- `src/data/workoutPlans.ts`: rutinas de 3, 4 y 5 dias, tecnica y alternativas.
- `src/data/weeklyMenu.ts`: menu semanal inicial y calculo de totales.

Estos datos son codigo versionado. El usuario puede modificar parte de ellos en
ejecucion mediante stores persistidos.

### Logica y estado

- `src/lib/store.ts`: todos los stores Zustand, persistencia y backup.
- `src/lib/workout.ts`: plan efectivo, progreso, duracion y colores musculares.
- `src/lib/nutrition.ts`: calculadora de calorias y macros.
- `src/lib/date.ts`: fechas locales y dias de la semana.

Los contratos compartidos viven en `src/types.ts`.

## Flujo de una sesion de entrenamiento

1. La ruta recibe `dayId`.
2. `findDay` localiza el dia en cualquiera de los planes.
3. `ensureSession` crea una sesion para `fecha + dayId` si no existe.
4. Los ejercicios principales se convierten en logs activos.
5. La pantalla combina principales y alternativas para saber:
   - activos: tienen entrada en `session.logs`;
   - disponibles: no tienen entrada en `session.logs`.
6. `addExercise` crea un log con sus series.
7. `removeExercise` elimina el log de esa sesion.
8. Peso, repeticiones y completado se escriben directamente en el store.
9. El historial busca por ID de ejercicio a traves de todas las sesiones.

Esta representacion evita guardar otra lista de seleccion, pero significa que la
presencia del log es parte del contrato de dominio.

## Entrenamiento efectivo por semana

Los planes base tienen un `weekday`. `usePlan.weekdayOverride` guarda solo las
reasignaciones. `effectivePlan` combina ambos y ordena los dias. Si se asigna
una sesion a un dia ocupado, las dos sesiones intercambian su dia.

## Nutricion

El menu base se carga desde `DEFAULT_MENU`. Las ediciones sustituyen la comida
correspondiente en el store persistido. La calculadora usa Mifflin-St Jeor,
factor de actividad y porcentaje de ajuste; reparte macros con proteina de
`2 g/kg`, grasa de `0.8 g/kg` y carbohidratos para completar calorias.

## PWA y despliegue

- En local, Vite sirve desde `/`.
- En GitHub Actions, `base` pasa a `/fitfran/`.
- La PWA usa `registerType: autoUpdate`.
- Workbox precachea recursos estaticos.
- Cada push a `main` construye `dist/` y lo publica con GitHub Pages.

Consulta `WORKFLOW.md` antes de afirmar que una version esta desplegada.

## Criterios de diseño

- Prioridad movil y uso con una mano.
- Controles tactiles grandes.
- Informacion densa pero escaneable durante el entrenamiento.
- Tema oscuro con color de acento verde para entrenamiento.
- Persistencia inmediata, sin boton global de guardado.
- Dependencias y abstracciones minimas mientras la app siga siendo personal.
