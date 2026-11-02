# Anuncios solamente al aproximarse

El anuncio de estación requiere un tren en movimiento, sin tiempo de estancia,
a menos de 240 metros de su destino y dentro de la zona audible de la cámara.
No se activa en una estación inicial con el tren detenido. Al llegar se cancela
la reproducción en curso y cualquier descarga pendiente asociada a esa aproximación.
Se reproduce una vez por aproximación.

El aviso de cierre de puertas sigue separado del anuncio de estación.

Validación: `node scripts/verificar_audio30.mjs` comprueba parada inicial,
aproximación, repetición, corte al llegar, pausa, silencio y descarga tardía.
