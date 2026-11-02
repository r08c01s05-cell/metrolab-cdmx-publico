# Revisión 39: interiores de Línea 8 y recorridos de pasajeros

Los cuatro GLB NM79/MP82, de cabina e intermedio, incorporan asientos verdes moldeados transversales en pares, un pasillo central, paneles y techo marfil, suelo gris y pasamanos metálicos. Los destinos de pasajeros coinciden con la nueva orientación de los asientos. Las referencias originales se conservan en `assets-source/referencias/interior_L8/`.

Las fotografías no identifican inequívocamente el modelo ni incluyen cotas. La distribución y los colores se interpretan a partir de ellas; las dimensiones son aproximadas. Los archivos se reconstruyen con `scripts/interiores39.py` (Python y NumPy) y son GLB editables mediante importación en Blender. Esta revisión no genera archivos .blend ni utiliza Blender para ejecutar la reconstrucción.

El embarque conserva el mismo personaje y vestuario desde la fila del andén. Cada recorrido pasa por una puerta real completamente abierta, continúa por el pasillo y termina en un asiento o lugar de pie. El descenso precede al embarque; la transición hacia el asiento es gradual. Los pasajeros permanecen en el vagón al partir sin reconstruir sus identidades. Se aplica a las dos líneas y ambos sentidos.

La población visual representa grupos y tiene un límite de 320 personajes por escena y 144 dentro del tren. Las cifras del motor y la afluencia horaria siguen siendo la población agregada; no equivalen a un avatar por viajero. Los recorridos que no caben en el tiempo disponible no se fuerzan mediante teletransporte.

Validación: `verificar_trenes34.mjs`, `verificar_personajes31.mjs`, `verificar_embarque27.mjs` y `verificar_recorridos39.mjs` pasan con el cargador `scripts/test-loader.mjs`. La prueba nueva comprueba seis combinaciones de modelo y sentido, continuidad cada 50 ms, cruces por puertas abiertas, identidades únicas, destinos sin duplicar y continuidad al partir. Se validaron 24 asientos y respaldos por GLB, coordenadas finitas y sintaxis JavaScript. No se realizó una inspección visual en navegador; quedan pendientes la valoración visual y el rendimiento en el dispositivo del usuario.
