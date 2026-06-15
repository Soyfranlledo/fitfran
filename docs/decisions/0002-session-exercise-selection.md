# 0002 - Seleccion de ejercicios dentro de cada sesion

- Estado: aceptada
- Fecha: 15 de junio de 2026

## Contexto

Durante el entrenamiento puede no estar disponible una maquina. El usuario
necesita sustituir un ejercicio en el momento, mantener el registro de peso y no
alterar permanentemente la rutina planificada.

Ejemplo que origino el cambio: despues de sentadilla y prensa, la maquina de
extension de cuadriceps estaba ocupada y se eligio Hip Thrust.

## Decision

Cada `WorkoutDay` mantiene:

- `exercises`: ejercicios principales;
- `alternatives`: opciones adicionales.

Una sesion nueva crea logs solo para los principales. La seleccion activa se
representa por la presencia de cada ejercicio en `WorkoutSession.logs`.

- Añadir = crear el log y sus series vacias.
- Quitar = eliminar el log de esa sesion.
- La rutina base no cambia.
- Progreso y duracion usan los logs activos.
- Historial y ultimo peso siguen funcionando por ID de ejercicio.

## Alternativas consideradas

### Mostrar ocho ejercicios y dejar dos sin hacer

Es simple, pero el progreso siempre pareceria incompleto y no distinguiria entre
un ejercicio omitido y una opcion que nunca se eligio.

### Guardar una lista separada de IDs seleccionados

Es explicita, pero duplica estado con `logs` y obliga a mantener ambas
estructuras sincronizadas.

### Reemplazo permanente en la rutina

No resuelve un problema puntual de disponibilidad y podria cambiar el plan sin
que el usuario lo pretenda.

## Consecuencias

Positivas:

- cambio rapido durante el entrenamiento;
- registro completo para cualquier alternativa;
- seleccion aislada por fecha;
- reutilizacion del flujo existente de series e historial.

Negativas:

- quitar un ejercicio elimina sus datos de ese dia;
- volver a añadirlo empieza con series vacias;
- la presencia de un log tiene ahora significado de seleccion;
- todos los IDs deben ser estables.

## Salvaguardas

- La interfaz confirma antes de quitar un ejercicio con datos.
- Las alternativas tienen IDs semanticos explicitos.
- `DATA_STORAGE.md` documenta el contrato para evitar que futuros cambios
  interpreten `logs` como un simple contenedor pasivo.
