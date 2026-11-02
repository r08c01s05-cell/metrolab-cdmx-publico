# Actualización automática en Codespaces

El servicio mantiene el servidor en el puerto 8001 y consulta `origin/main` cada 60 segundos. La configuración de `.devcontainer` lo arranca cuando Codespaces inicia el contenedor. Al abrir la página se sirven los archivos actuales con `Cache-Control: no-store`.

En un Codespace ya abierto, activar una sola vez desde una terminal nueva:

```sh
cd /workspaces/metro-
git pull --ff-only origin main
python3 MetroLab_CDMX/scripts/servicio_codespace.py
```

Después se puede cerrar esa terminal: el proceso queda separado. Volver a ejecutar el comando no crea otro supervisor. Al detenerse Codespaces se detienen sus procesos; el enlace no estará disponible hasta volver a abrir el Codespace. La configuración de arranque entra en vigor al reconstruir el contenedor existente desde «Codespaces: Rebuild Container»; no es necesario crear ni borrar Codespaces.

No se borran ni guardan automáticamente cambios locales. Si Git no puede avanzar mediante fast-forward, conserva la copia y registra el motivo en `/tmp/metrolab-<identificador>/servicio.log`. Si ya existe un servidor en 8001, lo respeta y toma el puerto cuando se libera. No cambia la visibilidad pública/privada del puerto.

Una pestaña abierta comprueba la versión cada 30 segundos y al recuperar el foco. En la portada recarga automáticamente; durante una práctica muestra «Nueva versión disponible · Actualizar» para que puedas terminar antes de reiniciarla. El servicio no recarga una práctica en progreso ni impide la suspensión de GitHub.

Para acceso independiente del Codespace, el repositorio ya incluye publicación en GitHub Pages mediante `.github/workflows/pages.yml`. Se necesita activar GitHub Actions como origen en Settings → Pages. Un servidor en Codespaces no sustituye un alojamiento permanente.
