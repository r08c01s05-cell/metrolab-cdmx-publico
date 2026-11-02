# Personajes aportados para el interior de los vagones

Se integran `personaje_metro_v2`, `personaje_metro_estudiante`,
`personaje_metro_madre_nino`, `personaje_metro_adolescente` y
`personaje_metro_rig`. Conservan sus geometrías, materiales y esqueletos.
Cada viajero tiene esqueleto y reloj de animación independientes. El reposo
se desfasa por personaje y se congela al pausar la simulación.

Los actores interiores se reparten por los nueve coches según la carga
del tren existente. Se combinan viajeros sentados y de pie. Las poses sentadas
usan los huesos de las piernas y la altura de los asientos de cada modelo.
Los movimientos de embarque y los personajes de andén conservan el sistema
anterior; esta revisión sustituye la representación de los viajeros a bordo.

Los seis archivos originales están en `assets-source/personajes`.
`Usuarios_anden_variantes.glb` es una colección estática sin esqueleto ni
animaciones: se conserva como recurso, junto con su copia existente para
andén, pero no se coloca como un grupo rígido dentro de los coches.

Los cinco GLB individuales se sirven comprimidos sin pérdida en
`dist/models/personajes`. El navegador los descomprime antes de entregarlos
al GLTFLoader. No se recortan las mallas ni se alteran sus materiales.
Los originales se pueden importar directamente en Blender.

Comprobación: `node --loader ./scripts/test-loader.mjs scripts/verificar_personajes31.mjs`.
También se ejecutan las comprobaciones de afluencia, embarque y puertas.
No se ha verificado el resultado visual ni el rendimiento en un navegador.
Los modelos recibidos usan materiales de color, sin imágenes de textura;
su incorporación no añade por sí sola texturas fotográficas.
