# Subestación: manipulación física · primera práctica

La práctica de **Ventilación del transformador** usa el anemómetro y el filtro como objetos transportables. El equipo permanece instalado dentro de la subestación. Las otras cinco prácticas conservan su flujo anterior en esta entrega.

1. Acércate a la bolsa. Tab o E sobre la bolsa la abre. Toma y prepara el anemómetro.
2. El instrumento queda en la mano. WASD transporta el objeto; un clic en la escena activa el mouse sin dejarlo caer.
3. Acerca el sensor al ventilador y mantén E o el clic durante 1.2 s. Alejarlo, soltar, cancelar o salir de la ventana interrumpe la lectura. El instrumento muestra la lectura del escenario.
4. Mira una superficie horizontal cercana y pulsa E para dejarlo apoyado; también puedes guardarlo mirando la bolsa. Un instrumento apoyado se recoge en el lugar donde se dejó: no aparece de nuevo en la bolsa.
5. Inspecciona el filtro y responde la pregunta de diagnóstico. Prepara el destornillador y mantén E sobre cada fijación para aflojarla.
6. E toma el filtro liberado. Camina hasta el tapete verde, agáchate y apóyalo con E. No avanza el paso al tomarlo, dejarlo en un lugar incorrecto ni pulsar un botón del menú.
7. Prepara el cepillo y mantén contacto sobre el filtro apoyado para las tres pasadas. El estado de suciedad cambia con esas acciones.
8. Recoge el filtro limpio, llévalo al contorno de su alojamiento y móntalo con E. Aprieta sus cuatro fijaciones.
9. Recoge el anemómetro donde lo dejaste, repite la medida, déjalo apoyado o guardado y mantén E en el ventilador para el ensayo final.

Se conserva la máquina de estados y sus valores educativos: la manipulación autoriza acciones; no inventa lecturas ni completa pasos por mover la cámara. El transporte usa las mallas reales dentro de la escena y una mano con guante. No es un motor de física de cuerpos rígidos: la colocación valida superficies, proximidad y zonas de trabajo, sin dinámica de caídas o peso.

El tapete, los objetos y las referencias de transporte se limpian al cambiar de misión. Solo se sostiene un objeto transportable a la vez. Abrir la bolsa con las manos ocupadas pide apoyar el objeto primero. Esc libera el cursor y cancela una acción sostenida, conservando lo que llevas en la mano.

## Verificación

`node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_transporte188.mjs` ejecuta toda la práctica con preparación nativa de la bolsa, transporte, medidas antes/después, interrupciones, guardas contra acciones remotas, filtro colocado/limpiado/reinstalado, fijaciones y ensayo. `verificar_controles181.mjs` conserva las cinco prácticas restantes y los controles compartidos; la ventilación física tiene esta prueba propia. Las pruebas de entrada en navegador no certifican rendimiento con GPU ni procedimientos de mantenimiento real.

## Selección directa y guía · revisión 189
Seleccionar una herramienta en la bolsa la equipa al terminar la animación, sin confirmar con otro botón ni pulsar el tapete. Una señal discreta marca el destino del paso actual con distancia; fuera de pantalla indica la dirección. Se actualiza al tomar o guardar instrumentos, transportar el filtro y avanzar de operación. Se oculta en la bolsa, durante el diagnóstico y al terminar la práctica. La señal orienta: el estudiante sigue desplazándose y realizando las acciones sobre las piezas.
