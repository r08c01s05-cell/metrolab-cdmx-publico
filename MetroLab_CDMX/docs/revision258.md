# Sistemas a bordo 258

Botón «🚆 Sistemas a bordo» en el seguimiento del tren. Panel con cuatro temas de la presentación que el simulador no explicaba:

- Cadena de potencia: escobillas → protección (fusibles, disyuntor) → filtro LC → convertidor (VVVF en NM-22, chopper en NM-79/MP-82) → 24 motores, y convertidor estático hacia CA trifásica, baja tensión CD y baterías. Se ilumina según tracción, frenado o alimentación del tren seguido, con tensión, corriente y auxiliares del análisis 245. Las tensiones auxiliares (220 V CA, 110/72 V CD, Ni-Cd) vienen de la presentación y se marcan sin fuente verificada.
- Mando y urgencia: capas decisión (pilotaje automático o conducción manual), TCMS y ejecución (TCU/BCU/puertas); freno de urgencia por cualquiera de cuatro condiciones (hombre muerto soltado en marcha, exceso sobre la curva ATP257, sin tensión, emergencia de línea) y distancia de detención a 2 m/s².
- Puertas: apertura solo con tren detenido, frente al andén y lado correcto; tracción inhibida mientras haya hojas abiertas; nota KFS.
- Bloque fijo contra bloque móvil: separación e intervalo según velocidad y largo de bloque (tren de 150 m, frenado de servicio de la línea, reacción y margen supuestos), más la distancia real del tren seguido al de adelante. engine.js separa con 500 m de vista y 180 m mínimos, parecido a bloque móvil.

No modifica engine.js ni el movimiento de los trenes.

Prueba a_bordo258: lógica AND de puertas, OR de urgencia, separación fija/móvil, tren de adelante, y panel con DOM mínimo (apertura, inhibición de tracción, hombre muerto, falta de tensión, distancia al tren de adelante).
