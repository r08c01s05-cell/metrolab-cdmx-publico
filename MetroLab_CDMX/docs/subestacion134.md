# Subestación y mantenimiento 134

La escena Blender conserva doce conjuntos y siete puertas de gabinete. Añade devanados más finos, anclajes, fijaciones, pantallas interiores, bornes, detalles de baterías, juntas del piso, zoclos, puerta central abierta hacia fuera y seis luminarias. Los avisos antiguos de exclamación se sustituyen por triángulos de advertencia eléctrica con rayo. La ubicación y las dimensiones siguen siendo ilustrativas.

La vista inicial se sitúa en la entrada, a 1.68 m de altura, con perspectiva frontal. Entrada, vista general, PAN, giro y enfoque frontal de equipos siguen disponibles. El modo de entrada muestra techo y cerramientos; el de inspección permite el corte. Se refuerza la luz interior con tres fuentes locales sin sombras adicionales y un ajuste de exposición visual. No se afirma un nivel de lux.

Las prácticas de ventilación, circuito auxiliar y conexiones se sustituyen por GLB nativos de Blender: filtro plegado con cuatro tornillos, portafusible y cartucho, terminales con zapatas, pernos y tuercas. Se añade instrumento físico con selector, teclas y lectura 3D, bandeja y mesa. Se conservan los tres bancos técnicos 129 y sus pruebas. La mano enguantada y las herramientas se muestran durante una acción válida, se retiran después y se ocultan al navegar o salir.

## Referencias mexicanas

Se documentan criterios de señalización, alumbrado y seguridad del centro de trabajo en dist/documentacion/subestacion134.json, con vínculos al DOF. Se diferencia expresamente el alcance de NOM-001-SEDE-2012: la tracción dedicada está excluida por 1.2.2(c). No se presenta una certificación, cálculo de distancias ni procedimiento de intervención real. No se modifica el retorno de tracción para unirlo a PE.

## Fuentes y comprobación

- scripts/build-substation134.py crea el interior y los tres bancos; scripts/detail-service134.py añade los instrumentos y exporta las escenas editables.
- assets-source/subestaciones134 conserva .blend, GLB y un render auxiliar de la entrada. El render Blender no es una captura del motor web.
- Las fuentes de distribución se comprimen sin pérdida y se mantienen los GLB canónicos.
- Pruebas: geometría, texturas incorporadas, identificadores, seis misiones, cuatro tornillos del filtro, cámaras, iluminación acotada, restauración al salir, puntas de medida y navegación.
- Falta inspección visual WebGL y medición de FPS en navegador.
