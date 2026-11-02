# Referencias visuales · revisión 140

Se analizaron las once imágenes aportadas y se conservan en assets-source/referencias140/. La captura 004522 muestra el transformador anterior. 004818/004823 son dos vistas de la alarma de un vagón de Línea 8; 004830/004838 muestran su difusor de techo. 004847 es una lámina ilustrativa de una subestación. 004857–004933 muestran fotografías y dibujos de un rectificador de otro fabricante; se usan para estructura visual, sin atribuirlo al Metro ni adoptar sus valores eléctricos como especificación del STC.

## Cambios

- Cuatro coches de Línea 8: NM-79 y MP-82, cabina e intermedio. Alarma con carcasa plegada, cuatro fijaciones, cerradura triangular, palanca roja en T y placa legible. Difusor con placa cuadrada, cinco aros estampados, centro cerrado y malla posterior. El techo toma un tono verde agua aproximado de las fotos. Se corrige la visibilidad de ambas caras de las carcasas de asientos y se verifica por rayos que la placa de alarma quede delante del panel del testero. No se infieren dimensiones exactas a partir de fotografías.
- Se sustituyen los conjuntos anteriores de ventilación; quedan tres difusores por coche en sus bahías previas. Se representa una alarma en el testero de pasajeros del coche con cabina y dos en el intermedio. Ubicaciones y dimensiones aproximadas.
- Los archivos anteriores del MP-82 contenían clips de puerta con destinos y accesores inválidos. Se reconstruyen sus 16 pistas por coche con tiempos escalares y desplazamiento de su propia hoja. Las animaciones de operación de la aplicación siguen controladas por JavaScript.
- Transformador seco: tres devanados encapsulados ilustrativos en lugar de las capas que producían un aspecto tejido; núcleo, apoyos y terminales diferenciados. Se conservan el tipo seco, los doce conjuntos y las once hojas interactivas.
- Rectificador: bastidor, módulos, aletas y fijaciones detallados, conservando los doce diodos del esquema didáctico existente. No se afirma que reproduzca un fabricante instalado en una estación concreta.
- El contorno de selección de la subestación se muestra brevemente, evitando que una caja permanente tape el equipo durante la inspección.

## Fuentes editables y validación

assets-source/revision140/ contiene seis escenas Blender, los GLB, informe de integración y bases anteriores. scripts/parts140.py y build-references140.py generan las piezas y la subestación; integrate-trains140.py incorpora las piezas y elimina recursos huérfanos, sin remuestrear las texturas conservadas; save-train-scenes140.py conserva las escenas completas editables.

Se agrupan las piezas nuevas por material. Se validan montaje, ausencia de ventiladores antiguos duplicados, familias de corte, conservación de las dieciséis hojas de cada coche, clips del MP-82, ventanas del testero, geometría finita y actividades de mantenimiento. Se revisan renders Blender/Cycles. No se realizaron comprobaciones visuales WebGL ni mediciones de FPS en navegador.
