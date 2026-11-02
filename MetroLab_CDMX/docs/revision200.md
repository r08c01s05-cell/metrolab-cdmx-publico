# Revisión 200 · contacto físico, puertas y acceso al vagón

Durante mantenimiento se pueden abrir y cerrar las puertas de gabinete apuntando al tirador original y pulsando E, o mediante clic con el cursor. La indicación aparece únicamente al alcance del brazo. Los dedos cierran antes del giro; mano y antebrazo siguen el tirador y se retiran al soltarlo o quedar fuera de alcance. Es necesario apoyar antes una pieza que se esté transportando. Las hojas conservan su giro hacia el pasillo y no avanzan objetivos por sí mismas. La selección de componentes respeta la oclusión de las hojas y sus colisiones se actualizan al girarlas, sin reconstruir el modelo completo cada cuadro.

## Cambios que acompañan esta revisión

- **S1 del taller:** posición accesible del interruptor y comienzo orientado hacia él. Se evita que OrbitControls aleje al estudiante mientras un diálogo está abierto: la cámara del alumno conserva el control incluso durante la carga. E desenergiza desde la posición inicial; F continúa enfocando sin trasladar al estudiante.
- **Cabina y destornillador:** orientación de palmas, oposición del pulgar y cierre de dedos corregidos sobre el esqueleto existente, sin alargar falanges ni brazos. La mano izquierda toma la palanca; la derecha descansa o alcanza los mandos originales. Al atornillar, la mano queda a un lado y debajo de la fijación; la punta permanece sobre el tornillo.
- **Bolsa:** herramientas acostadas sobre el forro, separadas y bajo la solapa cerrada. Conserva selección por número, extracción directa, cancelación y volúmenes de selección por herramienta.
- **Subestación:** manguitos, zapatas, separadores, pernos y soporte en los seis extremos existentes del transformador; cajas de conexión, prensaestopas, cable continuo y abrazaderas para los dos motores de ventilación. Ajustes de acabado en acero, aislantes y pintura conservando los mapas existentes. Son detalles visuales didácticos: no se asignan datos nominales ni una nueva topología eléctrica.
- **Pasajero:** desde Persona en andén, acercarse a una puerta abierta y pulsar E permite entrar con el tren detenido; también se puede cruzar caminando hacia ella. WASD recorre el pasillo del vagón y la cámara acompaña el tren. E permite bajar al detenerse y abrir puertas en otra estación. Se respetan los pasajeros de pie, asientos, límites del carro y advertencia de salida. Cambiar de cámara cancela este estado. NM-22, NM-79 y MP-82, ambos sentidos, conservan las rutas L1/L8.

## Verificación

- `verificar_puertas200.mjs`: trece hojas, apertura y cierre mediante selección del tirador, guante y brazo nativos visibles, bloqueo con manos ocupadas y fuera de alcance, oclusión y colisión de hojas móviles.
- `verificar_embarque200.mjs`: embarque, seguimiento, paseo y descenso con geometrías nativas de los tres trenes, ambos sentidos; rechazo de tren en movimiento, puertas cerradas y advertencia de salida.
- `verificar_bolsa196.mjs`: seis herramientas; límites del forro y solapa, separación entre herramientas, selección y extracción por los volúmenes reales, cancelación sin equipar.
- Taller completo, conducción y mandos originales, mantenimiento físico de ventilación, herrajes, colisiones, área de trabajo, materiales, simbología y carga de los 39 archivos de estaciones.
- Navegador Chromium local: S1 mediante E desde la posición inicial, ayuda/plan/bolsa por teclado, selección numérica y transporte con WASD. Escenas de cabina, cierre de puerta, destornillador y bolsa revisadas con WebGL por software.

Las pruebas de geometría/DOM y el render por software no miden FPS ni certifican el rendimiento de la GPU del estudiante. La publicación de GitHub Pages y la actualización de cada Codespace dependen de sus servicios de ejecución; no se ha conectado aquí la sesión privada del usuario.
