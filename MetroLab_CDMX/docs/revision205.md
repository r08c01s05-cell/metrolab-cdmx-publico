# Revisión 205 · materiales y detalle del entorno

## Acabados en las vistas del simulador

Se añade una capa de acabado a la pintura, los paneles, el acero cepillado y
pulido, cobre, fundición, caucho, asientos, cerámica, terrazo, concreto, lona y
filtros. Combina variación de color y rugosidad a escala de pieza con el relieve
fino existente: agregado mineral, poros, variación del esmalte, mecanizado y tejido.
La capa utiliza coordenadas independientes y no sustituye las texturas originales,
sus mapas PBR, los colores base ni los UV de carteles, planos, letreros o mapas.
No añade moteado a rostros. Las superficies transparentes conservan visibilidad
interior; el vidrio utiliza respuesta física con índice 1.5 y reflejo más definido,
sin la pasada adicional de transmisión.

Los materiales conservan el acabado al clonarse en la flota, el taller, la
subestación y los andenes. Todos utilizan los mismos ocho mapas RGBA de 256 px:
2 MiB antes de mipmaps. Se genera una vez cada familia utilizada, no en cada
cuadro ni para cada objeto. El shader añade una muestra de textura; el modo
Rendimiento omite esa muestra mediante un uniforme compartido. Las llamadas de
dibujo y la topología de los modelos existentes no aumentan por esta capa.

## Andenes, nave y taller

- Juntas y agregado del piso, con normales independientes del color.
- Relieve de botones de la franja podotáctil mediante mapa de normales lineal;
  ya no se trata una imagen de color iluminada como altura. Se preservan los
  mapas de normales originales que ya tuviera una superficie.
- Placas de asiento, cabezas hexagonales y patín inferior de riel, bandejas y
  soportes de canalización, juntas de losa y carcasas de luminaria en la nave.
  Los accesorios repetidos usan como máximo siete lotes instanciados, sin añadir
  objetivos de interacción ni colisiones. El taller comparte esos acabados.
- Las sombras de inspección usan 2048 px en modo Cinemático y 1024 en Equilibrado;
  se desactivan en Rendimiento. Se mantiene la resolución adaptativa existente.

Son acabados visuales de las escenas existentes, sin atribuir dimensiones,
materiales o especificaciones de fabricante verificadas a los nuevos accesorios.
Se conservan las prácticas, puertas, agarres, rutas L1/L8, flota y Biblioteca.

## Verificaciones y límites

`verificar_colaboracion.mjs` pasa completo e incluye `verificar_realismo205.mjs`:
conservación de mapas/colores/UV/topología, clonación de shader, idempotencia,
presupuesto de texturas, exclusión de letreros/piel, modo Rendimiento, geometría
instanciada sin interceptar rayos, mapas de relieve y sombras según calidad.
El grafo de ejecución contiene 179 módulos, válidos y con una URL por módulo.

`verificar_render205.cjs [URL] [prefijoPNG]` dibuja realmente con Chromium/WebGL
por software los modelos nativos MP-82 y subestación, más una muestra de pisos y
accesorios. Compilación de shaders válida y sin errores WebGL; también verifica
que Rendimiento desactive la capa. En la comparación de la misma vista MP-82
sin agrupar: 1941 llamadas/476854 triángulos antes y después; texturas GPU 46→52.
La vista agrupada de prueba usa 160 llamadas, por el agrupado ya existente, no por
una optimización nueva. No se midieron FPS en la GPU del usuario ni se afirma
fotorrealismo a partir de estos acabados.
