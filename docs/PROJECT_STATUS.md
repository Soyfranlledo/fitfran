# Estado actual del proyecto

Ultima revision: 15 de junio de 2026.

## Resumen

FitFran es una PWA personal de entrenamiento, nutricion y salud, diseñada para
usarse principalmente desde un iPhone. No tiene backend: la aplicacion, los
planes y toda la informacion introducida por el usuario viven en el navegador.

- Produccion: <https://soyfranlledo.github.io/fitfran/>
- Repositorio: <https://github.com/Soyfranlledo/fitfran>
- Rama de produccion: `main`
- Ultimo cambio funcional desplegado: `1bf9b84` (arreglo de finalizar entreno).
- Sincronizacion en la nube desplegada en `0f2158d`.

## Funcionalidad disponible

### Hoy

- Saludo y resumen del perfil.
- Acceso al entrenamiento asignado al dia.
- Progreso de la sesion actual.
- Resumen de calorias y macros.
- Ultimos datos de salud.

### Entrenamiento

- Planes de 3, 4 y 5 dias.
- Reasignacion de sesiones a otro dia de la semana.
- Registro de peso y repeticiones por serie.
- Marcado de series y ejercicios completados.
- Historial de cargas por ejercicio.
- Historial de sesiones, volumen y series realizadas.
- Estimacion de duracion.
- Dos alternativas disponibles por sesion.
- Seleccion especifica para cada sesion: un ejercicio se puede quitar y una
  alternativa se puede añadir sin cambiar la rutina base.

### Nutricion

- Menu semanal con vista diaria y semanal.
- Edicion de comidas, cantidades y macros.
- Objetivos diarios editables.
- Calculadora Mifflin-St Jeor con ajuste para perder, mantener o ganar peso.
- Valores iniciales personalizados para Fran:
  `2250 kcal`, `180 g` proteina, `225 g` carbohidratos, `70 g` grasa y
  objetivo de `13 %` de grasa corporal.

### Salud

- Registro manual de peso, grasa corporal, pasos y sueño.
- Graficas de evolucion.
- Importacion mediante JSON generado por un Atajo de Apple Salud.

### Ajustes y seguridad de datos

- Perfil y numero de dias de entrenamiento editables.
- Sincronizacion en la nube con un Gist privado de GitHub: los mismos datos en
  todos los dispositivos y navegadores, conectando con un token (permiso solo
  `gist`) una vez por dispositivo.
- Exportacion e importacion de una copia JSON.
- Restauracion del menu por defecto.
- Borrado completo bajo confirmacion.
- Instalacion como PWA y uso offline tras cargar la aplicacion.

## Ultimo trabajo realizado

### Sincronizacion en la nube

Problema observado: el 15 de junio un entreno registrado en el iPhone dejo de
verse tras actualizar la app. Causa real: en iOS, Safari y la app instalada (y
cada navegador) tienen almacenes `localStorage` separados; se registro en un
"cajon" y se miro en otro. La unica copia era la exportacion manual.

Solucion desplegada (`src/lib/cloud.ts`):

- todo el backup se guarda en un Gist privado de GitHub del propio usuario;
- el token se guarda solo en el dispositivo (clave `fitfran-cloud`), nunca se
  sube al Gist ni entra en la exportacion;
- sube al guardar un cambio (con un respiro) y baja al volver a la app;
- la fusion usa la regla "informacion maxima": al unir lo local con lo remoto,
  un registro vacio nunca pisa uno con datos reales;
- UI en Ajustes -> Sincronizacion en la nube (conectar, estado, sincronizar,
  desconectar).

Se valoro Supabase y se descarto para este caso. Ver
`docs/decisions/0003-cloud-sync.md`.

### Arreglo: finalizar entreno con ejercicios intercambiados

Problema observado: al cambiar un ejercicio por una alternativa, la sesion se
quedaba a medias (p. ej. 6/7) y "Finalizar entreno" no dejaba rastro visible.

Causa: "completado" se decidia solo por el progreso (`pct >= 1`) e ignoraba el
`completedAt` que si se guardaba. Ahora `isSessionComplete()` considera una
sesion completada cuando el usuario la finaliza (`completedAt`), y `Today` y la
pantalla de sesion lo reflejan de forma coherente. El historial ya lo usaba
bien. Ver `docs/decisions/0004-workout-completion.md`.

### Ejercicios alternativos por sesion

Problema observado: durante un entrenamiento una maquina puede estar ocupada y
el usuario necesita cambiar un ejercicio sin perder la posibilidad de registrar
peso y repeticiones.

Solucion desplegada:

- cada dia conserva sus ejercicios principales;
- cada dia ofrece dos alternativas;
- la sesion empieza con los principales activos;
- cualquier activo se puede quitar solo para ese dia;
- cualquier opcion disponible se puede añadir;
- el ejercicio añadido usa el mismo registro e historial que uno principal;
- si se intenta quitar un ejercicio con datos, se pide confirmacion;
- la duracion estimada y el progreso usan la seleccion activa.

Caso validado en la sesion de pierna:

1. Añadir `Hip Thrust con barra`.
2. Registrar `80 kg x 10`.
3. Quitar `Extension de cuadriceps`.
4. Confirmar que quedan seis ejercicios activos y que el registro persiste.
5. Verificar que no hay desbordamiento horizontal a 390 px.

## Estado de calidad

- `npm run build`: correcto.
- TypeScript: validado como parte del build.
- Build PWA de produccion: correcto.
- Despliegue GitHub Pages del cambio funcional: correcto.
- No existe una suite automatizada de tests.

## Riesgos y deuda conocida

### IDs de ejercicios (resuelto)

Los ejercicios principales usaban un contador global, por lo que insertar o
reordenar desplazaba IDs posteriores y podia separar el historial. Desde el
16 de junio de 2026 los IDs son **explicitos y permanentes** (mismos valores
`e0`, `e1`, etc., sin migracion) en `src/data/workoutPlans.ts`, asi que
reordenar o insertar ya no afecta a otros. Una guarda de desarrollo avisa por
consola si dos ejercicios comparten ID. Al añadir un ejercicio nuevo hay que
asignarle un ID no usado; cambiar o reutilizar un ID existente seguiria
requiriendo migracion. Ver `docs/decisions/0005-stable-exercise-ids.md`.

### Persistencia local y cajones de iOS

Los datos viven en `localStorage`, que en iOS esta separado por navegador y por
la app instalada (cada uno es un "cajon" independiente). La sincronizacion en la
nube une todos esos cajones en un Gist comun y es la defensa principal contra la
perdida de datos. Sigue siendo necesario conectar el token en cada cajon que se
use; un cajon sin conectar no se respalda. La exportacion manual continua como
copia adicional.

### Cache de la PWA

Tras un despliegue, el icono instalado puede abrir temporalmente el service
worker anterior. Normalmente se resuelve cerrando la app y abriendo una vez la
URL publica en Safari.

### Cobertura de pruebas

No hay tests unitarios, de componentes ni end-to-end. Los cambios deben
validarse con build y una comprobacion manual del flujo afectado.

## Siguientes mejoras candidatas

No hay una tarea comprometida en curso. Las opciones con mas valor tecnico son:

- añadir tests para stores, calculadora, seleccion de ejercicios y fusion de
  sincronizacion;
- permitir elegir una alternativa como reemplazo directo en una sola accion;
- mostrar una señal de version nueva disponible en la PWA.

Estas ideas no deben implementarse sin confirmar prioridad con el usuario.
