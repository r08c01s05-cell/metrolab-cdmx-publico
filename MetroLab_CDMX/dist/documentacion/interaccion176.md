# Interacción y presentación · 176

## Cambios visibles
- Exhibición: fondo grafito, pedestal mate y contraste unificado. Las etiquetas laterales se activan con Identificar piezas; Despiece/Ensamblar comparte un solo botón. Se retiran los controles de giro y ensamblado duplicados de la barra flotante. El encuadre usa el tren y los conjuntos, sin alejar la cámara para incluir todo el pedestal.
- Cabina: los seis botones de texto ya no flotan agrupados encima del pupitre. Mandos abre un panel separado en dos columnas con controles de 46 px y separación de 12 px. Conserva los callbacks e interbloqueos existentes y la manipulación directa del pupitre.
- Subestación: paleta grafito, texto claro y acentos ámbar; separación de botones y menos controles repetidos. La lista de gabinetes queda plegada y la misión conserva un objetivo principal.
- Materiales: se mantienen mapas y UV originales, con microrelieve y oclusión moderados, pintura mate, metal de reflexión contenida y exposición más baja. No se sustituyen los GLB ni se afirma una reconstrucción fotogramétrica.

## Recorrido a pie
En Explorar, pulsa Recorrer a pie. WASD o flechas desplazan la cámara; mantén el botón derecho y arrastra para mirar. C alterna agacharse. Mayús aumenta el paso. Hay límites de sala y colisiones por volumen de equipos. Un clic conserva la interacción con gabinetes. Maqueta completa devuelve la navegación de inspección.

## Bolsa y preparación
B o Mi bolsa inicia la bajada de cámara hacia la bolsa situada en el suelo. La bolsa conserva su escala física; no se pega al objetivo como una pantalla gigante. Selecciona una herramienta en 3D, extráela y pulsa el tapete para prepararla. La cámara se incorpora antes de equiparla. Esc cancela y restaura posición, orientación, campo de visión y controles.

El guante forma parte de las manos; se excluye del inventario físico. Guardar herramienta devuelve el modo Manos libres. No se obtienen herramientas con solo seleccionar un botón oculto. Los instrumentos de las misiones empiezan ocultos y las mediciones requieren preparación desde la bolsa; la misma regla se aplica al selector de modo del instrumento. Las herramientas y piezas conservan su interacción original.

## Comprobación
- Grafo de arranque y sintaxis de todos los módulos; caché de los módulos modificados actualizada.
- Seis misiones montadas de subestación mediante 155 acciones proyectadas de puntero, con preparación de herramientas desde la bolsa y estado inicial del instrumento oculto.
- Movimiento dentro del modelo de sala, agacharse, detenerse al soltar la tecla y límites/colisión con gabinetes.
- Seis herramientas nativas seleccionadas por rayos: extracción → preparación → incorporarse → equipar; cancelación sin equipar. No hay guante dentro de la bolsa.
- Cuatro misiones montadas de tren: 175 acciones de puntero. Conducción, cámaras, acciones del panel y seis modelos/despiece conservados.
- Limitación: el navegador disponible mantiene WebGL deshabilitado. Las comprobaciones geométricas y de interacción son CPU/DOM; no se afirma una inspección visual del render 3D completo ni fotorrealismo certificado.
