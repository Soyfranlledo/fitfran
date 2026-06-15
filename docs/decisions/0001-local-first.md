# 0001 - Aplicacion local-first sin backend

- Estado: aceptada (matizada por 0003)
- Fecha: 14 de junio de 2026

> Actualizacion (15 jun 2026): sigue siendo local-first y offline. La
> sincronizacion opcional en la nube (un Gist privado del usuario, sin backend
> propio) responde a la consecuencia negativa "los datos no se sincronizan" y
> respeta la regla de preservar el uso offline. Ver
> [0003 - Sincronizacion en la nube](0003-cloud-sync.md).

## Contexto

FitFran es una aplicacion personal para una sola persona. Debe ser rapida de
usar en el gimnasio, instalable en iPhone, funcionar offline y no requerir
cuentas ni mantenimiento de servidor.

## Decision

La aplicacion se construye como PWA estatica. El estado del usuario se guarda en
`localStorage` mediante Zustand `persist`. GitHub Pages aloja los archivos
estaticos.

## Alternativas consideradas

### Backend con base de datos y autenticacion

Permitiria sincronizacion entre dispositivos y copias remotas, pero añade
cuentas, credenciales, coste operativo, seguridad y una superficie de fallo
innecesaria para la primera version personal.

### Aplicacion nativa de iOS

Tendria acceso directo a HealthKit y mejor integracion del sistema, pero exige
otro stack, firma, distribucion y mas esfuerzo de mantenimiento.

## Consecuencias

Positivas:

- desarrollo y despliegue simples;
- carga rapida y funcionamiento offline;
- privacidad por defecto;
- sin cuentas ni servidor.

Negativas:

- los datos no se sincronizan;
- borrar almacenamiento local puede perder el historial;
- Apple Salud requiere importacion indirecta;
- las migraciones de `localStorage` necesitan especial cuidado.

## Reglas derivadas

- Todo store persistido debe formar parte del backup o justificar su exclusion.
- Los cambios de esquema deben documentar compatibilidad y migracion.
- Una futura sincronizacion remota debe preservar la posibilidad de uso offline.
