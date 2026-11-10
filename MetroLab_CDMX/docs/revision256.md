# Red y protecciones 256

Botón «⚡ Red y protecciones» en la vista de la subestación rectificadora. Lleva al simulador los temas de alimentación que explica la presentación de Tracción Eléctrica y que la planta 3D no tenía:

- Red de alta tensión: cadena Red Nacional de Transmisión → subestación encapsulada en SF6 de 230 kV (siete bahías) → 4 × 60 MVA, 230/15 kV → red de 15 kV (75 interruptores) → SR → barra guía. Datos públicos del proyecto Metro-Energía (líneas 1, 2 y 3).
- Factor de potencia a 15 kV con el mínimo de 0.95 del Código de Red para centros de carga de 1 MW o más.
- Red de 15 kV en anillo con dos alimentaciones: abrir tramos o sacar subestaciones muestra cuáles quedan sin energía. Topología supuesta, marcada en pantalla.
- SF6: propiedades con fuente, densímetro sobre cada celda de MT (3D) y fuga simulada con alarma y bloqueo de maniobra (umbrales supuestos 90 % y 85 %). Corrige la diapositiva que aplicaba el triángulo de Duval al SF6: el SF6 se revisa por pureza, humedad y subproductos del arco (HF, SOF2, SO2, S2F10).
- Protección 50/51 con la curva IEC inversa normal y elemento instantáneo, ajustable.
- Calentamiento del transformador seco: modelo de primer orden, ventiladores a 110 °C (supuesto), alarma 140 °C y disparo 150 °C (fabricante, clase F), ventilación forzada +40 %.
- Pérdidas en los 12 diodos: corriente media Id/6 por diodo, caída umbral y resistencia dinámica supuestas y ajustables.

No cambia física, trenes ni misiones. Los dibujos SVG usan estilos en línea porque el unifilar CAD inyecta un estilo global para line/circle/text.

Prueba red256: datos y fuentes, FP, curva IEC (4.28 s a 5 × Is con TMS 1), lógica térmica con y sin ventiladores, pérdidas de diodos, anillo, densímetros sobre las 3 celdas del GLB mirando al pasillo, fuga hasta bloqueo y limpieza al cerrar.
