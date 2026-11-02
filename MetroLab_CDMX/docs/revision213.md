# Revisión 213 · Acabados fotográficos de L1 y L8

Se revisaron las fotografías locales de las 20 estaciones de L1 y 19 de L8. Se aplican perfiles de materiales por estación: piedra beige, paneles blancos/azules/ocres/lilas, pavimentos pétreos, plafones y bandas de identificación. Se conservan los murales, mapas, pictogramas y carteles ya incorporados en los GLB.

## Alcance y límites

No se modifican los GLB fuente, las posiciones y dimensiones de pisos, andenes ni escaleras, ni el trazado/separación de vías. La cinemática de dos bogies, pasajeros y cámaras permanece intacta. Los perfiles se aplican al cargar cada estación; solo se cargan las estaciones necesarias. Veintitrés mapas compartidos de 512 px evitan crear una textura por objeto.

En las cinco estaciones de superficie se ajustan colores de estructuras/muretes y cerramiento romboidal. Constitución conserva sus dos islas y tres vías, con soportes exteriores blancos más anchos. Las ubicaciones de andenes y escaleras se mantienen. Las nuevas secciones de columnas entran en la captura de obstáculos existente.

Se detectó que el acabado de algunos pavimentos quedaba oculto por la orientación de caras heredada. El material del pavimento y plafón permite ver ambas caras, sin mover vértices: la cara superior texturizada vuelve a ser visible sobre el concreto base. La iluminación difusa del entorno de estación se aproxima mediante el rebote hemisférico; se restaura la iluminación de túnel/cabina al salir, sin añadir luces ni sombras.

No se declara una réplica métrica ni fotorealismo. Las fotos son parciales y algunas corresponden a configuraciones/épocas distintas sin fecha confirmada. Se mantiene la arquitectura GLB existente donde no hay una vista suficiente para reconstruirla. En particular, una sola imagen de Observatorio no permite reproducir todo el complejo superior conservando fielmente sus cotas; el acabado se contrasta, pero su estructura completa sigue pendiente de referencia acotada. En Garibaldi se usa la perspectiva complementaria de acabado claro, evitando mezclarla con la foto antigua amarilla.

## Revisión dentro del simulador

El botón del menú «Revisar estaciones y fotografías · L1 y L8» y el selector ofrecen las 39 estaciones. «Fotografía de referencia» muestra el archivo aportado y los rasgos observados. En estaciones subterráneas se abre la vista de persona para apreciar los acabados; las vistas general/planta, caminar, cambiar de andén y probar circulación siguen disponibles.

Ejemplos: http://127.0.0.1:52448/?previa=L8-05 y http://127.0.0.1:52448/?previa=L1-03 . Requieren el servidor local del proyecto.

## Verificación

- verificar_referencias213.mjs comprueba las 39 referencias existentes, perfiles aplicados, preservación de posiciones/vértices de plataformas y escaleras, conservación del arte original, cara superior de pavimentos mediante raycast y separación de 900 pasajeros frente a los nuevos perfiles de columnas superficiales.
- scripts/protegidos213.json congela el contenido de doce módulos de vías, motor, bogies y pasajeros respecto a f0587b3, excluyendo solo versiones de caché y finales de línea. Se verifica que no hayan cambiado.
- La primera ejecución de la suite compartida pasó. Tras afinar caras de pavimento y rebote de luz, las verificaciones específicas de referencias, geometría, bogies y pasajeros volvieron a pasar. La repetición completa se interrumpió por agotamiento de memoria del proceso de embarque, sin fallo de aserción. Se retomó desde ese control con NODE_OPTIONS=--max-semi-space-size=2 y terminaron correctamente todos los controles restantes (qa-resume213.log). La validación final de la suite quedó completada por bloques, sin cambiar el código del simulador para superar las pruebas.
- Inspección WebGL realizada en Doctores: paneles azules, banda negra/verde, pavimento visible y comparación con la fotografía. La revisión visual posterior de L1 y las superficies quedó pendiente al dejar de responder el navegador de la aplicación. No se declara verificación visual de las 39 estaciones ni medición de FPS de GPU.

## Rasgos usados por estación

| Estación | Referencia local | Rasgos observados |
|---|---|---|
| L1-01 | referencias/fotos18/L1-01.jpg | Piedra beige, franja rosa y piso pétreo oscuro. |
| L1-02 | referencias/fotos18/L1-02.jpg | Paños pétreos beige entre marcos rosas; plafón blanco. |
| L1-03 | referencias/fotos18/L1-03.jpg | Piedra beige, marcos rosas y pavimento gris. |
| L1-04 | referencias/fotos18/L1-04.jpg | Paneles blancos lisos, señal rosa y plafón metálico claro. |
| L1-05 | referencias/fotos18/L1-05.jpg | Paneles claros, franja rosa y techo central oscuro. |
| L1-06 | referencias/fotos18/L1-06.jpg | Paneles blancos con juntas verticales y plafón longitudinal. |
| L1-07 | referencias/fotos18/L1-07.jpg | Paños claros, señalización rosa y correspondencia amarilla. |
| L1-08 | referencias/fotos18/L1-08.jpg | Paños blancos y nivel superior abierto; conservar el acceso existente. |
| L1-09 | referencias/fotos18/L1-09.jpg | Paneles blancos amplios entre marcos rosas; piso pétreo oscuro. |
| L1-10 | referencias/fotos18/L1-10.jpg | Piedra beige, franja rosa y losas grises rectangulares. |
| L1-11 | referencias/fotos18/L1-11.jpg | Piedra gris beige, franja rosa y piso oscuro. |
| L1-12 | referencias/fotos18/L1-12.jpg | Paneles blancos, zócalo negro y plafones claros. |
| L1-13 | referencias/fotos18/L1-13.jpg | Piedra beige, gabinete rojo y marcos rosas. |
| L1-14 | referencias/fotos18/L1-14.jpg | Paneles blancos satinados con zócalo oscuro. |
| L1-15 | referencias/fotos18/L1-15.jpg | Piedra beige veteada, franja rosa y piso pulido. |
| L1-16 | referencias/fotos18/L1-16.jpg | Paños blancos satinados y luminarias longitudinales. |
| L1-17 | referencias/fotos18/L1-17.jpg | Paños claros, vigas y nivel superior visible en la fotografía. |
| L1-18 | referencias/fotos18/L1-18.jpg | Revestimiento beige, vigas oscuras y franja rosa. |
| L1-19 | referencias/fotos18/L1-19.jpg | Piedra beige, banda rosa y cubierta oscura de vigas. |
| L1-20 | referencias/fotos18/L1-20.jpg | Cubierta metálica, paños claros, vidrios superiores y banda rosa; se conserva la planta existente. |
| L8-01 | referencias/L8/L8-01_1485s_perspectiva2.jpg | Columnas claras, basamento verde y plafón modular; usar la perspectiva complementaria, no mezclar con la foto antigua de acabado amarillo. |
| L8-02 | referencias/linea8_57/L8-02.jpg | Paneles claros segmentados, columnas claras y techo modular. |
| L8-03 | referencias/linea8_57/L8-03.jpg | Columnas blancas con zócalo negro, conductos vistos y piso de piedra gris. |
| L8-04 | referencias/linea8_57/L8-04.jpg | Paneles metálicos cuadriculados, marcos oscuros y techo de concreto. |
| L8-05 | referencias/linea8_57/L8-05.jpg | Paneles azules, banda horizontal negra y franja verde. |
| L8-06 | referencias/linea8_57/L8-06.jpg | Paños ocres, banda negra y mosaico geométrico existente. |
| L8-07 | referencias/linea8_57/L8-07.jpg | Plafón de vigas, piso geométrico y pared naranja observada; conservar la planta existente. |
| L8-08 | referencias/linea8_57/L8-08.jpg | Columnas lilas, paneles azul/lila y pasarela con escalera existente. |
| L8-09 | referencias/linea8_57/L8-09.jpg | Revestimiento beige de veta vertical y columnas turquesa. |
| L8-10 | referencias/linea8_57/L8-10.jpg | Estructura gris verdosa, cerchas, cerramiento de malla y pavimento verde/gris. |
| L8-11 | referencias/linea8_57/L8-11.jpg | Estructura violeta, muretes claros y pavimento rosa/gris geométrico. |
| L8-12 | referencias/linea8_57/L8-12.jpg | Vigas azules, malla y pavimento pétreo gris/marrón. |
| L8-13 | referencias/linea8_57/L8-13.jpg | Estructura oscura, murete anaranjado y cubierta clara. |
| L8-14 | referencias/linea8_57/L8-14.jpg | Paños azul grisáceos, columnas claras y mural existente de aeronaves. |
| L8-15 | referencias/linea8_57/L8-15.jpg | Paneles crema con juntas, banda negra y plafón claro. |
| L8-16 | referencias/linea8_57/L8-16.jpg | Paneles amarillo crema, franja negra y gabinetes rojos. |
| L8-17 | referencias/linea8_57/L8-17.jpg | Columnas verde claro y mosaicos turquesa/azul/rosa existentes. |
| L8-18 | referencias/linea8_57/L8-18.jpg | Paños azules, columnas azul/lila, banda negra y mural figurativo existente. |
| L8-19 | referencias/linea8_57/L8-19.jpg | Diagonales blancas, bases verde claro, muretes blancos, escaleras y pavimento pétreo gris. |
