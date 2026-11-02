# Revisión 143 · Puntas de prueba e interacción de mantenimiento

Base: versión 142, commit e311d372323082e309feafa5a7026b45da599512. Corrección motivada por el reporte de puntas extrañas y actividades que no respondían.

## Fallos reproducidos y corrección

- La búsqueda general de acciones recorría todos los ancestros y conservaba el último. En el selector del multímetro devolvía la carcasa, perdiendo meterMode125. Ahora conserva el control más cercano y la carcasa no anuncia una acción inexistente.
- El centro de la rueda y del marco de tapa no tiene superficie. Un clic central podía no encontrar pieza. Los objetivos activos visibles tienen tolerancia de 18 píxeles en su centro; los tornillos conservan el selector específico con tolerancia y oclusión. No se amplían todos los objetos ni se muestran piezas ocultas.
- Las acciones con botones de SR no equipaban la herramienta automática. Ahora comparten la misma regla que mouse/E, respetando el modo manual. Cada misión nueva restablece el modo guiado.
- En anchuras menores de 1000 px, instrucciones e instrumentos podían cubrir el área de trabajo. Se reserva una columna o una franja superior separada del canvas, manteniendo accesibles las acciones y la retirada de puntas.

## Geometría, contacto y movimiento

Se reutiliza la punta nativa de Blender de herramientas139. Se unifica el marco: punta metálica en el origen, mango en +Z y salida del alivio flexible en [0.06, 0.01, 0.241] m. Antes los cables terminaban en una coordenada del mango o una traslación mundial que no coincidía con el alivio de cable.

Las puntas se aparcan en soportes laterales modelados en el Blender de instrumentos. Se retiran del contacto anterior, viajan por delante del tablero, se orientan y asientan en el siguiente punto; vuelven a los soportes al retirarlas. No se eliminan ni reaparecen. La animación de piezas sueltas no vuelve a aplicar un segundo movimiento sobre las puntas. El cable tiene radio de 2.5 mm, actualiza sus buffers existentes y llega a la salida del alivio nativo.

Se cambia la inclinación de contacto para distinguir el mango desde el frente, conservando la punta metálica sobre el borne. Las pruebas comprueban los vértices metálicos reales, además del anclaje lógico, y conjuntos trasladados/girados.

Diodos, aislamiento, relé y circuito general comparten este sistema. El circuito auxiliar SR también muestra ambas puntas y una referencia COM del banco ficticio. La ventilación usa anemómetro, sin puntas eléctricas. La retirada de puntas de F1 precede a su sustitución; se mantiene disponible retirar una o ambas puntas. La misión general espera a que terminen de recogerse antes de mostrar su finalización.

No se modifican tensiones, lecturas ni criterios del escenario: siguen siendo bancos educativos ficticios, sin datos nuevos de fabricantes ni del Metro real.

## Archivos

- dist/measurement-probes143.js: marco de puntas, soportes, orientación y animación.
- dist/maintenance-picking143.js: control más cercano y tolerancia de objetivos activos.
- dist/service-measurement143.js: dos puntas del circuito auxiliar.
- dist/maintenance143.css: área de trabajo separada de instrucciones/controles.
- scripts/build-instruments142.py y assets-source/revision142/instrumentos142.blend: actualizados con soportes laterales; GLB comprimido servido con URL de revisión 143.
- scripts/verificar_mouse143.mjs: diez actividades mediante eventos pointerdown/move/up sobre coordenadas proyectadas de las piezas reales. No sustituye pick() ni ejecuta las misiones mediante llamadas directas a la máquina de estados. Comprueba que los puntos estén dentro del canvas.
- scripts/verificar_puntas143.mjs: contacto metálico real, orientación, recogida, cable continuo y buffers persistentes.
- assets-source/revision143: exportaciones y escenas Blender de inspección de los ensamblajes actuales. Son pruebas geométricas PBR sin mapas raster ni LCD de DOM, no capturas de navegador ni sustitutos de los modelos de producción.

## Verificación y límites

Las diez actividades completan 308 acciones de mouse, además de botones guiados y selector de modo anidado. También pasan las comprobaciones de puntas, herramientas, gestos/arrastre/cancelación, diez recorridos de estado y cargas. Se revisan renders nativos de puntas aparcadas, diodos, circuito auxiliar y tablero general.

Se conserva el arranque y los controles de conducción. El ensayo histórico de interacción 116 se actualiza para quitar query strings al leer archivos y reconocer el presupuesto de herramientas nativas 139 (12 mallas y menos de 22,000 vértices); no se sustituye por una prueba de progreso únicamente.

No hay navegador de prueba disponible en este entorno. Estas pruebas utilizan geometría, cámaras, rayos y manejadores reales en un DOM de prueba; no certifican composición visual CSS en Chrome ni FPS en el equipo del usuario.
