# Rendimiento y acabado 259

## Rendimiento
- train-lod259.js: cada carro elige su nivel de detalle por distancia a la cámara. Lejos se omiten interior (85 m), bogies y equipo bajo bastidor (110 m, sustituidos por volúmenes oscuros simples) y gomas/sellos de puerta (45 m). Con histéresis de 6 m; los umbrales se multiplican por 0.7 en «rendimiento» y 1.6 en «cinemática». En vista con corte (techo o muros retirados) el interior se conserva. Usa capas de Three.js, no `.visible`, para no interferir con cortes, puertas ni cabina. No modifica módulos protegidos.
- passenger-budget259.js: el tope de pasajeros detallados (GLB con esqueleto) pasa de 24 fijos a 8/14/24 según calidad, y 10 como máximo en cabina.

Medición en Pantitlán con un tren (render.info, calidad equilibrada):
| Vista | Llamadas antes → después | Triángulos antes → después |
|---|---|---|
| General | 2,090 → 1,250 | 3.44 M → 2.05 M |
| Cabina | 1,386 → 1,001 | 4.79 M → 3.28 M |
| Andén a pie | 2,300 → 2,027 | 6.66 M → 5.82 M |

## Acabado
- weathering259.js: tercera capa de material en coordenadas del mundo, calculada en el sombreador (sin texturas nuevas): escurrimientos, hollín y sales en el concreto del túnel; polvo y aceite en durmientes; hule en pistas de rodamiento; óxido en el alma de los rieles; película ligera en barras guía; desgaste por paso en pisos de andén; envejecido leve en muros. Es ilustrativo y se apaga en «rendimiento». No se aplica a trenes, personas, letreros, vidrio ni metales de estación.

Prueba visual259: niveles con histéresis, clasificación de piezas, volúmenes lejanos, corte, `.visible` intacto, presupuesto de pasajeros, asignación de capas de desgaste y parche sobre el sombreador estándar real de three.js.
