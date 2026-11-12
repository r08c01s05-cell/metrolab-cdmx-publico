# Revisión 263: P.C.C. dentro del simulador

Rama `mejora/pcc263`. Botón «🖥 P.C.C.» junto a las herramientas de vista.

## Qué muestra

- Esquema de toda la línea activa con sus estaciones y la posición de cada tren, con su sentido.
- Zonas de tracción A a F de la Línea 1 y sus 17 S.R. (datos de la revisión 261). Tocar una S.R. la saca de servicio; el estado se comparte con el panel de la S.R. (`ZONE_STATE261`).
- Flujos de energía: de la S.R. al tren cuando el motor tracciona, del tren a la barra guía cuando el motor trabaja como generador, y a resistencias cuando no hay otro tren que reciba esa energía.
- Balance de la línea: potencia que piden los trenes, la que entregan las S.R., la que regresa y la que se disipa.
- Tabla de trenes con zona, velocidad, modo, potencia y estado.

## Órdenes

- Retener un tren en su estación y liberarlo; retener o liberar todos.
- Cortar y restablecer la energía de la línea (usa el botón que ya existía).
- Freno de emergencia (usa el botón que ya existía).

## Cómo actúa sin tocar el motor

`engine.js` sigue intacto. La retención mantiene el tiempo de parada (`t.wait`) de un tren que ya está detenido en estación; nunca actúa sobre un tren en marcha ni sobre el que conduce el usuario. El modo eléctrico se deduce de la velocidad y la aceleración que el motor ya calcula, con `electricState245`.

## Supuestos y límites

- La energía regenerada se aprovecha solo si otro tren de la misma línea está consumiendo en ese instante; el resto va a resistencias. No se modela la caída de tensión por distancia.
- El corte de tensión por zona no existe en el motor: una zona sin tensión retiene a los trenes detenidos en ella, pero los que van entre estaciones llegan a la siguiente.
- No hay orden de límite de velocidad: exigiría cambiar `engine.js`, que está protegido.
- La Línea 8 se muestra sin zonas ni S.R. porque el material no las ubica.

Prueba: `scripts/verificar_pcc263.mjs`.
