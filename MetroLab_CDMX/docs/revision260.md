# Rendimiento 260 y «Guardar instrumento»

## Rendimiento (segunda pasada, trabajo del procesador)
- frame-budget260.js · `freezeStatic260`: los grupos hijos de `infrastructure` y `stations` (unas 9,000 piezas que no se mueven) dejan de recalcular matrices cada cuadro. Se recalculan si reciben piezas nuevas, si el padre se mueve o en un repaso cada 180 cuadros.
- `peopleInterval260`: la multitud se actualiza cada 45 ms cerca, 85 ms a más de 70 m y 130 ms a más de 150 m (a pie y en cabina, siempre 45 ms).
- train-lod259.js: con el interior omitido, también se omite el costado del carro opuesto a la cámara.
- instanced-passengers121.js: niveles de pasajeros a 22/50/110 m (antes 34/78), con un cuarto nivel más simple y sin fases de caminata; las distancias siguen la calidad.
- passenger-flow.js · `roster260`: el reparto de asientos se guarda por tren y carga; antes se recalculaba en cada actualización.

Medición con dibujo simulado (ms de JavaScript por cuadro, antes → después): general 30.9 → ~23, seguimiento 44.8 → ~32, cabina 51.5 → ~24, andén 39.2 → ~35. Pasajeros lejanos en vista general: 341 → 172 llamadas y 0.81 M → 0.23 M triángulos.

## Guardar instrumento
Antes, «Guardar · Q» solo soltaba la herramienta de la mano. Un multímetro, megóhmetro o anemómetro ya apoyado se quedaba en la escena y el botón desaparecía. Ahora:
- con las manos libres o con el instrumento en uso, Q o el botón devuelven el instrumento al portaherramientas (`InstrumentPlacement180.store260`, `SubstationCarry188.storeInstrument238` ampliado; en el banco del tren se retira el multímetro);
- el botón sigue visible mientras haya un instrumento fuera y dice «Guardar instrumento · Q»;
- si hay puntas conectadas, avisa que se retiren primero.

Prueba rendimiento260.
