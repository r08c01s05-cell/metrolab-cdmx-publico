# Navegación continua, brazos, sonido y rueda · revisión 187

## Interacción

Taller y subestación se manejan con WASD, Shift, Ctrl/C y mouse. No hay selector entre caminar, inspeccionar y PAN durante la práctica. Liberar el cursor con Esc no desactiva el movimiento. En el taller J abre las misiones, Tab abre la bolsa y F acerca el objetivo. Con el mouse capturado, E requiere apuntar a una pieza cercana; los botones de ayuda conservan su uso asistido.

La captura del mouse se activa al hacer clic en una zona libre de la escena. Los navegadores requieren ese gesto; no se puede capturar el mouse automáticamente al cargar. El botón derecho conserva el giro por arrastre. La selección/manipulación de piezas recupera el cursor para los gestos precisos. Las prácticas conservan sus estados, herramientas, pasos y comprobaciones: el movimiento continuo no da por completadas acciones.

El taller mantiene al jugador en el pasillo delante del equipo instalado, con límites de zona. No es un mundo abierto ni un sistema general de colisiones de todo el tren. La subestación conserva sus colisiones de equipos. Elegir otra misión sigue iniciando esa práctica.

## Brazos

Mangas con perfil anatómico suavizado, más secciones, pliegues discretos, puños, costuras y protecciones de goma articuladas en los dedos. Se conservan la palma y los dedos articulados existentes, hombros fijos y longitudes de huesos. En primera persona la mano/brazo tienen una postura de reposo. No se afirma reconstrucción fotorrealista de personas.

## Sonido

Se conservan las grabaciones existentes. La salida añade filtrado de extremos de frecuencia, compresión suave y margen de nivel; se conserva el volumen, mute, prioridad de voz y tiempos de anuncios/cierre. Esto mejora la mezcla y reduce picos; no recupera detalle perdido en las grabaciones originales. No se añadieron grabaciones de terceros ni se cambiaron licencias.

## Rueda

La misión de rodadura tenía dos coronas de ocho perforaciones: fijaciones y aligeramientos. El disco didáctico ahora tiene ocho alojamientos periféricos, además del centro, alineados con los ocho tornillos de la misión. Se conserva montaje, desmontaje y ensayo.

## Comprobaciones

- `verificar_juego187.mjs`: locomoción continua, inventario/postura, cursor, geometría y alcance de brazos, y rayos sobre el disco que detectan la eliminación de la corona adicional.
- `verificar_mezcla187.mjs`: filtros, compresión, niveles y regresión de anuncios con el motor de simulación.
- Checks de base: subestación, trenes, conducción, andén e imports.
- Prueba en Chromium de entrada/navegación en ambos entornos. Las comprobaciones de entrada omiten las llamadas de dibujo y no certifican FPS ni la calidad visual en GPU.
