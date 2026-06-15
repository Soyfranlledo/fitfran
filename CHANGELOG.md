# Historial de cambios

Los cambios visibles para el usuario se documentan aqui. Las decisiones
tecnicas de fondo viven en `docs/decisions/`.

## 15 de junio de 2026

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
