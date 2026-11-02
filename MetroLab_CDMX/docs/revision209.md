# Andenes de superficie de las líneas 1 y 8

El usuario aprobó la previa de Coyuya y solicitó extenderla a las estaciones correspondientes el 31 de octubre de 2026. Rama `revision/andenes-superficie-l1-l8`. Esta revisión sustituye la limitación de la previa 208 a una sola estación. Se publica para revisión sin integración automática en main.

## Distribuciones

| Estación | Representación |
| --- | --- |
| Coyuya L8-10 | Una isla entre dos vías, estructura gris, piso verde y claro |
| Iztacalco L8-11 | Una isla entre dos vías, estructura morada y escaleras centrales |
| Apatlaco L8-12 | Una isla entre dos vías, estructura azul y pavimento gris cálido |
| Aculco L8-13 | Una isla entre dos vías, estructura gris verdosa y cerramiento de malla |
| Constitución de 1917 L8-19 | Dos islas y tres vías; estructura clara y pavimento gris |
| Observatorio L1-20 | Se conservan los dos andenes laterales del modelo existente y sus texturas; franjas verdes de Línea 8 heredadas se corrigen a rosa de Línea 1 |

No se convierte Observatorio en una isla. No se modifica la geometría de las estaciones subterráneas. La tercera vía de Constitución es una representación visual sin servicio automático del motor de dos sentidos existente; no se han añadido itinerarios, aparatos de vía ni un enclavamiento de terminal verificado.

## Funcionamiento

Las coordenadas de vía se comparten entre infraestructura, trenes, cámaras, asientos y pasajeros. La separación de vías se mantiene a través del tramo continuo de las cuatro estaciones de paso con isla. Fuera de ese tramo y en la aproximación a Constitución se enlaza suavemente con la separación del resto del escenario.

Las puertas abren hacia los andenes de las vías exteriores. Los viajeros y la cámara pueden cruzar una isla, pero no atravesar la vía central para cambiar entre las dos islas de Constitución. El selector de revisión permite cambiar de andén sin caminar sobre las vías. El embarque y desembarque mantienen las comprobaciones de tren detenido y puertas abiertas.

Los carteles repetidos comparten material y textura. Las estaciones de paso quedan agrupadas en 18 lotes aproximadamente y la terminal en menos de 100, conservando detalle de geometría y materiales. No se cambia el límite de renderizado de 60 FPS ni la física. No se afirma una medición de rendimiento de GPU.

## Inspección local

Ejecutar `python servidor.py --port 52448` desde MetroLab_CDMX. Abrir `http://127.0.0.1:52448/?previa=L8-19` o el acceso del menú «Revisar andenes de superficie · L1 y L8». El selector contiene las seis estaciones. Permite vista general, planta sin cubierta, caminar, cambiar de andén cuando corresponda y probar o pausar circulación. También admite `?previa=observatorio`, `?previa=coyuya` y los identificadores L8-10, L8-11, L8-12, L8-13, L8-19 y L1-20.

## Referencias y supuestos

Se revisaron las imágenes existentes `dist/referencias/linea8_57/L8-10.jpg` a L8-13.jpg, L8-19.jpg y `dist/referencias/L1/L1-20_1638s_perspectiva2.jpg`. Se conserva el GLB aportado de Observatorio para no sustituirlo por la arquitectura de otra estación. La clasificación histórica superficial se puede contrastar con la documentación pública de construcción: https://tesiunamdocumentos.dgb.unam.mx/pmig2016/0225310/0225310.pdf . El expediente histórico oficial de Observatorio identifica dos vías centrales y dos andenes laterales: https://www.metro.cdmx.gob.mx/storage/app/media/Fideicomiso/informe11compromisos.pdf . Las referencias históricas no certifican la configuración completa posterior a la remodelación de Observatorio ni sus conexiones con otros transportes.

Las islas de 156 m × 7.5 m, la cota 1.2 m y los centros de vía ±5.2 m o ±10.4 m son dimensiones de simulación, no medidas levantadas. Ubicación de mobiliario, escaleras, pasarelas y zonas ocultas aproximada. No se modelan todas las conexiones y vestíbulos de los complejos. No se publican documentos restringidos ni se añaden dependencias de internet.

## Verificaciones

`node scripts/verificar_colaboracion.mjs` incorpora `verificar_superficie209.mjs` y `verificar_embarque209.mjs`. Comprueba cinco geometrías de islas, compatibilidad entre bordes y envolvente de vía, continuidad de separación, límites de peatones y conservación de la geometría y texturas de Observatorio. El embarque usa NM-79 y MP-82 en ambas direcciones de cada estación de Línea 8 y NM-22 en Observatorio. Conserva las regresiones anteriores de conducción, interiores, taller, subestación, imports, privacidad y servidor.
