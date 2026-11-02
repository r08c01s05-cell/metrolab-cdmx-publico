# Instrucciones para Codex

## Colaboración en GitHub

Trabaja en una rama específica por tarea (`feat/`, `fix/` o `chore/`); no confirmes ni publiques cambios directamente en `main`. Conserva los cambios del colaborador y revisa el estado y las diferencias antes de modificar o integrar trabajo. Publica la rama y prepara un pull request hacia `main` con descripción y verificaciones pertinentes. El usuario autoriza integrar los cambios verificados en `main` sin pedir confirmación adicional. Mantén el trabajo en ramas y los pull requests cuando estén disponibles; si la herramienta de pull requests no está autenticada y las reglas del repositorio permiten integrar mediante Git, puedes hacerlo conservando el historial y sin forzar la publicación. Esta autorización sustituye la exigencia anterior de confirmación por cambio.

Antes de cambiar el remoto, confirma el repositorio compartido usando el enlace que proporcione el usuario. No incluyas credenciales en archivos ni commits.

El remoto compartido es `https://github.com/r08c01s05-cell/metrolab-cdmx-publico.git`. Las ramas `mejora/`, `correccion/`, `feat/`, `fix/` y `chore/` se verifican e integran automáticamente mediante `.github/workflows/validar.yml`. Publica sólo trabajo listo para integrar. No fuerces pushes ni eludas protecciones: si falla la automatización, corrige la causa. Conserva separados los cambios de tareas distintas.

Lee CONTEXTO_CODEX.md antes de editar. Proyecto estático HTML/ES modules/Three.js; `dist/` es código fuente editable, no una salida para borrar/regenerar.
Mantén interfaz y comunicaciones en español. Preserva modos de conducción, seguimiento/red, inspección, mantenimiento de trenes y subestación, rutas L1/L8, cámaras, audios y activos.
No crees módulos con URL de importación duplicada: ejecuta la verificación de imports. Revisa el sincronizador scripts/sync-runtime181.py antes de cambiar sufijos de caché.
No cargues todos los activos históricos en ejecución. Evita añadir librerías o reconstruir arquitectura sin necesidad.
No prometas fotorrealismo ni verificación GPU si no se han comprobado. No inventes datos técnicos, planos ni referencias ausentes. Las prácticas son educativas.
Ejecuta pruebas pertinentes al área cambiada; informa qué se comprobó y sus límites. No publiques ni cambies audiencia/remotos sin que lo soliciten.
