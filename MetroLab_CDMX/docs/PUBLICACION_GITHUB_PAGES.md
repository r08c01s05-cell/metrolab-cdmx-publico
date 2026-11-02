# Publicación automática

El flujo `.github/workflows/pages.yml` verifica el simulador y publica únicamente `MetroLab_CDMX/dist` al recibir commits en `main`. No requiere npm install ni claves adicionales. Los archivos fuente históricos y los ZIP quedan fuera de la publicación.

## Activación inicial por el propietario

En el repositorio GitHub abre **Settings → Pages → Build and deployment → Source → GitHub Actions**. Si GitHub Actions está deshabilitado para el repositorio, actívalo en **Settings → Actions → General**.

Después abre **Actions → Publicar simulador en GitHub Pages → Run workflow → main → Run workflow**. En futuras actualizaciones el despliegue se ejecuta automáticamente con cada push a main. Si una comprobación falla, la versión publicada anterior se conserva; revisa el registro del flujo.

La URL esperada, una vez finalizado el primer despliegue, es:
https://santiagogonzalezfernandojavier-maker.github.io/metro-/

La URL efectiva aparece en Settings → Pages y en el trabajo Publicar. GitHub Pages publica el sitio para cualquiera que tenga el enlace. El repositorio y la cuenta deben admitir Pages y tener cuota disponible.

## Uso

Abre siempre el enlace de GitHub Pages para ver la última publicación terminada. El despliegue tarda unos minutos después de subir cambios. Recarga una pestaña ya abierta para cargar la nueva versión. El enlace de Codespaces sigue mostrando los archivos de esa máquina; no se actualiza por este flujo.

No se promete recarga forzada durante una práctica: evita perder el progreso de una sesión. La página existente de chatgpt.site se administra por separado.
