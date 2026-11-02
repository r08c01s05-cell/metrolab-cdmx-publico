# Bolsa y navegación · revisión 186

La bolsa conserva su preparación física (tomar → preparar en el tapete → incorporarse → equipar), con una guía visible y botones equivalentes al clic sobre las herramientas y el tapete. Solo se equipa al terminar la secuencia. La guía permite volver a caminar y muestra la fase actual.

Los eventos de la bolsa se limitan al canvas: ya no bloquean los botones de primera persona, ayuda ni el menú situados encima de la escena. WASD o Ctrl cierran la bolsa, restauran la posición previa y continúan con caminar o agacharse. El botón de primera persona también cierra la bolsa antes de solicitar la captura del mouse; el botón derecho recupera el arrastre de cámara. Esc y Tab siguen cancelando/cerrando sin dar por preparada una herramienta incompleta.

Se añadió forro acolchado, refuerzos y doble costura interior al modelo existente, conservando los bolsillos, las herramientas y la solapa articulada. Los detalles repetidos usan instancias para limitar llamadas de dibujo.

El estado del menú principal admite que la portada actual no incluya los contadores de carrera de la portada antigua. Esa ausencia provocaba un error al actualizar el estado general de la aplicación.

La verificación de controles incluye clics sobre los botones de la guía, preparación completa de una herramienta, exclusión de botones de interfaz de los eventos de la bolsa, salida con W y agacharse con Ctrl. No reemplaza la revisión visual y de rendimiento con GPU.

La colocación del instrumento conserva las teclas de movimiento/postura que siguen pulsadas al empezar. Se comprobó en navegador la secuencia tomar instrumento → preparar → abrir bolsa → Ctrl → recuperar postura → activar primera persona → girar con mouse. También abrieron flota, taller, conducción y red. Esa prueba de entrada/navegación omite las llamadas de dibujo; el modelo de bolsa se renderizó por separado con WebGL por software.
