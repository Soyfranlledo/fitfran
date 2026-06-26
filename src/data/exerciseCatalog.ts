import type { Exercise, LoadType, MuscleGroup } from '../types';

/**
 * Catálogo de ejercicios de gimnasio en español para el buscador "Añadir
 * ejercicio". Es dato versionado (igual que los planes): offline y curado.
 *
 * IDs con prefijo `cat-` para que NUNCA colisionen con los de los planes
 * (`e0…`, `alt-…`) ni con los ejercicios que el usuario crea a mano (`user-…`).
 * Un id es parte del historial: no lo cambies ni lo reutilices.
 */
const c = (
  slug: string,
  name: string,
  muscle: MuscleGroup,
  load: LoadType,
  sets: number,
  reps: string,
  rest: string
): Exercise => ({ id: `cat-${slug}`, name, muscle, load, sets, reps, rest, how: '', cues: [] });

export const EXERCISE_CATALOG: Exercise[] = [
  /* ----------------------------- Pecho ----------------------------- */
  c('press-banca-barra', 'Press banca con barra', 'Pecho', 'barra', 4, '6-10', '120s'),
  c('press-banca-mancuernas', 'Press banca con mancuernas', 'Pecho', 'mancuerna', 4, '8-12', '90s'),
  c('press-inclinado-barra', 'Press inclinado con barra', 'Pecho', 'barra', 4, '6-10', '120s'),
  c('press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'Pecho', 'mancuerna', 3, '8-12', '90s'),
  c('press-declinado-barra', 'Press declinado con barra', 'Pecho', 'barra', 3, '8-12', '90s'),
  c('press-pecho-maquina', 'Press de pecho en máquina', 'Pecho', 'maquina', 3, '8-12', '90s'),
  c('press-inclinado-maquina', 'Press inclinado en máquina', 'Pecho', 'maquina', 3, '8-12', '90s'),
  c('aperturas-mancuernas', 'Aperturas con mancuernas', 'Pecho', 'mancuerna', 3, '12-15', '60s'),
  c('cruces-polea', 'Cruces / aperturas en polea', 'Pecho', 'polea', 3, '12-15', '60s'),
  c('pec-deck', 'Contractor de pecho (pec-deck)', 'Pecho', 'maquina', 3, '12-15', '60s'),
  c('fondos-pecho', 'Fondos en paralelas (pecho)', 'Pecho', 'corporal', 3, '8-12', '90s'),
  c('flexiones', 'Flexiones', 'Pecho', 'corporal', 3, '10-20', '60s'),
  c('pullover-mancuerna', 'Pullover con mancuerna', 'Pecho', 'mancuerna', 3, '12-15', '75s'),

  /* ----------------------------- Espalda ----------------------------- */
  c('dominadas', 'Dominadas', 'Espalda', 'corporal', 4, '6-10', '120s'),
  c('dominadas-supinas', 'Dominadas supinas (chin-up)', 'Espalda', 'corporal', 3, '8-10', '120s'),
  c('jalon-pecho', 'Jalón al pecho', 'Espalda', 'polea', 4, '10-12', '90s'),
  c('jalon-neutro', 'Jalón agarre neutro', 'Espalda', 'polea', 3, '10-12', '75s'),
  c('remo-barra', 'Remo con barra', 'Espalda', 'barra', 4, '8-10', '120s'),
  c('remo-pendlay', 'Remo Pendlay', 'Espalda', 'barra', 4, '6-8', '120s'),
  c('remo-mancuerna', 'Remo con mancuerna a una mano', 'Espalda', 'mancuerna', 3, '8-12', '90s'),
  c('remo-maquina-pecho-apoyado', 'Remo en máquina con pecho apoyado', 'Espalda', 'maquina', 3, '10-12', '75s'),
  c('remo-polea-sentado', 'Remo en polea sentado', 'Espalda', 'polea', 3, '10-12', '90s'),
  c('remo-t', 'Remo en T (T-bar)', 'Espalda', 'maquina', 3, '8-12', '90s'),
  c('pullover-polea', 'Pullover en polea', 'Espalda', 'polea', 3, '12-15', '60s'),
  c('peso-muerto', 'Peso muerto convencional', 'Espalda', 'barra', 4, '5-8', '150s'),
  c('peso-muerto-sumo', 'Peso muerto sumo', 'Espalda', 'barra', 4, '5-8', '150s'),
  c('encogimientos-barra', 'Encogimientos con barra (trapecio)', 'Espalda', 'barra', 3, '12-15', '75s'),
  c('hiperextensiones', 'Hiperextensiones / lumbares', 'Espalda', 'corporal', 3, '12-15', '60s'),
  c('remo-invertido', 'Remo invertido', 'Espalda', 'corporal', 3, '10-15', '75s'),

  /* ----------------------------- Pierna ----------------------------- */
  c('sentadilla-barra', 'Sentadilla con barra', 'Pierna', 'barra', 4, '6-10', '150s'),
  c('sentadilla-frontal', 'Sentadilla frontal', 'Pierna', 'barra', 4, '6-10', '150s'),
  c('sentadilla-multipower', 'Sentadilla en multipower', 'Pierna', 'maquina', 3, '8-12', '120s'),
  c('sentadilla-goblet', 'Sentadilla goblet', 'Pierna', 'mancuerna', 3, '10-12', '90s'),
  c('prensa-pierna', 'Prensa de pierna', 'Pierna', 'maquina', 4, '10-12', '120s'),
  c('hack-squat', 'Hack squat', 'Pierna', 'maquina', 3, '8-12', '120s'),
  c('zancadas-mancuernas', 'Zancadas con mancuernas', 'Pierna', 'mancuerna', 3, '10-12 por pierna', '90s'),
  c('zancadas-barra', 'Zancadas con barra', 'Pierna', 'barra', 3, '10-12 por pierna', '90s'),
  c('sentadilla-bulgara', 'Sentadilla búlgara', 'Pierna', 'mancuerna', 3, '10-12 por pierna', '90s'),
  c('extension-cuadriceps', 'Extensión de cuádriceps', 'Pierna', 'maquina', 3, '12-15', '60s'),
  c('curl-femoral-tumbado', 'Curl femoral tumbado', 'Pierna', 'maquina', 3, '12-15', '75s'),
  c('curl-femoral-sentado', 'Curl femoral sentado', 'Pierna', 'maquina', 3, '12-15', '75s'),
  c('step-up', 'Step-up al cajón', 'Pierna', 'mancuerna', 3, '10-12 por pierna', '75s'),
  c('sissy-squat', 'Sissy squat', 'Pierna', 'corporal', 3, '12-15', '60s'),
  c('abductores-maquina', 'Abductores en máquina', 'Pierna', 'maquina', 3, '15-20', '45s'),
  c('aductores-maquina', 'Aductores en máquina', 'Pierna', 'maquina', 3, '15-20', '45s'),
  c('gemelos-pie', 'Elevación de gemelos de pie', 'Pierna', 'maquina', 4, '12-20', '45s'),
  c('gemelos-sentado', 'Elevación de gemelos sentado', 'Pierna', 'maquina', 4, '15-20', '45s'),
  c('gemelos-prensa', 'Gemelos en prensa', 'Pierna', 'maquina', 4, '15-20', '45s'),

  /* ----------------------------- Glúteo ----------------------------- */
  c('hip-thrust-barra', 'Hip Thrust con barra', 'Glúteo', 'barra', 4, '8-12', '120s'),
  c('hip-thrust-maquina', 'Hip Thrust en máquina', 'Glúteo', 'maquina', 4, '10-12', '90s'),
  c('puente-gluteo', 'Puente de glúteo', 'Glúteo', 'corporal', 3, '12-20', '60s'),
  c('peso-muerto-rumano', 'Peso muerto rumano', 'Glúteo', 'barra', 4, '8-12', '120s'),
  c('peso-muerto-rumano-mancuernas', 'Peso muerto rumano con mancuernas', 'Glúteo', 'mancuerna', 3, '10-12', '90s'),
  c('patada-gluteo-polea', 'Patada de glúteo en polea', 'Glúteo', 'polea', 3, '12-15 por pierna', '60s'),
  c('abduccion-cadera-polea', 'Abducción de cadera en polea', 'Glúteo', 'polea', 3, '15-20 por pierna', '45s'),
  c('buenos-dias', 'Buenos días (good morning)', 'Glúteo', 'barra', 3, '10-12', '90s'),

  /* ----------------------------- Hombro ----------------------------- */
  c('press-militar-barra', 'Press militar con barra', 'Hombro', 'barra', 4, '6-10', '120s'),
  c('press-militar-mancuernas', 'Press militar con mancuernas', 'Hombro', 'mancuerna', 4, '8-12', '90s'),
  c('press-arnold', 'Press Arnold', 'Hombro', 'mancuerna', 3, '10-12', '75s'),
  c('press-hombro-maquina', 'Press de hombro en máquina', 'Hombro', 'maquina', 3, '8-12', '90s'),
  c('elevaciones-laterales', 'Elevaciones laterales con mancuernas', 'Hombro', 'mancuerna', 4, '12-15', '60s'),
  c('elevaciones-laterales-polea', 'Elevaciones laterales en polea', 'Hombro', 'polea', 3, '12-15', '60s'),
  c('elevaciones-laterales-maquina', 'Elevaciones laterales en máquina', 'Hombro', 'maquina', 3, '12-15', '60s'),
  c('elevaciones-frontales', 'Elevaciones frontales', 'Hombro', 'mancuerna', 3, '12-15', '60s'),
  c('pajaros-mancuernas', 'Pájaros con mancuernas (posterior)', 'Hombro', 'mancuerna', 3, '12-15', '60s'),
  c('posterior-maquina', 'Deltoides posterior en máquina', 'Hombro', 'maquina', 3, '12-15', '60s'),
  c('face-pull', 'Face pull en polea', 'Hombro', 'polea', 3, '15-20', '60s'),
  c('remo-menton', 'Remo al mentón', 'Hombro', 'barra', 3, '10-12', '75s'),
  c('encogimientos-mancuernas', 'Encogimientos con mancuernas (trapecio)', 'Hombro', 'mancuerna', 3, '12-15', '60s'),

  /* ----------------------------- Bíceps ----------------------------- */
  c('curl-barra', 'Curl con barra', 'Bíceps', 'barra', 3, '8-12', '75s'),
  c('curl-barra-z', 'Curl con barra Z', 'Bíceps', 'barra', 3, '8-12', '75s'),
  c('curl-mancuernas', 'Curl con mancuernas', 'Bíceps', 'mancuerna', 3, '10-12', '60s'),
  c('curl-alterno', 'Curl alterno con mancuernas', 'Bíceps', 'mancuerna', 3, '10-12', '60s'),
  c('curl-martillo', 'Curl martillo', 'Bíceps', 'mancuerna', 3, '10-12', '60s'),
  c('curl-inclinado', 'Curl en banco inclinado', 'Bíceps', 'mancuerna', 3, '10-12', '75s'),
  c('curl-concentrado', 'Curl concentrado', 'Bíceps', 'mancuerna', 3, '12-15', '45s'),
  c('curl-predicador', 'Curl en banco predicador', 'Bíceps', 'barra', 3, '10-12', '60s'),
  c('curl-polea', 'Curl en polea', 'Bíceps', 'polea', 3, '12-15', '60s'),

  /* ----------------------------- Tríceps ----------------------------- */
  c('press-frances', 'Press francés con barra Z', 'Tríceps', 'barra', 3, '8-12', '75s'),
  c('extension-triceps-polea', 'Extensión de tríceps en polea', 'Tríceps', 'polea', 3, '12-15', '60s'),
  c('triceps-sobre-cabeza-polea', 'Extensión sobre cabeza con cuerda', 'Tríceps', 'polea', 3, '10-15', '60s'),
  c('triceps-sobre-cabeza-mancuerna', 'Extensión sobre cabeza con mancuerna', 'Tríceps', 'mancuerna', 3, '10-12', '60s'),
  c('patada-triceps', 'Patada de tríceps', 'Tríceps', 'mancuerna', 3, '12-15', '45s'),
  c('press-cerrado', 'Press cerrado con barra', 'Tríceps', 'barra', 3, '8-12', '90s'),
  c('fondos-banco', 'Fondos en banco', 'Tríceps', 'corporal', 3, '10-15', '60s'),
  c('fondos-paralelas', 'Fondos en paralelas (tríceps)', 'Tríceps', 'corporal', 3, '8-12', '90s'),
  c('extension-triceps-maquina', 'Extensión de tríceps en máquina', 'Tríceps', 'maquina', 3, '12-15', '60s'),

  /* ----------------------------- Core ----------------------------- */
  c('plancha', 'Plancha abdominal', 'Core', 'corporal', 3, '40-60s', '45s'),
  c('plancha-lateral', 'Plancha lateral', 'Core', 'corporal', 3, '30-45s por lado', '45s'),
  c('crunch', 'Crunch abdominal', 'Core', 'corporal', 3, '15-20', '45s'),
  c('crunch-polea', 'Crunch en polea', 'Core', 'polea', 3, '12-15', '45s'),
  c('elevacion-piernas-colgado', 'Elevación de piernas colgado', 'Core', 'corporal', 3, '10-15', '60s'),
  c('elevacion-rodillas', 'Elevación de rodillas', 'Core', 'corporal', 3, '12-15', '45s'),
  c('rueda-abdominal', 'Rueda abdominal', 'Core', 'corporal', 3, '8-12', '60s'),
  c('russian-twist', 'Russian twist', 'Core', 'mancuerna', 3, '15-20', '45s'),
  c('mountain-climbers', 'Mountain climbers', 'Core', 'corporal', 3, '30-45s', '45s'),
  c('hollow-hold', 'Hollow hold', 'Core', 'corporal', 3, '20-40s', '45s'),
  c('pallof-press', 'Pallof press en polea', 'Core', 'polea', 3, '12-15 por lado', '45s'),

  /* ----------------------------- Cardio ----------------------------- */
  c('cinta', 'Cinta de correr', 'Cardio', 'corporal', 1, '20-30 min', '—'),
  c('bici-estatica', 'Bicicleta estática', 'Cardio', 'maquina', 1, '20-40 min', '—'),
  c('eliptica', 'Elíptica', 'Cardio', 'maquina', 1, '20-40 min', '—'),
  c('remo-ergometro', 'Remo (máquina de remo)', 'Cardio', 'maquina', 1, '15-30 min', '—'),
  c('escaladora', 'Escaladora (stairmaster)', 'Cardio', 'maquina', 1, '15-25 min', '—'),
  c('comba', 'Comba (saltar a la cuerda)', 'Cardio', 'corporal', 4, '2-3 min', '60s'),
  c('hiit-sprints', 'Sprints / HIIT', 'Cardio', 'corporal', 6, '20-30 s', '60s'),
];

// Guarda de desarrollo: los ids del catálogo también forman parte del historial.
if (import.meta.env.DEV) {
  const ids = EXERCISE_CATALOG.map((e) => e.id);
  const dups = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dups.length) console.error('[FitFran] IDs de catálogo duplicados:', dups);
}
