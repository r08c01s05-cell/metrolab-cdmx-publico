# Revisión 211 · Pasajeros solidarios con su carro en curvas

La corrección 210 atendía la distribución de pasajeros en andenes. La nueva captura identifica otro defecto: los ocupantes del tren aparecían fuera del vagón al curvar o cambiar la separación entre vías.

## Causa

El render coloca cada carro como un sólido rígido en el centro y la tangente de su tramo de vía. Los personajes, las instancias lejanas y sus apoyos se proyectaban individualmente por la curva usando su coordenada longitudinal y la separación del centro del tren completo. Esa transformación no coincide con el cuerpo del carro, especialmente en los abanicos de entrada y salida de las islas. Las figuras lejanas tampoco seguían el avance visual entre muestras de población.

## Corrección

- `cabinPlacement` conserva el índice del carro y un anclaje lógico por ocupante. El anclaje se conserva también al terminar el embarque.
- `passenger-car211.js` transforma la posición relativa al carro con el mismo centro, vía y orientación que utiliza su carrocería. No deforma, oculta ni recorta personajes.
- Figuras detalladas, instancias lejanas y apoyos de pies comparten esa transformación. Las instancias a bordo se sincronizan en cada dibujo con el avance interpolado del tren; los viajeros en andén conservan su comportamiento.
- Las cámaras de interior y del alumno a bordo también usan la referencia rígida del carro.
- Las posiciones lógicas se conservan, incluida la restauración después de una excepción del renderer. No cambian física, conteos, modelos, materiales, iluminación ni límite de 60 FPS.

## Verificación

`verificar_pasajeros_curva211.mjs`, incluido en las verificaciones compartidas: 24 combinaciones de NM-22/NM-79/MP-82, ambos sentidos y cuatro puntos de curva/transición. Comprueba los 144 ocupantes y 288 apoyos en coordenadas locales de su carro durante tres fases de interpolación, incluso cuando la población contiene una muestra anterior a la posición del tren. Comprueba pausa, cámaras interiores y del alumno, y restauración ante fallo del render. Conserva todos los actores y sus posiciones lógicas.

La suite completa `verificar_colaboracion.mjs` pasó con Python local configurado. Inspección visual del NM-79 saliendo de Constitución de 1917, en seguimiento y con cámara elevada: los ocupantes permanecen en el habitáculo durante la transición. No se declara una medición de FPS de GPU.

Rama de revisión `revision/andenes-superficie-l1-l8`, PR 3. Sin integrar en main.
