# MetroLab · versión 86

La aplicación abre en una portada con menú: explorar trenes, mantenimiento, conducción y recorridos. El fondo y la sala de selección utilizan el taller 3D. En la sala hay tres vías y los modelos NM-22, NM-79 y MP-82 estacionados. Cada convoy reúne dos cabeceras y siete coches intermedios existentes. La selección por tarjeta o por geometría acerca la cámara y abre el modelo para estudiarlo.

Vistas del modelo seleccionado: exterior, frontal, lateral, interior, cabina y superior. Se mantienen selección de conjuntos, despiece, unidades, formación, documentación y acceso a conducción. El taller y su arquitectura son una escena didáctica, no la réplica de un taller real específico.

Mantenimiento abre el banco, inicia con la herramienta mano y tiene una preparación visible. Arrastrar piezas, tornillos y fijaciones selecciona la herramienta correspondiente; las condiciones de aislamiento y comprobación siguen activas. La mano anatómica de la versión 85 sigue siendo una superposición 2D. Las prácticas usan un banco esquemático; no se han transformado en intervenciones físicas completas sobre todos los mecanismos del GLB.

Se sustituyó la presentación de la interfaz con portada, paleta industrial azul y dorado, navegación al menú, tarjetas de tren, selector de vistas y misión visible. Escape vuelve al menú y detiene la conducción. La geometría del taller agrupa materiales e instancia los coches para evitar multiplicar todos los objetos por nueve. La portada estática no vuelve a renderizar mientras nada cambia.

## Verificación

Pasaron las pruebas de menú y modos, modelo seleccionado y seis vistas, regresos desde conducción, mantenimiento visible y práctica inicial por arrastre, cuatro reparaciones, selección 3D, nueve prácticas anteriores, documentación y conducción de ambas líneas. GLTFLoader real cargó los seis recursos y se comprobaron formación, dimensiones y lotes: NM-22 164.2 m / 88 lotes; NM-79 164.2 m / 75 lotes; MP-82 161.5 m / 61 lotes.

La prueba de texturas en Node utiliza decodificación simulada. No se realizó comprobación visual interactiva en navegador en este entorno; las pruebas no certifican el aspecto o el rendimiento en el equipo del usuario.
