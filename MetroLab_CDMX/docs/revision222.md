# Fluidez general · revisión 222

Rama `mejora/fluidez-general`. Objetivo: más cuadros por segundo y menos tirones en el recorrido, la cabina y el andén. Se conservan modos, controles, rutas, misiones, modelos y audios. Los módulos protegidos por `scripts/protegidos213.json` no se modificaron.

## Qué se cambió

| Cambio | Archivo | Efecto |
|---|---|---|
| Un esqueleto por personaje | `cabin-characters.js` | Las prendas, el cuerpo y el cabello de un personaje usan los mismos huesos. Antes cada pieza tenía su propio esqueleto y el renderizador recalculaba y subía sus matrices por separado. Ahora se hace una vez por personaje. Dos personajes nunca comparten esqueleto ni animación. |
| Vidrio del tren en una pasada | `metro-render.js` | El cristal de puertas y el vidrio de testero (placas de 16 mm, transparentes y sin escritura de profundidad) se dibujan con `forceSinglePass`. Three.js dibujaba cada placa dos veces y cambiaba el programa dos veces por placa y cuadro. La diferencia visual es el orden de mezcla entre las dos caras de una placa con opacidad 0.13 o menor. |
| Histéresis de resolución | `render-budget101.js` | Cada cambio de resolución reasigna el búfer del lienzo y produce un tirón. Si la resolución baja poco después de haber subido, la siguiente subida espera el doble (de 6 s hasta 48 s). En un equipo al límite de 60 Hz pasan de 53 a 14 cambios en dos minutos simulados. Piso, techo y perfiles de calidad sin cambio. |
| Niveles de detalle de pasajeros lejanos | `instanced-passengers121.js`, `world-contact122.js`, `cabin-characters.js` | Cambios que ya estaban en la copia de trabajo, marcados como 221. Se integran en esta revisión. Las siluetas instanciadas usan dos niveles más simples a partir de 34 m y de 78 m, con histéresis. Solo se suben a la GPU las instancias que se movieron. Se agregó tolerancia a mallas creadas fuera del módulo, como en la prueba de pasajeros en curva. |

La caché de módulos modificados y de los que los importan pasa a `?v=222` con `scripts/sync-runtime222.py`, que es la misma lógica de `sync-runtime181.py` con rutas relativas a `MetroLab_CDMX`.

## Medición

Chrome sin interfaz con SwiftShader. Las llamadas de dibujo se omiten, así que se mide CPU y no GPU. Son promedios por cuadro de dos rondas alternadas contra `main`.

| Vista | Actualizaciones de esqueleto | Subidas de textura | Tiempo de `render` (CPU) |
|---|---|---|---|
| Andén L1, persona | 347 → 25 | 347 → 25 | 48 → 40 ms |
| Cabina L1, conductor | 302 → 13.5 | 302 → 13.5 | 39.5 → 21 ms |
| Interior del vagón L1 | 732 → 25 | 732 → 25 | 105 → 44 ms |

Los triángulos de pasajeros lejanos bajan de 5.2 M a 2.9 M en la vista de andén, a cambio de unas 146 llamadas de dibujo más. Los valores absolutos dependen de este entorno sin GPU; en una computadora real importa la proporción.

## Pruebas

- `scripts/verificar_fluidez222.mjs`, nueva y agregada a `verificar_colaboracion.mjs`. Cubre el esqueleto compartido y sus matrices idénticas, que dos personajes no comparten esqueleto, el vidrio en una pasada y la histéresis de resolución.
- Suite de colaboración completa pasada. En este contenedor, `embarque209` y las pruebas siguientes se ejecutaron por separado con `--max-semi-space-size=2` por la limitación de memoria ya documentada en 213.
- Revisión visual con SwiftShader del andén y del interior: personajes bien posados y ropa alineada. Queda pendiente la revisión con GPU real en la computadora del usuario.

## No incluido

- `platform-collision169.js` está protegido. Se probó un índice espacial que daba resultados idénticos en 108 000 casos y era un 40 % más rápido, pero se retiró para respetar el candado. Si se quiere, hay que actualizar el hash de forma explícita.
- El cabello de los personajes (`strand*_m`) mantiene las dos pasadas porque ahí el orden sí se nota.
- Las hojas de puerta siguen con una llamada de dibujo por material porque se animan por separado.
