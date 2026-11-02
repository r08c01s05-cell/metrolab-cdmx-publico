# MetroLab CDMX · entrega para Codex

Base: revisión 181, commit 19026c04d76ec05206c55e1e31c0eb2466463a7d, versión publicada 165.

## Restaurar TODO
Descarga TODOS los ZIP de esta entrega. Son ZIP independientes, no volúmenes binarios: extrae cada uno en la misma carpeta padre. Todos crean o completan `MetroLab_CDMX/`; conserva las rutas. `01_codigo_simulador.zip` basta para ejecutar; los demás contienen fuentes, modelos editables y referencias disponibles.

## Ejecutar
Requiere Python 3.10 o posterior y navegador con WebGL. Abre la carpeta MetroLab_CDMX en tu editor y ejecuta:

```sh
python iniciar_simulador.py
```
En Windows puedes abrir INICIAR_SIMULADOR.bat. En macOS/Linux puedes usar python3. No abras dist/index.html mediante file://. No hace falta npm install para ejecutar: Three.js se incluye en dist/vendor. Para detener: Ctrl+C.

## Continuar con Codex
Entrega la carpeta completa y pide: «Lee AGENTS.md y CONTEXTO_CODEX.md. Primero ejecuta las verificaciones de la base; después realiza el cambio solicitado sin eliminar funciones existentes». El chat previo no se importa automáticamente: CONTEXTO_CODEX.md contiene el relevo técnico.

## Estructura
- dist/: aplicación HTML, JavaScript ES modules, CSS, modelos de ejecución, texturas, audios, datos y documentación.
- assets-source/: fuentes Blender, GLB originales/versionados, referencias, documentos y recursos históricos. Hay modelos retirados: no cargarlos todos en ejecución.
- scripts/: scripts de generación/exportación y verificaciones históricas.
- docs/, exports/: documentación y exportaciones conservadas.
- INVENTARIO.csv: ruta, tamaño y SHA-256 de cada archivo original incluido.

## Alcance y límites
Se incluyen los archivos disponibles de la copia actual, no archivos perdidos de adjuntos antiguos ni todo el historial Git. Hay 94 archivos .blend y 174 .glb entre fuentes y ejecución; también existen recursos comprimidos .gz y copias .blend1. No todos los GLB disponen de un .blend equivalente. Las fuentes históricas no garantizan reproducir byte por byte todos los cambios posteriores hechos por código.
La última entrega no reconstruyó personajes fotorrealistas: refinó recursos existentes y controles. Las verificaciones incluidas son de CPU/DOM/geometría; no sustituyen revisión visual con GPU. Este simulador educativo no es una herramienta certificada de operación o mantenimiento real.
Las licencias/atribuciones existentes se conservan; esta entrega no otorga derechos adicionales sobre recursos de terceros.

## Repositorio y publicación
Esta copia no tiene un remoto GitHub configurado. No se ha creado ni enlazado uno nuevo. Puedes crear un repositorio propio desde esta carpeta; usa Git LFS para archivos grandes, según los límites de tu proveedor. No incluye credenciales, configuración privada del alojamiento ni .git. El código local puede seguir desarrollándose independientemente; los cambios locales no actualizan automáticamente la web publicada.

## Comprobar integridad
Tras extraer todos los ZIP, desde MetroLab_CDMX ejecuta `python verificar_entrega.py`.
