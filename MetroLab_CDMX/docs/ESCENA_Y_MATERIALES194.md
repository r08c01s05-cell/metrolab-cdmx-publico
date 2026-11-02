# Escena completa y materiales · revisión 194

## Franja inferior

En mantenimiento general, `maintenance143.css` reservaba 125–155 px debajo del escenario. Esa reserva se elimina en la regla original; los controles conservan sus posiciones sobre la escena. El canvas deja de heredar mínimos globales de 850 px de ancho / 330 px de alto y una relación de aspecto ajena al visor.

En subestación, el dock antiguo se monta en el plan lateral, fuera del viewport. Así su fondo y borde no pueden dibujar la franja de herramientas dentro de la escena. Se conserva la bolsa física y el atajo Tab con el plan cerrado: la disponibilidad de sus teclas depende de la práctica activa, no de que el dock esté a la vista. El canvas no hereda límites ni aspecto globales; al capturar/liberar el mouse se sincronizan explícitamente tamaño del renderer y cámara.

El aviso de actualización se coloca dentro del diálogo abierto (capa superior del navegador), y vuelve al documento cuando se cierra. Antes podía quedar detrás de la subestación e impedir actualizar una pestaña que conservaba la versión anterior. Se comprueba que el aviso sea pulsable y que su botón cargue la versión nueva, sin recargar automáticamente una intervención en curso.

## Materiales

- Lona y fibra filtrante tienen mapas compartidos propios de relieve y rugosidad.
- La pintura, el aluminio, los sellos de caucho y la serigrafía se distinguen mejor por material.
- Se corrige la doble multiplicación de rugosidad que hacía excesivamente brillantes algunos metales y pinturas.
- Los mapas y colores originales se conservan; las graduaciones y serigrafía quedan fuera del grano añadido.
- El acabado es idempotente: aplicarlo otra vez no acumula cambios ni clones.

Presupuesto compartido: 19 conjuntos, 52 mapas, 17.5 MiB antes de mipmaps (+1.5 MiB). No se añaden descargas externas ni se cargan activos históricos adicionales.

## Comprobación

Pruebas CPU de materiales sobre activos reales, controles de subestación, práctica completa de ventilación, cuatro actividades montadas y conducción. Compilación/render de materiales en Chromium con WebGL por software; no mide la GPU del estudiante.

Pruebas reproducibles opcionales con el servidor en marcha y Playwright instalado fuera del proyecto:

```sh
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_vista_taller194.cjs http://127.0.0.1:8001/
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_vista_subestacion194.cjs http://127.0.0.1:8001/
METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_actualizacion194.cjs http://127.0.0.1:8001/
```

Los visores se comprobaron a 1440×900, 1200×540, 390×844 y 390×540, con cursor libre y capturado. Se verifican canvas, escenario, framebuffer y aspecto de cámara; se omiten los dibujos para aislar las pruebas de disposición y controles. Por ejemplo, el canvas de taller a 1440×900 ahora termina en y900, frente a y775; el de subestación a 390×540 capturado ocupa los 390×540 px disponibles.
