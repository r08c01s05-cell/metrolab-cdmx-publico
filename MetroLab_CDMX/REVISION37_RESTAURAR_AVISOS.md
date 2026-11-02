# Aviso audible en cada aproximación

Se corrige la cancelación excesiva: el anuncio precarga su archivo al comenzar
el tramo, sigue al tren seleccionado y ya no depende de la cercanía de la cámara.
La marca de «reproducido» se coloca cuando el sonido comienza, no al solicitarlo.
Una descarga fallida permite reintentar con una espera de un segundo.

La identidad de la visita se conserva cuando el motor incrementa el contador de
paradas al llegar. El anuncio iniciado durante la aproximación puede terminar
al entrar a la estación sin volver a iniciarse. Se mantienen la pausa, el silencio
manual, los cambios de línea y el aviso de cierre de puertas.

El anuncio se inicia antes de detenerse; una descarga que termina después de
la llegada no puede iniciarlo. Otra visita de un tren a una estación permite otro
anuncio. Las estaciones sin grabación aportada siguen sin voz de referencia.

Pruebas: `verificar_audio30.mjs` y `verificar_audio37.mjs`. La segunda ejecuta el
motor real durante 900 segundos en cada línea a escalas 1× y 8×, con una cámara
alejada, y verifica avisos en sucesivas aproximaciones, sin duplicados ni inicio
con el tren detenido. AudioContext simulado; falta escucha en navegador.
