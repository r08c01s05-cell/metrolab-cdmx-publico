# Revisión 202 · andén fluido, agarre e interior de ventilación

## Persona en andén

Los flujos de embarque reservaban un esqueleto animado por pasajero sin respetar el presupuesto de detalle. Ahora comparten un máximo de 24 esqueletos próximos a la cámara; los demás conservan sus identidades y trayectorias con poses instanciadas. Las mallas lejanas se simplifican un poco más conservando texturas, materiales y vestuario. No se modifica la afluencia, el conteo de pasajeros ni sus rutas.

La búsqueda de puertas deja de recorrer todos los descendientes del tren en cada cuadro. Se filtran trenes lejanos, se comparan sus portales en coordenadas locales y se reutiliza el resultado para la indicación; se mantiene E para subir/bajar y la colisión con personas.

El programador de dibujo mantiene su fase entre cuadros, con tolerancia al redondeo de los tiempos del navegador. Esto evita saltos artificiales en pantallas de 60, 120 y 144 Hz. Los perfiles de calidad conservan sus límites y los intervalos largos de segundo plano reinician el calendario.

En dos capturas locales comparables de Persona en andén L1 (aproximadamente 630 figuras), el renderer pasó de 5.738 llamadas/22,05 millones de triángulos a 2.285 llamadas/7,01 millones. En 60 actualizaciones manuales, la búsqueda de puertas pasó de dos búsquedas por cuadro y 28,9 ms acumulados a una búsqueda por cuadro y 0,8 ms. Son conteos y tiempos locales con las llamadas GL omitidas, no FPS medidos en la GPU del usuario. La inicialización de poses sigue teniendo un coste; no se afirma que esos tiempos equivalgan al coste de un cuadro completo.

`perfil_anden202.cjs [baseURL]` permite repetir el perfil con el simulador activo. Requiere Playwright y Chromium y no cambia archivos del proyecto.

## Destornillador

El mango atraviesa la palma dentro de los cuatro dedos cerrados. La varilla sale junto al índice y el pulgar, en lugar de junto al meñique. El giro ocurre sobre el eje de la varilla y la punta nativa permanece apoyada sobre la fijación. Se ajusta la oposición del pulgar; no se estiran falanges ni segmentos del brazo. Las otras herramientas conservan sus agarres.

## Detrás del filtro

El filtro removible revela un conducto con guías, una salida circular, impulsor, motor y soportes. Un compartimento lateral separa del flujo principal la placa de control auxiliar con relés, conectores, pistas, borneras y mazo hacia el motor. El conjunto queda instalado al transportar el filtro y el impulsor responde al ensayo funcional existente. El detalle está agrupado por materiales para limitar llamadas de dibujo.

Es una representación didáctica de un módulo auxiliar; no reproduce un circuito de fabricante ni asigna datos nominales. Se conserva la secuencia de medición, extracción, limpieza, montaje y comprobación.

## Verificación

- Nuevas pruebas: `verificar_fluidez202`, `verificar_multitud202` (catálogo nativo actual y 632 actores), `verificar_destornillador202`, `verificar_interior202`.
- Mantienen resultados correctos: embarque/descenso en los tres trenes y ambos sentidos, andén y controles, conducción, cuatro misiones de taller, trece puertas con manos visibles, ventilación física completa, herrajes, colisiones y área de trabajo.
- Chromium local: S1 desde la posición inicial, ayuda/plan/bolsa por teclado y transporte con WASD; revisión de renders de agarre e interior con WebGL por software.
- 176 módulos de ejecución con una sola URL por módulo. Las nuevas regresiones se incorporan a la publicación de Pages.
