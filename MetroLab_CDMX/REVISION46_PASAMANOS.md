# Pasamanos y postura de pasajeros de pie

Los destinos de pie se vinculan a postes verticales del coche. En Línea 8 se usan los existentes junto a las filas de asientos; en NM22 se añaden cinco postes accesibles con bases y uniones al techo. Se conservan los destinos sentados y las posiciones de puertas.

Al terminar de abordar, un ajuste de dos articulaciones lleva la mano derecha hacia el poste durante una transición breve. Al caminar se libera el contacto. Por indicación del usuario en la revisión 47, los niños quedan excluidos de la postura de agarre y mantienen los brazos libres. El otro brazo mantiene la postura del personaje, incluyendo las figuras con bebé. La referencia de la mano es un punto aproximado del antebrazo porque los esqueletos aportados no tienen huesos de mano/dedos: no se simula aún el cierre individual de dedos ni la física de agarre o equilibrio del cuerpo.

`pasamanos46.py` reproduce los postes de NM22 desde `assets-source/trenes/base46/`. `verificar_agarre46.mjs` comprueba que cada destino tiene un tubo en la geometría, el alcance del punto de mano de los cinco modelos para adultos, la ausencia de agarre en niños, ambos sentidos y liberación durante la marcha. Las pruebas de personajes y recorridos comprueban la integración. La revisión visual en navegador sigue pendiente.
