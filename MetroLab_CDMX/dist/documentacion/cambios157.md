# Revisión 157 · interiores y bolsa física

Se compararon los coches de conducción e intermedios NM-22, NM-79 y MP-82 con las referencias conservadas en `assets-source/referencias/interior_l153`, `interior_L8`, `interiores43` y `revision147`. Las cotas son adaptaciones visuales; no se dispone de planos de fabricación.

- Línea 1: bancas longitudinales marfil/naranja, pasamanos curvos, intercomunicación y pantallas conservados. Microrelieve del asiento y piso gris renovados.
- Línea 8: asientos reconstruidos en Blender con carcasa verde continua, espesor, canto frontal, bastidor curvado, placas y fijaciones. Se mantienen los puntos de asiento de los pasajeros. No se añaden pantallas de Línea 1.
- Cristales: se retiraron dos imposiciones sucesivas de opacidad del render que anulaban el valor del modelo. Las juntas de goma dejan de clasificarse como vidrio.
- Piso: agregado fino, albedo, normal y rugosidad embebidos. Repetición aproximada de 0.5 m; paletas diferentes por línea. Puertas y enlaces conservados.

## Bolsa física

Pulsa **Mi bolsa**. Se abre la solapa de la bolsa en la misma escena 3D. Apunta a una herramienta para identificarla, haz clic para tomarla y después haz clic en el tapete para prepararla. Solo entonces se confirma el equipamiento desde esta interacción. **Esc** cancela y devuelve el control de cámara. La anterior lista de botones se ha retirado de la vista.

La bolsa se modeló en Blender: lona con pliegues, bolsillos abombados, ribetes, costuras, cremallera, asas y base reforzada. Destornillador, llave, cepillo, instrumentos, puntas y guante articulado utilizan los modelos GLB. La subestación muestra multímetro, megóhmetro o anemómetro según el ejercicio. Observar, ensayar e instalar un repuesto se realizan sobre el equipo, no se representan como falsas herramientas de la bolsa.

## Fuentes y comprobaciones

Las fuentes `.blend` y GLB de esta revisión están en `assets-source/revision157`; los seis GLB servidos coinciden con `assets-source/trenes`. Las versiones comprimidas están en `dist/models`.

Pruebas CPU/DOM con GLB reales: selección mediante rayos desde coordenadas del mouse, extracción y preparación, cancelación, seis coches, anclajes de pasajeros, cristales, juntas opacas, texturas y puertas. Regresión de las cuatro misiones del tren, las seis actividades de subestación y controles/cámaras. Vistas de revisión renderizadas con Blender.

No se comprobó la interacción visual en un navegador ni se midieron FPS en el equipo del usuario. La preparación de herramientas es didáctica; no sustituye un procedimiento autorizado de intervención eléctrica.
