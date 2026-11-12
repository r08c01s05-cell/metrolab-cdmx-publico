# Revisión 261: la S.R. como es en realidad y dónde están en la Línea 1

Rama `mejora/sr-real261`. Fuente: material del curso que aportó el usuario (presentaciones METRO 7EM1 y METRO II 7EM4, capítulo «Puesto de rectificación Línea 1», tablas 3.1 y 3.2, y tabla de subestaciones del anillo de 85 kV).

## Qué hay dentro de una S.R. según el material

1. Grupo seccionador (Intersec): mufa del cable de 15 kV, seccionador tripolar y transformador auxiliar de 15 kV / 220 V CA.
2. Grupo transformador principal: 2,750 kVA, 15 kV / 571 V CA, primario en delta, secundarios en delta y en estrella, aislamiento de silicón, seccionador hexapolar.
3. Grupo rectificador dodecafásico: 168 diodos de silicio en dos puentes de Graetz y bobina de equilibrio seca.
4. D.U.R., disyuntor ultrarrápido de 5,000 A y 1,800 V CD.
5. Seccionadores de 5,000 A: positivo a barra guía, negativo a rieles.
6. Gabinete de control: relevadores, hilo piloto y telemando desde el P.D.C.
7. Grupo ventilador de dos velocidades.
8. C.S. y C.T.P., solo en las S.R. que están en frontera de zona.

## Qué cambió en el simulador

- `sr-real261.js` (nuevo): datos de los grupos, revisión pieza por pieza de la maqueta, zonas, S.R. y C.S. de la Línea 1, y funciones `srPositions261`, `feedersAt261` y `zonesFed261`.
- Panel «Red y protecciones» de la S.R.: pestaña «S.R. real» (grupos y tabla de qué existe) y pestaña «Línea 1: zonas y S.R.» (esquema con 17 S.R., 6 zonas y 5 C.S.; se puede sacar una S.R. o abrir un C.S. y ver qué zona queda sin tensión). Sustituye a la pestaña del anillo de 15 kV, que no venía del material.
- Los densímetros de SF6 ya no se asocian a las celdas de la S.R. El SF6 queda como tema de la subestación de 230 kV.
- Textos de las piezas de la maqueta y del recorrido «Flujo de potencia» con los datos documentados (571 V CA, 168 diodos, D.U.R.).
- En vía, con «Flujo de corriente» activo en Línea 1: letreros en la posición de cada S.R. y texto con la zona y las S.R. más cercanas a cada lado del tren.
- Pestaña «Red de alta tensión»: bloque de Buen Tono (85/15 kV, 4 × 38.5 MVA) y tabla del anillo.

## Supuestos y límites

- Pablo Fierro y Constituyentes no son estaciones de la Línea 1; se dibujan a la mitad de su tramo y se marcan como aproximadas. La subestación de pruebas se dibuja junto a Pantitlán.
- La geometría 3D de los gabinetes no se remodeló: sigue siendo ilustrativa (12 diodos dibujados, tres celdas de media tensión, banco de baterías y sistema contra incendios que el material no documenta).
- El material no trae la ubicación de las S.R. de la Línea 8, así que ahí no se dibujan.
- No se tocó `engine.js` ni ningún módulo protegido; la alimentación por zona no cambia el movimiento de los trenes.

Prueba: `scripts/verificar_sr_real261.mjs`.
