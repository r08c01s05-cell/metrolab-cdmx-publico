# Revisión 262: desde dónde se manda la energía de tracción

Rama `mejora/mando262`. Fuente: presentaciones METRO 7EM1 y METRO II 7EM4 que aportó el usuario (edificio del P.C.C. 1, mandos de la subestación de 85/15 kV, S.R. de Línea 1, división eléctrica de Línea 12 y coordinación de maniobras).

## Qué se agregó

- `control262.js` (nuevo): puestos de mando (P.C.C., P.D.C., sala de interruptores, T.C.D., P.C.L., C.E.E. de la S.E.A.T. Estrella y mando local), diez equipos con su telemando y sus mandos locales, enclavamientos de 85 kV (`canOperate262`), telemando por hilo piloto (`telemando262`) y cinco causas de salida de una S.R. con sus pasos (`CAUSES262`, `Maneuver262`).
- Pestaña «Mando: P.C.C. y P.D.C.» en el panel «Red y protecciones» de la S.R.: puestos, tabla de equipos, tablero del P.D.C. para sacar y reponer una S.R. de Línea 1 paso por paso, y enclavamientos del Oerlikon, Soulé, rotativos y S.R.M. La S.R. en maniobra aparece fuera de servicio en la pestaña de zonas.
- Pestaña «S.R. real»: botón para ocultar en la maqueta el banco de baterías y la protección contra incendios, que el material no documenta dentro de la S.R.

## Supuestos y límites

- Las siglas T.C.D. y P.C.L. aparecen en el material sin desarrollar; no se interpretan.
- El material no describe el puesto desde donde se regulan los trenes más allá de decir que el P.C.C. coordina líneas 1 a 6, así que no se modela un tablero de tráfico.
- El tablero es un ejercicio de coordinación. No detiene trenes ni toca `engine.js`.

Prueba: `scripts/verificar_mando262.mjs`.
