# Estado actual del proyecto

Ultima revision: 15 de junio de 2026.

## Resumen

FitFran es una PWA personal de entrenamiento, nutricion y salud, diseñada para
usarse principalmente desde un iPhone. No tiene backend: la aplicacion, los
planes y toda la informacion introducida por el usuario viven en el navegador.

- Produccion: <https://soyfranlledo.github.io/fitfran/>
- Repositorio: <https://github.com/Soyfranlledo/fitfran>
- Rama de produccion: `main`
- Ultimo cambio funcional desplegado: `452859d`

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
- Exportacion e importacion de una copia JSON.
- Restauracion del menu por defecto.
- Borrado completo bajo confirmacion.
- Instalacion como PWA y uso offline tras cargar la aplicacion.

## Ultimo trabajo realizado

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

### IDs de ejercicios principales

Los ejercicios principales se crean con un contador global (`e0`, `e1`, etc.)
en `src/data/workoutPlans.ts`. Insertar, borrar o reordenar ejercicios antes de
otros cambia IDs posteriores y puede separar el historial existente de su
ejercicio.

Las alternativas nuevas ya tienen IDs explicitos y estables. Una mejora futura
recomendada es migrar todos los ejercicios principales a IDs semanticos y
estables, con compatibilidad para el historial actual.

### Persistencia solo local

Los datos dependen de `localStorage`. Borrar datos de Safari, cambiar de
dispositivo o reinstalar sin copia puede perder el historial. La exportacion
manual es hoy la unica copia de seguridad.

### Cache de la PWA

Tras un despliegue, el icono instalado puede abrir temporalmente el service
worker anterior. Normalmente se resuelve cerrando la app y abriendo una vez la
URL publica en Safari.

### Cobertura de pruebas

No hay tests unitarios, de componentes ni end-to-end. Los cambios deben
validarse con build y una comprobacion manual del flujo afectado.

## Siguientes mejoras candidatas

No hay una tarea comprometida en curso. Las opciones con mas valor tecnico son:

- estabilizar los IDs de todos los ejercicios;
- añadir tests para stores, calculadora y seleccion de ejercicios;
- permitir elegir una alternativa como reemplazo directo en una sola accion;
- ofrecer sincronizacion o copia automatica fuera del dispositivo;
- mostrar una señal de version nueva disponible en la PWA.

Estas ideas no deben implementarse sin confirmar prioridad con el usuario.
