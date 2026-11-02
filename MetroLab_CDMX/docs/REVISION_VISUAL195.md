# Revisión por pantalla · 195

## Flota

Se retira la viñeta oscura del selector y se distinguen los muros cálidos del taller del fondo azul grisáceo. El encabezado contiene «Elige un tren» y la salida al menú. Se elimina la segunda entrada a subestación que se inyectaba en ese encabezado; el acceso de la portada se conserva. Los tres modelos tienen botones estables, separados y accesibles incluso después de girar la escena.

## Inspección y despiece

El visor ocupa 78 % de la altura en escritorio y 74 % en móvil, con fondo claro mate. El encuadre aprovecha mejor su superficie, sin cortar piezas; el título y los controles reciben colores legibles sobre el nuevo fondo. El catálogo de planos técnicos deja de montarse en la interfaz. El unifilar de la subestación y sus cálculos se conservan.

## Brazos

Las mangas tienen secciones ovaladas y volumen variable en brazo, codo y muñeca. Se reduce el puño y se retiran los aros rígidos. El recorte del antebrazo incluido en el guante pasa a ser un plano continuo que conserva UV y pesos del esqueleto; ya no elimina triángulos completos dejando un borde dentado. Se comparten la posición de muñeca en cabina y mantenimiento, sin alargar los huesos. La mano derecha descansa entre mandos en vez de tapar un botón. Se mantienen los guantes articulados existentes, sin afirmar que sean modelos humanos escaneados.

## Zona de intervención y franjas

El tapete de trabajo es una lona de 6 mm con tejido, esquinas redondeadas y costuras. La bolsa deja de contener en su árbol el antiguo tablero de preparación invisible, que alteraba sus dimensiones calculadas. Bolsa, tapete y filtro apoyado se comprueban fuera del barrido de puertas y de las canalizaciones. El apoyo del filtro utiliza la altura real de la lona. Las tapas de canalización del suelo se conservan como elementos del modelo.

Las reglas que imponían 850 px de ancho mínimo a todos los canvas se limitan al mapa 2D, su destinatario original. Así no recortan otros visores al cambiar de apartado. Se mantienen los arreglos 194 que eliminan el espacio reservado bajo mantenimiento general y el dock antiguo bajo subestación, tanto con cursor libre como capturado.

La regla que ocultaba todos los `header` desde la portada ahora afecta solo a la cabecera principal: antes también ocultaba «Volver a 3D» en el unifilar y encabezados de inventario. Al terminar de instalar el equipo, se sustituye el mensaje de carga por una instrucción; la práctica ya no parece estar cargando indefinidamente.

El servicio de actualización utiliza el commit recién descargado (`FETCH_HEAD`), en vez de depender de que `origin/main` se actualice como referencia local. Esto cubre checkouts preparados sin un refspec de seguimiento, que podían descargar cambios pero seguir intentando integrar una referencia antigua. Se mantiene la integración solo por avance directo, sin sobrescribir trabajo local.

## Validación

Los controles, transporte físico, apoyo en suelo, barrido de puertas, materiales, cuatro actividades de tren y conducción se verifican sobre los modelos existentes. El chequeo de cabina comprueba además que el índice alcance los seis mandos en los tres trenes con longitudes fijas de brazo y antebrazo.

Pruebas opcionales de navegador, con Playwright instalado fuera del proyecto y el servidor en marcha:

```sh
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_exploracion195.cjs http://127.0.0.1:8001/
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_apartados195.cjs http://127.0.0.1:8001/
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_vista_taller194.cjs http://127.0.0.1:8001/
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_vista_subestacion194.cjs http://127.0.0.1:8001/
```

Estas pruebas omiten dibujos para comprobar navegación, canvas, framebuffer y disposición sin depender de la velocidad de render. Las capturas de flota, despiece, cabina y zona de subestación se revisan por separado con WebGL por software. No constituyen una medición de rendimiento en la GPU del estudiante.

La captura del usuario con «Elige tu tren.» y los párrafos decorativos corresponde a una versión anterior a estas correcciones. Subir un commit no modifica por sí solo los archivos de un Codespace remoto: el servicio de sincronización debe estar activo en esa máquina. El proceso y sus límites siguen documentados en `ACTUALIZACION_AUTOMATICA.md`.
