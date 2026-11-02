# MetroLab · versión 88

Se retiraron las tres tarjetas grandes de la parte inferior de la selección de trenes, tanto de HTML como de JavaScript. La selección se hace sobre el tren o su etiqueta. El estado de carga se muestra arriba. Si falta algún modelo, un botón de reintento recupera solo lo pendiente y conserva lo ya cargado, sin duplicar convoyes. Esto contempla la carga fallida de NM-22 visible en la captura del usuario.

La mano anatómica se muestra en reposo dentro del banco de mantenimiento. Al entrar o mover el cursor sobre el banco aparece la mano que lo sigue, incluso si no hay una pieza seleccionada. Al arrastrar se utiliza la pose de agarre. Al soltar o salir vuelve la mano de reposo; nunca se muestran ambas simultáneamente. Los elementos son transparentes a los eventos del mouse y reutilizan la ilustración de mano existente. Se evita reconstruir el SVG durante cada movimiento cuando la pose no cambia.

La mano sigue siendo una superposición visual 2D, no un modelo 3D articulado. El esquema y los mandos de ensayo de mantenimiento se mantienen; la eliminación de opciones corresponde a las tarjetas duplicadas del taller que señala la primera captura.

## Verificación

Pruebas de mano visible antes de arrastrar, seguimiento sobre zona vacía, posición del cursor, pose de agarre y regreso al reposo. Se completaron las cuatro reparaciones por selección, arrastre y giro en 3D. Pasaron también la alternativa esquemática, menú/carga/cancelación, selección y resaltado de trenes y recuperación de cargas ausentes/parciales sin duplicados.

No se realizó comprobación visual interactiva en navegador en este entorno.
