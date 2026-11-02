# Herramientas e interacción · revisión 139

Cuatro herramientas nuevas modeladas en Blender en metros: destornillador Phillips PH2, llave combinada de 13 mm, punta de prueba con guarda y cable flexible, y brocha con virola y filamentos. Fuentes: assets-source/herramientas139/; scripts/build-tools139.py. El pack se carga tanto en la mano como en las puntas de los ejercicios eléctricos; las mallas se agrupan por material.

La boca de la llave se ajusta a la dimensión modelada de las fijaciones de rueda. El contacto utiliza la punta definida en cada modelo y la normal de la pieza. Se elimina el balanceo artificial de la muñeca; la rotación de trabajo se interpola y se mantiene continua entre pulsaciones. En subestación, la mano acompaña a la punta que ya está en el banco en lugar de mostrar otra. Las puntas se apoyan en el frente conductor y vuelven a su soporte al retirarlas.

El giro de tornillos de subestación mantiene la captura dentro de un radio de 150 píxeles alrededor de la fijación. Se puede salir del pequeño círculo de selección sin cancelar el giro. Mover deliberadamente el ratón impide sumar simultáneamente trabajo por mantener pulsado. Permanecen los clics cortos, mantener, giro, teclado y cancelación.

Se ajustan las dimensiones del multímetro general y del instrumento auxiliar de servicio. Los tres instrumentos técnicos se reagruparon en Blender a aproximadamente 29 cm de altura, conservando los mandos, pantallas y objetivos. Se añadieron tornillos con cruz, bandas de agarre, entradas banana hundidas, leyendas de selección y radios más suaves en carcasa y mando. Fuentes: scripts/detail-instruments139.py.

Se recomprimieron los dos PPTX documentales sin cambiar el contenido descomprimido de sus entradas. Los dos PDF de energía se optimizaron sin rasterizar, conservando número de páginas, índice y texto de cada página. No se eliminaron documentos.

Verificación: Blender/Cycles para las herramientas; pruebas de geometría, contacto con piezas inclinadas, captura circular, conexión y retirada de puntas, y regresión de las actividades. No se dispone de validación visual WebGL ni medida de FPS en navegador en esta sesión. Es una mejora concreta de modelado e interacción; no una reconstrucción fotorrealista de todos los modelos del simulador.
