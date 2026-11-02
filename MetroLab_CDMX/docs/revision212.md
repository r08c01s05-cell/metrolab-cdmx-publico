# Revisión 212 · Dos apoyos y bogies articulados en las curvas

Cada carro se colocaba usando solamente la posición y tangente de su centro. Ahora su referencia visual se obtiene de dos apoyos sobre su vía, correspondientes a los centros de los bogies de los GLB existentes.

## Cinemática visual

- `car-support212.js` obtiene dos puntos de vía y ajusta su separación longitudinal hasta conservar la distancia rígida entre pivotes. La carrocería se sitúa en su punto medio y se orienta con la recta que une ambos apoyos.
- Se usa el desplazamiento lateral de la vía en cada apoyo, incluido el cambio de separación de las islas. La tangente de cada bogie procede de su tramo de vía, no de la tangente del centro del carro.
- Semidistancia de los apoyos en los modelos actuales: NM-22/NM-79 `5.7 × 0.965 m`; MP-82 `5.35 × 0.965 m`. Son coordenadas de los recursos existentes y su escala de ejecución; no son cotas certificadas del material rodante real.
- Las poses se comparten y almacenan en caché por ruta, tren, posición y carro. Pasajeros, apoyos de pies y cámaras usan la misma referencia para conservar la corrección 211.
- `bogie-batching212.js` conserva y separa los triángulos existentes del cuerpo y de ambos bogies durante el agrupado de mallas. Conserva materiales, normales y UV. Los bogies articulan sobre sus pivotes; no se estira la carrocería ni se cambian los GLB fuente.
- No se modifica la física de tracción/frenado, el avance lógico, los conteos de pasajeros ni el límite de 60 FPS. El ajuste es cinemático y visual, sin introducir un nuevo motor físico.

## Verificación

`verificar_apoyos212.mjs`: seis GLB reales, comprobación de triángulos/dimensiones/UV antes y después del agrupado, dos bogies con ruedas y componentes mecánicos. Tres modelos, ambos sentidos, 38 posiciones de transición y nueve carros: ambos pivotes quedan sobre su vía, la distancia entre ellos permanece fija y cada bogie sigue su tangente. Se restauran las transformaciones lógicas tras dibujar.

`verificar_pasajeros_curva211.mjs` sigue pasando con esta nueva referencia: ocupantes detallados y lejanos, apoyos, cámaras interiores/alumno, pausa e interpolación. Incluidos ambos controles en la suite compartida. Inspección visual local de la salida de Constitución de 1917. No se afirma una medición de FPS de GPU.

La modificación permanece en `revision/andenes-superficie-l1-l8`, PR 3, para revisión. No se integra en main.
