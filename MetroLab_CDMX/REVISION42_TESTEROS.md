# Corrección de extremos de los coches de Línea 8

La captura mostraba cristales centrales azules repetidos a través de paredes de extremo incompletas. Se retiraron los cristales centrales antiguos de los extremos de NM79 y MP82 y se completaron esos testeros con una puerta cerrada, marco metálico, junta, vidrio pequeño de tono neutro, palanca y bisagras. En los coches con cabina se interviene sólo el extremo del salón opuesto a la cabina; se conserva el parabrisas y su partición.

Los extremos son una reconstrucción aproximada para corregir la inconsistencia visual. No representan un levantamiento de cada variante de coche, ni se agrega una pasarela abierta entre coches. La ventanilla está contenida en su hoja y tiene opacidad reducida, sin escritura de profundidad, para evitar el bloque azul superpuesto. Las puertas laterales, los asientos y los recorridos de embarque mantienen sus coordenadas.

`scripts/testeros42.py` reproduce los cuatro GLB desde la base conservada en `assets-source/trenes/base42/`. Los GLB editables actualizados se guardan en `assets-source/trenes/` y se distribuyen comprimidos sin pérdida.

Las pruebas `verificar_testeros42.mjs`, `verificar_interiores41.mjs`, `verificar_trenes34.mjs`, `verificar_puertas29.mjs` y `verificar_recorridos39.mjs` comprueban la ausencia del cristal central antiguo, el extremo cerrado mediante rayos, los parámetros del nuevo vidrio, materiales y UV, carga de trenes, puertas y embarque. Se ejecutan con `scripts/test-loader.mjs` y, para la carga texturizada de trenes, `--import ./scripts/node-textures40.mjs`. La verificación no incluye render visual en navegador.
