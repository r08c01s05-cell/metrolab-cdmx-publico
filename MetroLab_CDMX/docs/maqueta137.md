# v137 · Maqueta interactiva y controles compactos

La subestación abre en una perspectiva elevada de baja distorsión, encuadrada a partir de su caja envolvente. La cámara se adapta a formatos vertical, cuadrado y panorámico. Se mantienen visibles los doce conjuntos, la cubierta y los cerramientos; las chapas arquitectónicas se vuelven transparentes para inspeccionar el interior sin eliminar elementos. Al entrar al local se recuperan su opacidad y sus sombras. Los gabinetes abren por sus bisagras.

El recorrido «Explorar equipos» recorre los doce conjuntos, aproxima la cámara y abre los gabinetes correspondientes. El catálogo, la documentación y las vistas secundarias quedan en paneles desplegables. Inicio vuelve a la maqueta; F enfoca el conjunto; E abre/cierra las hojas del equipo seleccionado. Las misiones conservan sus propios controles y no ejecutan el recorrido durante una intervención.

El modelo Blender137 añade collares y aletas aisladoras, bridas, espárragos y tuercas de diodos, pernos de disipadores e interruptores, tirantes y terminales del transformador, cableado curvo y borneras de control, fijaciones de baterías, prensaestopas, arandelas PE, herrajes auxiliares, anclajes civiles y detalles de cubierta y extinción. Los acabados distinguen acero, cobre, cerámica, pintura y elastómero. Conserva las correcciones de cierre136. Es una representación educativa general, no un levantamiento de una SR concreta.

Archivos editables: `assets-source/subestaciones137/`; generador: `scripts/build-substation137.py` (Blender4.3/Python3.11). El GLB web sustituye al anterior para evitar copias duplicadas. El modelo cargado contiene 12 conjuntos, 7 puertas, 143 mallas agrupadas y 179923 triángulos; mantiene 3 imágenes incrustadas. Se conserva el presupuesto de menos de 200000 triángulos. La cubierta transparente no proyecta una sombra opaca sobre el interior de la maqueta.

En seguimiento/conducción, la selección de línea, convoy y audio se traslada a Opciones sin duplicar controles. Permanecen accesibles los mandos de conducción, cámaras, mapa, pausa y menú. Se retiran las leyendas repetidas de la tarjeta de seguimiento y el acceso extra de subestación de esa barra; el apartado principal de subestaciones se conserva.

Verificación: `verificar_maqueta137` prueba encuadre, preservación de los 12 conjuntos, restauración de arquitectura y callbacks del recorrido. `verificar_juego136` comprueba misiones y 767 mallas interiores detrás de las hojas. `verificar_blender127` valida el GLB actual, escala, texturas, puertas y presupuesto. `verificar_sim106` verifica controles trasladados, unicidad de IDs, cámaras, mapa y pausa; `verificar_arranque95` verifica arranque y conducción. Se mantienen las regresiones de mantenimiento y cámara. Render Cycles de la maqueta revisado visualmente.

No se dispone de control-browser: el render de Blender no equivale a la validación visual de la interfaz web ni a una medición de FPS en el equipo del usuario.
