# Unión inferior de las ventanillas

La captura mostraba un hueco real entre el vidrio de las puertas y el panel inferior. El muestreo mediante rayos detectó franjas abiertas en NM79 y NM22. Se incorporó un travesaño metálico opaco que solapa la unión y una junta estrecha bajo el vidrio en 16 hojas por coche de estos modelos. Las piezas son hijas de la hoja y se ocultan con ella durante la apertura. MP82 se comprobó sin necesitar este cambio geométrico.

El cambio cubre los cuatro GLB NM22/NM79 de cabina e intermedio. No cambia las posiciones de puertas ni los asientos. El acabado es una aproximación geométrica, no una dimensión certificada. `scripts/sellar_puertas45.py` reproduce la corrección desde `assets-source/trenes/base45/`.

`verificar_sellado45.mjs` muestrea la unión en las 96 hojas de los seis GLB, con cinco posiciones horizontales y doce alturas por hoja. También se verifican la ocultación de hojas y la carga de los trenes. No se realizó render visual en navegador.
