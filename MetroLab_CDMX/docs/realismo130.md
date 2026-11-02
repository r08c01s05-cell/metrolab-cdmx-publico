# Revisión visual 130

Se conserva la geometría de referencia y la paleta del Metro. Esta revisión reduce el aspecto plástico mediante rugosidad, microrelieve, reflexión e iluminación; no sustituye los modelos por una reconstrucción fotogramétrica.

- Respuesta de color Neutral en taller, inspección, recorrido, mantenimiento y exploración de subestaciones.
- Pintura y asientos con menos capa brillante; piel, tejidos, acero y pisos con relieve y reflejos más moderados.
- Entornos de reflexión con fuentes más suaves y neutrales. Iluminación ambiental reducida para conservar volumen.
- Sombras acotadas a 1024 px en inspección de trenes y subestaciones, desactivadas por calidad de rendimiento o presupuesto adaptativo cuando está disponible. No se activa una pasada global de sombras para toda la línea.
- Patrones de ropa menos contrastados. Simplificación de pasajeros lejanos con mejor conservación de UV. Se mantienen afluencia y límite de 64 esqueletos detallados.
- El acabado de superficie también se aplica a los modelos nativos de subestaciones y bancos técnicos.

## Comprobación

Auditoría de 67 GLB: se conservan mapas originales, UV y colores. Pruebas de escena, interacción de mantenimiento, actividades técnicas, carga de pasajeros, navegación, cámaras y controles. Las importaciones compartidas utilizan una única versión por módulo.

La recompresión de rectificadora.glb.gz es sin pérdida: el GLB descomprimido es idéntico al anterior.

assets-source/realismo130 contiene una comparación auxiliar renderizada con Blender con cámara idéntica. No es una captura del motor WebGL: los materiales se aproximan desde los parámetros del sitio. La preparación del GLB de vista previa elimina únicamente animaciones no utilizadas en esa comparación; el GLB original servido no se modifica.

No se ha medido FPS ni se ha verificado visualmente el resultado WebGL en navegador. El realismo geométrico de rostros, manos y piezas sigue limitado por los modelos fuente disponibles.
