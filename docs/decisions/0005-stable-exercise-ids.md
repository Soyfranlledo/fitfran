# 0005 - IDs de ejercicio explicitos y permanentes

- Estado: aceptada
- Fecha: 16 de junio de 2026

## Contexto

Los ejercicios principales se creaban con un contador global (`e${_i++}`) en
`src/data/workoutPlans.ts`. El ID resultante dependia del orden del fichero, asi
que insertar, borrar o reordenar un ejercicio desplazaba todos los IDs
posteriores. Como el ID es la clave que conecta plan, sesion, ultimo peso e
historial, cualquier reordenacion podia dejar el historial existente huerfano.
Era una deuda conocida (ver `0002`) que convenia cerrar antes de seguir tocando
las rutinas.

## Decision

Convertir los IDs en literales explicitos manteniendo **exactamente los mismos
valores** actuales (`e0`, `e1`, ...). El helper `ex` pasa a recibir el `id` como
primer argumento en lugar de generarlo con un contador.

- Al ser literales, el ID ya no depende del orden: insertar o reordenar no
  afecta a los demas.
- Como ningun valor cambia, **no hace falta migracion**: los datos locales y los
  del Gist sincronizado siguen casando byte a byte.
- Una guarda en modo desarrollo (`import.meta.env.DEV`) avisa por consola si dos
  ejercicios comparten ID.

## Alternativas consideradas

### IDs semanticos con migracion

Cambiar `e12` por algo como `d4-3-sentadilla` es mas legible y casa con el estilo
de las alternativas (`alt-...`). Se descarto ahora porque exige una migracion que,
con la sincronizacion en la nube ya activa, es delicada: el historial vive en
varios dispositivos y en el Gist con los IDs antiguos, y la fusion empareja por
ID. Habria que normalizar ambos lados antes de fusionar para no duplicar ni
perder sesiones. Mucho riesgo para una mejora estetica.

### Dejarlo como estaba

Mantiene el codigo mas corto pero conserva la trampa: la proxima edicion de la
lista de ejercicios podria romper el historial en silencio.

## Consecuencias

Positivas:

- reordenar o insertar ejercicios ya no afecta al historial;
- cero riesgo para los datos actuales (sin migracion);
- la guarda de desarrollo detecta colisiones de ID al editar.

Negativas:

- los IDs siguen siendo opacos (`e12`), no descriptivos;
- al añadir un ejercicio hay que elegir a mano un ID libre;
- renombrar o reutilizar un ID existente sigue requiriendo migracion.
