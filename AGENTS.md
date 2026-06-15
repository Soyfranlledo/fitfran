# Guia de trabajo de FitFran

Este archivo es la puerta de entrada para cualquier persona o agente que empiece
una sesion nueva en el proyecto.

## Antes de tocar codigo

1. Ejecuta `git status --short` y `git log -5 --oneline`.
2. Lee [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).
3. Lee [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y
   [docs/DATA_STORAGE.md](docs/DATA_STORAGE.md) si el cambio afecta comportamiento
   o datos.
4. Revisa las entradas mas recientes de [CHANGELOG.md](CHANGELOG.md).
5. Conserva cualquier cambio local que no hayas creado tu.

## Fuentes de verdad

- Estado actual y ultimo trabajo: `docs/PROJECT_STATUS.md`
- Mapa tecnico y rutas: `docs/ARCHITECTURE.md`
- Persistencia, claves y migraciones: `docs/DATA_STORAGE.md`
- Forma de trabajar, probar y publicar: `docs/WORKFLOW.md`
- Historial visible de producto: `CHANGELOG.md`
- Decisiones que no deben redescubrirse: `docs/decisions/`
- Uso general de la app: `README.md`

El codigo manda si una afirmacion documental se queda antigua. Corrige la
documentacion en la misma sesion.

## Reglas del proyecto

- La aplicacion es personal, mobile-first, en espanol y pensada para iPhone.
- Los datos del usuario viven en `localStorage`; no hay servidor ni cuenta.
- No borres, reinicies ni migres datos persistidos sin estudiar antes
  `docs/DATA_STORAGE.md`.
- Los IDs de ejercicios forman parte del historial. No los cambies sin una
  migracion.
- Mantener el estilo visual actual: oscuro, compacto, tactil y optimizado para
  una anchura maxima de `md`.
- Reutiliza los stores, componentes y helpers existentes antes de crear nuevas
  capas.
- Ejecuta como minimo `npm run build` despues de cambios de codigo.
- Para cambios de interfaz, verifica el flujo principal en una anchura movil
  cercana a 390 px.

## Cierre obligatorio de una sesion

Antes de dar el trabajo por terminado:

1. Actualiza `docs/PROJECT_STATUS.md` si cambia el estado del producto, hay una
   limitacion nueva o queda trabajo pendiente.
2. Añade una entrada a `CHANGELOG.md` si el usuario percibe el cambio.
3. Crea o actualiza una decision en `docs/decisions/` si se adopta una regla
   tecnica con impacto futuro.
4. Actualiza `README.md` si cambia el uso, instalacion o funcionalidad publica.
5. Ejecuta las comprobaciones descritas en `docs/WORKFLOW.md`.
6. Indica con precision si el cambio esta solo en local, subido a GitHub o
   desplegado en produccion.

## Publicacion

La rama de produccion es `main`. Un `push` a `main` activa
`.github/workflows/deploy.yml` y publica GitHub Pages.

No afirmes que un cambio esta publicado hasta comprobar que:

- el commit esta en `origin/main`;
- la accion `Deploy to GitHub Pages` finalizo con `success`;
- la URL publica sirve el nuevo artefacto.

La PWA puede mostrar una version anterior por cache. Consulta
`docs/WORKFLOW.md` para la comprobacion y las instrucciones de refresco.
