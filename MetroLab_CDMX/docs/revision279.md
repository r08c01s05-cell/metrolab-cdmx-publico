# Revisión 279: reactor de equilibrio, frenado reostático, consola de regulación y Agenda 2030

Rama `mejora/control-energia279`. `engine.js` no cambia. La consola de regulación trabaja sobre el motor privado del centro de control (`pcc-centro277.js`), no sobre el simulador principal.

## 1. Reactor de equilibrio (`balance-reactor279.js`)

- Fuente: material del curso, METRO 7EM1, diapositiva 64: bobina seca clase B, enfriamiento natural, conectada a la salida del rectificador dodecafásico para filtrar y controlar las corrientes.
- Planta 3D: reactor seco de núcleo de hierro con dos devanados (puente Y y puente Δ), herrajes, terminales X1, X2 y toma central, placa de datos, aisladores de apoyo y resguardo de malla. Se coloca detrás del gabinete del rectificador, con barras de cobre al rectificador y al D.U.R. Sustituye a la bobina pequeña que la maqueta dibujaba dentro del gabinete (se quita en `rectifier-assets127.js`). Medidas ilustrativas.
- Panel «Red y protecciones», pestaña «Reactor de equilibrio»: ondas de los dos puentes (desfasados 30°), de salida y de la tensión en el reactor; corriente por puente; opción de quitar el reactor. Cálculo con diodos ideales: Udi0 = 1.35 × 571 V ≈ 771 V, rizado de 108 V por puente y 27 V a la salida (720 Hz).

## 2. Frenado reostático (`braking279.js`)

- Presentación del usuario, diapositiva 35: NM-79 y MP-82 (chopper) con freno electrodinámico exclusivamente reostático; NM-22 (VVVF) regenerativo con mezcla. Diapositiva 54: regenera mientras la red no pasa de 900 V. ALAMYS: la capacidad regenerativa de los chopper «nunca se alcanzó».
- `pcc263.js`: la Línea 8 ya no regenera; símbolo de resistencia con calor bajo cada tren que frena reostáticamente; energía acumulada recuperada y disipada.
- `train-dynamics257.js`: el reparto del freno respeta el modelo del tren seguido.
- `track-current250.js`: al frenar, partículas verdes del tren a la barra guía (regenerativo) o rojas del motor al banco de resistencias de cada carro motriz (reostático), que se enciende según la potencia.

## 3. Consola de regulación (`regulacion279.js`, `consola279.js`)

- Regímenes PA, CMC y CML (diapositiva 77; Chilango 2023). Cambio de régimen solo con el tren detenido.
- ATP en CMC y CML: ejercicio de sobrevelocidad y de hombre muerto; freno de urgencia y rearme desde el P.C.C.
- Señalización: CBTC de bloque móvil en Línea 1 (Siemens Trainguard MT, AMF 2023) y bloque fijo en Línea 8 (dos cantones por interestación, supuesto). El tren se detiene ante la señal del primer cantón ocupado.
- Restricciones temporales de velocidad por tramo, con curva de frenado previa.
- Regulación del intervalo: retiene en estación hasta 30 s si el tren saldría demasiado pronto detrás del anterior. Objetivo inicial calculado según el número de trenes.
- Registrador de eventos con hora del escenario, nivel y tren.
- Número de trenes por línea (4 a 10) y velocidad ×1, ×5, ×10.
- Implementación: sobrescribe `speedLimit` solo en la instancia del motor del centro y usa `t.wait`; `detach()` lo restituye.

## 4. Agenda 2030 (`agenda2030-279.js`)

- La Agenda 2030 no aparece en el material del curso ni en la presentación de 80 diapositivas (revisada con OCR). El único «2030» es el plan del STC con horizonte 2030 que anunció la ampliación de la Línea 8 (presentación «Historia del Metro»).
- Pestaña con ODS 7, 9, 11 y 13 e indicadores en vivo: energía regenerada y disipada, emisiones evitadas con el factor del SEN 2024 (0.444 kg CO2e/kWh, SEMARNAT), abordajes y eventos críticos.

Supuestos en `ASSUMED279`. Prueba: `scripts/verificar_control279.mjs`.
