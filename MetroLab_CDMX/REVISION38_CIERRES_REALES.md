# Avisos de cierre extraídos del video aportado

Fuente conservada: `assets-source/audio/cierres_trenes_referencia.mp4`, copia del
archivo WhatsApp Video 2026-10-11 at 00.59.43.mp4.

| Tren del simulador | Sección del video | Fragmento | Uso |
|---|---|---|---|
| NM-79, L8 | NM-79 | 69.45–71.60 s | Grabación de ese modelo |
| MP-82, L8 | MP-82 | 97.50–99.65 s | Grabación de ese modelo |
| NM-22, L1 | NM-16 | 201.35–203.30 s | Referencia provisional: el video no contiene NM-22 |

Son extractos breves del aviso, no el audio completo de cada escena. Se aplican
un filtro de graves por debajo de 65 Hz, limitador de picos y fundidos breves para
evitar chasquidos. Se conserva el ambiente de la grabación. No se sintetizan los
tonos de cierre anteriores. Los MP3 y el manifiesto están en `dist/audio/cierre38`.

Los tres archivos se precargan al activar el audio. El aviso se inicia una vez
por parada, con la duración del clip más 1.5 segundos de anticipación a la partida.
Mantiene su velocidad y tono originales; al acelerar la simulación puede
interrumpirse cuando el tren parte. Pausar o silenciar detiene la reproducción.

Pruebas: `verificar_cierre38.mjs`, `verificar_audio30.mjs`, `verificar_audio37.mjs`.
Se verifican duración, señal no silenciosa, correspondencia, precarga, ausencia
de tonos sintetizados de cierre, no repetición, corte al partir y anuncios de
aproximación. No se ha realizado escucha en navegador.
