# 0004 - El completado de una sesion lo marca `completedAt`

- Estado: aceptada
- Fecha: 15 de junio de 2026

## Contexto

Al intercambiar un ejercicio por una alternativa durante la sesion, la
alternativa entra sin marcar. La sesion se quedaba en un progreso parcial (p. ej.
6/7) y, aunque el boton "Finalizar entreno" guardaba `completedAt`, las pantallas
de Hoy y de sesion decidian "completado" solo por el progreso (`pct >= 1`). El
entreno parecia no finalizar nunca.

## Decision

Una sesion esta completada si el usuario la finaliza explicitamente
(`completedAt`) o si todos sus logs activos estan marcados. Se centraliza en
`isSessionComplete()` (`src/lib/workout.ts`) y lo usan `Today` y
`WorkoutSessionPage`. El historial ya lo decidia por `completedAt`.

No se marcan automaticamente las series como hechas: se respeta lo que el usuario
registro y solo se toma la finalizacion como senal de "entreno terminado".

## Alternativas consideradas

### Mantener el completado por progreso

Es lo que fallaba: cualquier alternativa añadida sin marcar impedia llegar al
100% y el entreno nunca constaba como hecho.

### Marcar todas las series como hechas al finalizar

Dejaria el contador en 7/7, pero falsearia datos que el usuario no registro.

## Consecuencias

Positivas:

- "Finalizar entreno" deja siempre un estado finalizado coherente;
- Hoy, sesion e historial coinciden;
- funciona aunque se intercambien ejercicios.

Negativas:

- una sesion puede constar como completada con progreso parcial (p. ej. 6/7), lo
  cual es intencionado: refleja que el usuario la dio por terminada.
