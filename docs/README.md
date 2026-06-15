# Documentacion de FitFran

## Orden de lectura para una sesion nueva

1. [Estado actual](PROJECT_STATUS.md)
2. [Arquitectura](ARCHITECTURE.md)
3. [Datos y persistencia](DATA_STORAGE.md)
4. [Flujo de trabajo y despliegue](WORKFLOW.md)
5. [Historial de cambios](../CHANGELOG.md)

## Documentos

| Documento | Proposito | Cuando actualizarlo |
| --- | --- | --- |
| `PROJECT_STATUS.md` | Foto actual del producto, ultimo trabajo y riesgos | Al terminar una sesion relevante |
| `ARCHITECTURE.md` | Estructura estable, rutas y flujo tecnico | Cuando cambia la organizacion o una responsabilidad |
| `DATA_STORAGE.md` | Contratos de datos, localStorage, backup y migraciones | Cuando cambia un tipo o dato persistido |
| `WORKFLOW.md` | Inicio, desarrollo, pruebas, cierre y publicacion | Cuando cambia el proceso |
| `../CHANGELOG.md` | Cambios visibles agrupados por fecha | Con cada mejora, correccion o lanzamiento |
| `decisions/` | Decisiones tecnicas y sus consecuencias | Cuando una eleccion condiciona trabajo futuro |

## Principio de mantenimiento

No duplicar detalles que ya tienen una fuente clara. El README explica el
producto al usuario; estos documentos explican como mantenerlo. Los detalles de
implementacion pertenecen al codigo y solo se resumen aqui cuando ayudan a
evitar errores futuros.
