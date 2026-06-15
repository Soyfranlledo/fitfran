# Flujo de trabajo

## Inicio de una sesion

```bash
git status --short
git log -5 --oneline
npm install
```

`npm install` solo es necesario si faltan dependencias o ha cambiado el lockfile.

Lee, en este orden:

1. `AGENTS.md`
2. `docs/PROJECT_STATUS.md`
3. las ultimas entradas de `CHANGELOG.md`
4. `docs/ARCHITECTURE.md` y `docs/DATA_STORAGE.md` segun el cambio

Antes de implementar, identifica:

- que comportamiento quiere el usuario;
- si el dato afectado ya esta persistido;
- que pantallas consumen ese dato;
- si el resultado debe quedar solo local o publicado.

## Desarrollo local

```bash
npm run dev
```

- Mac: `http://localhost:5173`
- Red local: usa la direccion que muestra Vite.

La configuracion `.claude/launch.json` tambien arranca `npm run dev` en el
puerto 5173.

## Verificacion minima

### Siempre

```bash
git diff --check
npm run build
```

El build ejecuta TypeScript y Vite. Un cambio no esta terminado si falla.

### Cambios visuales

Verifica al menos:

- anchura movil de unos 390 px;
- ausencia de scroll horizontal;
- barra inferior y areas seguras;
- textos largos;
- controles tactiles;
- estado vacio y estado con datos cuando aplique.

### Cambios de entrenamiento

Comprueba:

- creacion de la sesion del dia;
- registro de peso y repeticiones;
- marcado de serie y ejercicio;
- progreso y duracion;
- ultimo peso e historial;
- comportamiento al recargar.

Si afecta alternativas:

- añadir una opcion;
- quitar un principal;
- quitar un ejercicio con datos y cancelar/aceptar;
- volver a añadir;
- confirmar que solo cambia la sesion del dia.

### Cambios persistidos

Prueba:

- navegador sin estado previo;
- estado anterior compatible;
- recarga;
- exportacion/importacion si cambia una clave;
- migracion si sube una version.

Consulta `DATA_STORAGE.md`.

## Documentacion al cerrar

Usa esta regla:

| Tipo de cambio | Documento |
| --- | --- |
| Estado, riesgo o siguiente paso | `docs/PROJECT_STATUS.md` |
| Cambio visible para el usuario | `CHANGELOG.md` |
| Nueva responsabilidad o flujo | `docs/ARCHITECTURE.md` |
| Tipo, clave, ID o migracion | `docs/DATA_STORAGE.md` |
| Proceso de desarrollo o despliegue | `docs/WORKFLOW.md` |
| Decision con alternativas y consecuencias | `docs/decisions/` |
| Uso general del producto | `README.md` |

No registres cada detalle de codigo. Documenta aquello que una sesion futura
necesita para actuar correctamente.

## Commit

Antes del commit:

```bash
git status --short
git diff --check
npm run build
```

El mensaje debe explicar el resultado, por ejemplo:

```bash
git commit -m "Añade ejercicios alternativos por sesion"
```

No incluyas archivos ajenos al cambio.

## Publicacion

Produccion se publica desde `main`:

```bash
git push origin main
gh run list --workflow deploy.yml --limit 3
gh run watch <run-id> --exit-status
```

Comprobacion final:

```bash
curl -sSI -H 'Cache-Control: no-cache' \
  'https://soyfranlledo.github.io/fitfran/?v=<commit>'
```

Para una señal funcional, descarga el JavaScript que referencia el HTML y busca
un texto o identificador nuevo. No basta con que la URL responda 200.

Un cambio puede estar en cuatro estados distintos:

1. editado localmente;
2. comprometido en Git local;
3. subido a `origin/main`;
4. desplegado y verificado en GitHub Pages.

La respuesta final debe decir cual de ellos se ha alcanzado.

## Cache de la PWA

La app usa service worker y puede mantener el bundle anterior.

Si produccion esta correcta pero el iPhone no cambia:

1. cerrar completamente FitFran;
2. abrir en Safari
   `https://soyfranlledo.github.io/fitfran/?v=<commit>`;
3. esperar a que cargue;
4. cerrar Safari y abrir de nuevo el icono instalado.

No uses la cache como explicacion hasta verificar antes que el despliegue
contiene el cambio.

## Plantilla de cierre de sesion

Al terminar, deja esta informacion en `PROJECT_STATUS.md` o `CHANGELOG.md`:

```text
Fecha:
Objetivo:
Resultado:
Archivos/areas afectadas:
Datos o migraciones:
Pruebas ejecutadas:
Estado de publicacion:
Riesgos o trabajo pendiente:
```

No es necesario copiar literalmente la plantilla si la informacion ya queda
clara en las secciones existentes.
