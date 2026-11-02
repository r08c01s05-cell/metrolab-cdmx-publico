# Subestaciones · Blender y menú · revisión 127

La portada incorpora el quinto apartado **Explorar subestaciones** (atajo 5), con la misma guía contextual y botón de entrada que los otros modos. Abre el explorador dedicado sin iniciar un recorrido de tren. Los accesos desde el taller y la simulación se conservan.

El explorador utiliza ahora **un GLB exportado por Blender 4.3**, en lugar del generador geométrico de la revisión 126. El generador queda como fuente de las primitivas iniciales y de las fichas documentales; no se usa como sustitución silenciosa si falla el GLB.

## Archivos editables

En `assets-source/subestaciones127/`:

- `subestacion_rectificadora.blend`: escena métrica editable, 12 conjuntos jerárquicos, cerramientos independientes, geometría por pieza, materiales, texturas empaquetadas, cámara y luces de estudio.
- `subestacion_rectificadora.glb`: exportación de Blender con tres imágenes PBR incorporadas, sin dependencia de Draco.
- `subestacion127.png`: render de Cycles de la escena revisada.
- `base126.json`: primitivas de partida reproducibles.
- `rugosidad_*.png`: mapas de rugosidad editables, también incorporados al .blend y GLB.

Creación reproducible: `node --loader ./scripts/test-loader.mjs scripts/source-substation127.mjs`, después `python3.11 scripts/build-substation127.py` con `bpy==4.3.0`, `numpy<2` y Pillow disponibles. Se utilizó la API real de Blender para crear, modificar, guardar, exportar y renderizar la escena.

Se añadieron biseles nativos, puertas abatidas con tiradores y bisagras, rejillas, tornillos ranurados, rótulos, señales, aspas y rejillas de ventilación, marcas de servicio, correas estructurales y prensaestopas. Las fichas y el alcance documental de la revisión 126 siguen vigentes. La planta es didáctica e ilustrativa, no un levantamiento de una SR concreta.

## Exploración y rendimiento

- Interior/edificio, despiece, selección por clic/lista, acercamiento, aislamiento y pan/zoom.
- Opción independiente para mostrar/ocultar las siete hojas de gabinete y despejar la inspección interna.
- Carga GLB diferida al entrar; reutilización del visor y parada de su animación al cerrar.
- Agrupación por material dentro de cada conjunto y hoja: 94 mallas, 56.371 triángulos; archivo web gzip de 397.689 bytes. Sin duplicar las imágenes en solicitudes externas.
- No se cambian las cantidades, ubicación ni identificación de los locales SAF del recorrido.

## Verificación

- Blender guardó y exportó la escena; se revisó visualmente su render de Cycles.
- `verificar_blender127.mjs`: generador auténtico de Blender, texturas incorporadas, carga real del GLB con GLTFLoader, 12 conjuntos, siete hojas independientes, geometría y escala métricas, límites de mallas/triángulos y agrupación.
- `verificar_portada114.mjs`: los cinco modos, sus callbacks, foco, teclas numéricas y guía contextual.
- `verificar_inspeccion126.mjs`: apertura/cierre, pausa/restauración y reutilización del visor mediante contrato DOM.
- `verificar_sim106.mjs`: regresión de navegación, cámaras y controles de recorrido.

No se ha realizado una prueba visual del sitio en un navegador WebGL ni medido FPS. El render de Blender y las pruebas CPU/DOM no sustituyen esa comprobación.
