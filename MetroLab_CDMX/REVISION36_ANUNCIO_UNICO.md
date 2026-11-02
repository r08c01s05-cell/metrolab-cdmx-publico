# Un solo anuncio antes de la llegada

Cada aproximación tiene una marca que no se elimina al cambiar cámara, pausar,
reanudar o interrumpir una descarga. El anuncio no vuelve a iniciarse durante
esa misma visita. Al iniciar otra visita del tren se permite un anuncio nuevo.
El reinicio del escenario restablece las marcas.

La distancia de activación incorpora la duración del clip, la velocidad del
tren y la escala de tiempo para anunciar con más anticipación que el límite
anterior de 180 metros. Al llegar se conserva el corte y la cancelación de
descargas pendientes. No hay anuncio con un tren inicialmente detenido.
El aviso de cierre de puertas permanece separado.

`node scripts/verificar_audio30.mjs` verifica los 36 clips de ambas líneas:
una reproducción durante la aproximación, ninguna repetición por cuadros,
cámara o pausa, ninguna reproducción al llegar y un nuevo anuncio en otra visita.
También verifica la cancelación de descargas que terminan después de llegar.
Prueba mediante AudioContext simulado; sin comprobación auditiva en navegador.
