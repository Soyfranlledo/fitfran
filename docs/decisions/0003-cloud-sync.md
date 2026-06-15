# 0003 - Sincronizacion en la nube con un Gist privado de GitHub

- Estado: aceptada
- Fecha: 15 de junio de 2026

## Contexto

Los datos vivian solo en `localStorage`. En iOS, Safari y la app instalada (y
cada navegador) tienen almacenes separados. Un entreno registrado en un "cajon"
no se ve en otro, y eso provoco una perdida real: una sesion de pierna se quedo
sin sus pesos al registrarla en un sitio y mirarla en otro tras actualizar.

El usuario pidio que esto no vuelva a pasar y acepto sincronizacion en la nube.
La app es estatica (GitHub Pages), de un solo usuario, y el dataset es un JSON
pequeño que ya se carga entero en memoria.

## Decision

Sincronizar todo el backup (`BACKUP_KEYS`) con un Gist privado de GitHub del
propio usuario (`src/lib/cloud.ts`).

- Autenticacion con un token de GitHub de permiso solo `gist`, guardado en
  `localStorage` (`fitfran-cloud`), una vez por dispositivo. El token no se
  sube al Gist ni entra en la exportacion.
- Subida automatica al cambiar datos (debounce) y bajada al volver a la app;
  cada ciclo hace pull, fusiona y push.
- Fusion "informacion maxima": un registro vacio nunca pisa uno con datos
  reales. Es la salvaguarda directa contra el incidente que origino el cambio.
- Sin dependencias nuevas: se usa `fetch` contra `api.github.com`.

## Alternativas consideradas

### Supabase (base de datos gestionada)

Aporta auth por email y una BBDD real, util si algun dia hay varios usuarios o
analitica. Se descarto para este caso: el dato no es relacional (un unico JSON),
exige mas configuracion (proyecto, tabla, RLS, plantilla de email para el codigo
OTP) y el plan gratuito pausa el proyecto tras inactividad, lo que en una app
personal de gym es probable. Mas piezas que mantener para cero beneficio actual.

### Copia automatica solo local

Snapshots automaticos en el dispositivo. Evita borrados accidentales dentro de
un cajon, pero no une Safari con la app instalada ni protege ante cambio de
dispositivo. No resuelve el problema raiz.

### Seguir solo con exportacion manual

Cero coste, pero depende de que el usuario se acuerde de exportar. Fallo justo
asi en el incidente.

## Consecuencias

Positivas:

- mismos datos en todos los dispositivos y cajones;
- sobrevive a actualizaciones y reinstalaciones;
- la fusion garantiza que no se pierde informacion al unir copias;
- el usuario controla el dato (su Gist) y puede revocar el token cuando quiera.

Negativas:

- hay que pegar el token una vez en cada cajon que se use;
- el token vive en `localStorage` del dispositivo (mitigado: permiso solo
  `gist`, revocable);
- un cajon sin conectar no se respalda.

## Salvaguardas

- El token nunca se incluye en `BACKUP_KEYS` ni en la exportacion.
- La fusion se prueba con el escenario "cajon vacio vs cajon con datos".
- `DATA_STORAGE.md` documenta el contrato de fusion y la clave `fitfran-cloud`.
