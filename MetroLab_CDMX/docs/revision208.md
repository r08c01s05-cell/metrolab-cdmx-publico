# Previa de Coyuya con andén central

Estado histórico: aprobada por el usuario el 31 de octubre de 2026. La ampliación autorizada se documenta en revision209.md.

Rama de revisión `revision/coyuya-anden-central`. El usuario revisará una sola estación antes de decidir si se extiende el cambio. No integrar a main todavía. Se usa el prefijo revision porque los prefijos feat/fix/mejora/correccion/chore del repositorio activan integración automática en main.

## Abrir

Desde MetroLab_CDMX: `python servidor.py --port 52448`. Abrir `http://127.0.0.1:52448/?previa=coyuya` o usar «Ver previa de Coyuya · andén central» en el menú. La primera carga prepara los recursos locales de la línea 8. La entrada prepara dos trenes detenidos, uno en cada sentido, y pausa la simulación para inspeccionar. Vista general, planta sin cubierta y caminar por la isla usan la misma StationScene del simulador.

## Cambios

- Solo L8-10 sustituye el antiguo GLB de andenes laterales por una isla procedural entre dos vías. Las otras estaciones conservan sus modelos.
- Reutiliza materiales detallados, acabado de andén, modelos de tren, controladores de personas, embarque y telemetría existentes. No cambia física ni limitador de render a 60 FPS.
- Vías, infraestructura de aproximación, trenes, cámaras de cabina y población comparten coordenadas de vía. Separación constante bajo el tren detenido y transición suave fuera de la estación.
- Puertas y portales de embarque se seleccionan hacia la isla en ambos sentidos. Se invalidan los portales al cambiar de disposición.
- Cámara y pasajeros quedan dentro de la isla; se puede cruzarla a pie. Escaleras, pilares y bancos tienen obstáculos de colisión. El controlador no permite caminar por las escaleras hacia el vestíbulo en esta previa.
- Estructura diagonal gris, laterales de malla sobre muro bajo, cubierta, iluminación, suelo a cuadros, franjas táctiles, bancos y pantallas de llegada del motor existente.
- El agrupador de mallas conserva UV2 para que las texturas y el relieve del piso mantengan escala al agrupar. Importaciones actualizadas a una única URL por módulo.

## Referencias y límites

Referencia visual principal existente: `dist/referencias/linea8_57/L8-10.jpg`, que muestra diagonal gris, cerramiento de malla y piso de piezas verdes y claras. Referencia constructiva pública para clasificación superficial: https://tesiunamdocumentos.dgb.unam.mx/pmig2016/0225310/0225310.pdf . Galería pública complementaria: https://commons.wikimedia.org/wiki/Category:Estación_Coyuya_(Metro_de_México) . No se añaden al catálogo documentos privados ni nuevos recursos externos.

Las dimensiones 156 m × 7.5 m, cota 1.2 m y centros de vía ±5.2 m son supuestos de modelado, no mediciones de Coyuya. Posición de accesos, pasarelas, mobiliario y forma completa de zonas ocultas pendientes de plano o levantamiento. Transición de vías entre 160 y 400 m de cada lado es ilustrativa. No es una reproducción certificada ni se atribuyen radios reales.

## Verificación

`node scripts/verificar_colaboracion.mjs` incluye las nuevas pruebas `verificar_coyuya208.mjs` y `verificar_embarque208.mjs` además de las regresiones de la base. Comprueban isla y vías, continuidad lateral, puertas hacia la isla, cabina y asientos sobre su vía, límites y colisiones de peatones, conservación de UV2 y agrupación de mallas. El embarque utiliza los modelos reales NM-79 y MP-82 en ambos sentidos y conserva los casos NM-22/línea 1.

Revisión visual en navegador local desde planta y altura de persona. Las pruebas CPU/DOM no equivalen a medición de FPS en la GPU del usuario.
