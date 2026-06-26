# Historial de cambios

Los cambios visibles para el usuario se documentan aqui. Las decisiones
tecnicas de fondo viven en `docs/decisions/`.

## 26 de junio de 2026

### Entreno

- **Series extra**: durante la sesion puedes añadir o quitar series de un
  ejercicio (p. ej. hacer una cuarta serie sobre la marcha).
- **Biblioteca de ejercicios**: nuevo boton "Añadir ejercicio" con buscador
  sobre un catalogo de gimnasio en espanol (~105 ejercicios) y la opcion de
  crear el tuyo a mano. El añadido se registra y guarda historial igual que uno
  del plan.
- **Mancuerna vs peso total**: cada ejercicio indica su tipo de carga (barra,
  mancuerna, polea, maquina o peso corporal). En mancuerna la casilla se etiqueta
  "Mancuerna" para que anotes el peso de una; en el resto, el peso total.
- **Progreso real por ejercicio**: en la ficha de cada ejercicio ves la fuerza
  estimada (1RM por la formula de Epley, que combina peso y reps), el volumen y
  una tabla por fecha o por semana.

### Nutricion

- **Mi dia**: nuevo diario para registrar lo que comes de verdad (aparte del
  menu), con suma de kcal y macros frente a tus objetivos.
- **Registro por voz**: dictas lo que has comido con cantidades y la app lo
  desglosa en alimentos con calorias y macros (editable antes de guardar).
  Tambien puedes escribirlo a mano.
- Requiere una clave de OpenAI que se guarda solo en tu dispositivo (Ajustes ->
  Asistente de nutricion). Coste de centimos por comida; el texto/audio se envia
  a OpenAI solo para el calculo.

### Datos

- El diario de comidas y tu biblioteca de ejercicios se incluyen en la copia de
  seguridad y en la sincronizacion en la nube, sin perder informacion al fusionar.

## 15 de junio de 2026

### Arreglo: finalizar entreno con ejercicios intercambiados

- Al cambiar un ejercicio por una alternativa, el entreno podia quedarse a
  medias (p. ej. 6/7) y "Finalizar entreno" no dejaba rastro visible.
- Ahora un entreno se considera completado cuando lo finalizas
  explicitamente, no solo cuando marcas todos los ejercicios. Hoy y la
  pantalla de sesion reflejan el estado finalizado de forma coherente.

### Sincronizacion en la nube

- Tus datos (entrenos, pesos, salud, menu y ajustes) se sincronizan a un Gist
  privado de tu cuenta de GitHub: los mismos en movil y ordenador, en Safari y
  en la app instalada, y sobreviven a las actualizaciones.
- Conexion con un token de GitHub (permiso solo `gist`), una vez por
  dispositivo, desde Ajustes -> Sincronizacion en la nube.
- Fusion sin perdida de datos: al unir dispositivos, un registro vacio nunca
  pisa uno con datos reales.
- Motivo: evitar el incidente del 15-jun en que un entreno dejo de verse al
  registrarlo en un cajon (Safari) y mirarlo en otro (app instalada).

### Documentacion de continuidad

- Añadida una guia de entrada para sesiones nuevas en `AGENTS.md`.
- Documentados estado actual, arquitectura, persistencia y flujo de despliegue.
- Registradas las decisiones local-first y de seleccion de ejercicios por
  sesion.
- Definido el cierre documental obligatorio para futuras sesiones.

### Ejercicios alternativos por sesion

- Cada entrenamiento ofrece dos opciones adicionales.
- Los ejercicios se pueden añadir o quitar solo para la sesion del dia.
- Las alternativas permiten registrar series, peso, repeticiones e historial.
- La duracion y el progreso se recalculan con los ejercicios activos.
- Añadidos `Hip Thrust con barra` y `Sentadilla bulgara` como alternativas de
  pierna.
- Se pide confirmacion antes de quitar un ejercicio con datos registrados.

Commit funcional: `452859d`.

## 14 de junio de 2026

### Personalizacion

- Perfil inicial personalizado para Fran: 38 años, 186 cm, objetivo de perder
  grasa y actividad moderada.
- Objetivos iniciales establecidos en 2250 kcal, 180 g de proteina, 225 g de
  carbohidratos y 70 g de grasa.
- Menu semanal ajustado al objetivo hipocalorico.

### Entrenamiento y datos

- Añadida seleccion de rutina de 3, 4 o 5 dias.
- Permitida la reasignacion de sesiones a dias de la semana.
- Añadido historial de sesiones, volumen y progreso.
- Añadida calculadora de calorias y macros.
- Añadida exportacion e importacion de copia de seguridad.

### Primera version

- Creada la PWA FitFran con las areas Hoy, Entreno, Nutricion, Salud y Ajustes.
- Añadidos planes de entrenamiento, registro de series, menu, salud y modo
  offline.
- Configurado el despliegue automatico a GitHub Pages.
