# Sustitución completa de los pasajeros anteriores

Todos los actores visibles usan ahora los GLB individuales aportados:
andenes, embarque, descenso e interior de los coches. Se retira del render
el sistema `PassengerModels`, incluyendo su uso provisional durante la carga.
Hasta que se cargan los GLB se indica «Cargando personajes GLB» y no se muestran
personajes antiguos. Si falla la carga se muestra el error en el contador.

Los viajeros que caminan usan `Walk`; los que esperan usan `Idle`.
Las posturas sentadas se mantienen adaptadas a cada tren. Las familias usan
el modelo madre/niño aportado; los niños acompañantes usan una copia a escala
del adolescente, que conserva el vínculo de recorrido con su acompañante.
No es una nueva malla de anatomía infantil: es una adaptación del recurso recibido.
La identidad conserva el modelo al cambiar el orden de los actores.
La pausa conserva la animación y las posturas.

Los originales y el código anterior se conservan como archivos históricos,
sin que el render importe o instancie los personajes anteriores.
La colección estática se conserva como recurso; sus figuras sin esqueleto
no sustituyen a los GLB articulados durante la marcha.

Pruebas: `verificar_personajes31.mjs`, `verificar_embarque27.mjs`,
`verificar_afluencia26.mjs`. Sin comprobación visual o de rendimiento en navegador.
