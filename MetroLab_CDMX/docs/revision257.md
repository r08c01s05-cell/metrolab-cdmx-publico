# Dinámica y frenado 257

Pestaña «Dinámica y frenado» en el análisis eléctrico del tren seguido. Muestra temas de la presentación que el simulador no enseñaba:

- Curva de esfuerzo tractor contra velocidad (límite de corriente y de potencia del modelo 245) con la resistencia al avance del simulador más la pendiente elegida (m·g·i), y el punto de operación del tren.
- Límite de adherencia del neumático en vía seca (μ 0.7) y mojada (μ ajustable, 0.4 por omisión) con el peso de los 6 carros motrices; la vía mojada se toma del clima del simulador. Indica la aceleración posible y si habría patinaje.
- Freno combinado: reparto eléctrico/fricción para el frenado de servicio de la línea (1.8 m/s² L1, 1.2 m/s² L8, de engine.js), con desvanecimiento del eléctrico debajo de 7 km/h (supuesto).
- Destino de la energía de frenado: a la barra guía mientras la tensión no pase de 900 V (máxima permanente EN 50163 para 750 V) y si hay trenes acelerando a menos de 2 km; el resto a resistencias.
- Distancia de detención (v·tr + v²/2b + margen) y curva ATP con el frenado de emergencia del simulador (2 m/s²), curva de servicio y con lluvia, punto del tren respecto a la próxima parada; peralte de equilibrio h = 11.8·V²/R.

engine.js no se modifica: todo se calcula sobre el estado del tren seguido.

Prueba dinamica257: resistencia y pendiente, adherencia que solo limita con μ bajo, aceleración con carga/humedad/pendiente, reparto del freno, energía a la barra con tope de 900 V o a resistencias, ejemplo de 191 m de la presentación, curva ATP sobre la de servicio y pestaña con DOM mínimo.
