# Tornillería 131

Las cabezas y arandelas de las cuatro fijaciones de ventilación/tablero y las ocho de rueda son un 45 % más anchas. No cambian el número, la posición ni el recorrido de las fijaciones.

La selección de tornillos añade una tolerancia de 20 píxeles CSS alrededor del centro proyectado. Se mantiene al cambiar distancia, resolución y posición del canvas; elige la fijación más próxima. Comparte la detección entre resaltado y clic del banco de trenes. El mantenimiento de subestaciones usa la tolerancia para el tornillo del paso actual. El alcance adicional rechaza objetivos ocultos, fuera de cámara y cubiertos por geometría opaca.

No se añaden geometrías a cada fotograma ni se cambia la lógica de giro, herramientas y progreso. Verificación de rayos a tres distancias, visibilidad, oclusión y paso permitido; pruebas de las cuatro actividades completas, nativas y de respaldo, e interacción de subestaciones. Sin prueba visual en navegador.
