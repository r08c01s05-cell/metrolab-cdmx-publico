# Referencias interiores L8 y Garibaldi/Lagunilla · revisión 141

## Fuentes aportadas

Se conservaron las cuatro fotografías originales y el video de 14.29 segundos en `assets-source/referencias141/`. Las imágenes 011259 y 011308 muestran techo, luminarias lineales, difusor y uniones de pasamanos; 011316 muestra el pavimento interior gris de grano fino; 011323 aporta el detalle de cubierta estriada, abrazadera, tornillería, altavoz y alarma. El video muestra andenes de Garibaldi/Lagunilla, piso gris con juntas, borde claro, franja táctil amarilla separada del borde, cubierta oscura y luminarias cortas transversales.

Estas vistas no identifican inequívocamente el modelo de tren fotografiado. Se adoptan los detalles visibles como referencia común aproximada para los cuatro coches de NM-79 y MP-82 existentes, sin afirmar que sean idénticos en todos los convoyes. No se deducen dimensiones certificadas, recorridos de accesos ocultos ni una nueva planta a partir de la grabación.

## Cambios integrados

- Luminarias de los cuatro coches: diez módulos por coche sustituyen las dos tiras anteriores y el lote de difusores superpuesto. Cada módulo tiene canal de chapa, cubierta curva, estriado normal embebido, tapas, perfiles, dos abrazaderas y sus fijaciones. La distribución modular y las dimensiones son aproximadas.
- Doce uniones de pasamanos por coche con collar y brida. Se conservan las barras y puntos de contacto con las manos.
- Altavoces circulares con cerco y malla fina en el testero: uno en el coche de cabina y dos en el intermedio. Posiciones aproximadas. Alarma y difusores de la revisión 140 conservados.
- Piso gris interior con albedo, microrelieve y rugosidad embebidos, sin personas ni sombras de fotografías pegadas al material. Techo marfil ligeramente verdoso según las nuevas tomas. Se corrige la orientación de las caras de los pisos cuando su caja anterior estaba invertida.
- Garibaldi: losas grises nominales de 0.90 × 0.60 m, con veta tenue y juntas; se retira la cuadrícula geométrica anterior. La capa acabada queda sobre la losa estructural y con caras hacia fuera. Remate de concreto claro y franja táctil desplazada 0.54 m respecto a su posición anterior; medida visual aproximada, no normativa ni levantada. Botones táctiles mediante normal embebida.
- Cubierta grafito; cincuenta luminarias transversales cortas reemplazan los canales y tubos longitudinales. Se conservan los huecos y la altura libre de escaleras existentes, columnas, publicidad, mapas, monitores, divisiones y metadatos para cortes automáticos.

## Modelado y comprobación

`build-details141.py` crea los accesorios en Blender. `integrate-references141.py` los incorpora al GLB conservando las animaciones y compactando recursos huérfanos. `save-scenes141.py` guarda los cuatro trenes y la estación completos como escenas editables, además del Blender de accesorios. Todos se encuentran en `assets-source/revision141/`.

Se comprueban cantidades, ubicación bajo techo, mapas embebidos, conservación de puertas y clips MP-82, rayos sobre pavimento/borde/franja, apoyos y altura libre en escaleras, pantallas, publicidad, grupos de corte y reducción por lotes del render. Se revisan renders nativos Blender/Cycles con iluminación suave. Estos renders no incluyen pasajeros de ejecución ni sustituyen una prueba WebGL. No se midieron FPS ni se realizó una inspección visual en navegador.

No se modifican demanda horaria, clima, controles, anuncios ni misiones en esta revisión.

Los renders revisados se conservan en `assets-source/revision141/vistas/`, regenerables con `render-references141.py train` o `station`. Se comprobó por rayos que las cubiertas luminosas miren hacia los usuarios y que las luminarias de estación queden entre vigas, sin ocultarse dentro de ellas.
