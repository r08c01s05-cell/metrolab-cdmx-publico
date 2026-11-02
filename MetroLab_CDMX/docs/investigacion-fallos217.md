# Investigación y ensayos visuales de fallos · revisión 217

Consulta: 1 de noviembre de 2026. Primer bloque de ocho escenarios, cuatro de subestación y cuatro de tren. Cada escenario ofrece una vista de contexto 3D, estados normal/fallo/detección/respuesta, tres indicadores gráficos, tendencias, fuente y datos pendientes. No incorpora acciones de reparación.

## Matriz de escenarios

| Ámbito | Escenario | Qué se observa en el ensayo | Base y alcance |
|---|---|---|---|
| Subestación | Pérdida de ventilación forzada | Menor caudal, aumento térmico y desconexión supuesta | Schneider FA32903; mecanismo general de refrigeración, sin trasladar capacidad o ajustes del fabricante |
| Subestación | Sobretemperatura del rectificador | Ventilación degradada, aviso y salida interrumpida | ABB ACS880: entradas AE14/4E03; aplicación industrial comparativa |
| Subestación | Cortocircuito de alimentador CD | Corriente anómala y apertura de la rama | Sécheron SEPCOS; protección de tracción CD, sin cálculo de coordinación |
| Subestación | Fallo de cargador | Respaldo inicial y reserva decreciente | NERC 20100405; comportamiento cualitativo, sin copiar tensiones del incidente |
| Tren | Falta de confirmación de puertas | Solicitud presente con autorización de tracción inhibida | RAIB Bushey; arquitectura de otro material rodante, no ficha del STC |
| Tren | Compresor sin reposición | Reserva decreciente bajo un consumo supuesto | STC, conformación general; la evolución de la reserva es una inferencia educativa |
| Tren | Pérdida de captación | Desaparece el esfuerzo motor y persiste el movimiento | STC más balance cualitativo de energía; no es una simulación dinámica del convoy |
| Tren | Pérdida de freno eléctrico | Comparación con contribución de fricción supuesta | Referencia europea sobre frenado combinado; compensación no garantizada para esta flota |

## Datos, inferencias y límites

La vista muestra índices gráficos adimensionales entre 0 y 1. Su duración de 16 segundos es tiempo de reproducción, no tiempo de avería ni curva de protección. Las amplitudes son elecciones de diseño de la animación. El color térmico es falso color y no representa incandescencia. Las curvas son interpolaciones de estados conceptuales, no resultados de cálculo eléctrico, térmico o neumático.

La orden de un mando se distingue de su confirmación. La pérdida de energía de tracción no implica detención instantánea; un fallo de cargador no implica pérdida instantánea de toda la alimentación de control; el calor no desaparece al desconectar la carga. La reserva bajo consumo es un supuesto explícito.

La mezcla de frenos se usa solo como comparación. No se afirma que los tres modelos tengan igual arquitectura, redundancia, comportamiento degradado o distancia de parada. La fuente europea no se presenta como legislación aplicable al Metro mexicano. Tampoco se deduce que una indicación de enclavamiento descarte cualquier atrapamiento.

Faltan fichas verificadas por modelo y equipo: circuitos, posición exacta de sensores/compresores, potencia y pérdidas, sensores térmicos, curvas de protección, impedancias de red y retorno, bancos de batería, consumos/autonomía, volúmenes y presiones neumáticas, adherencia, carga y lógica de frenado. Los conjuntos 3D existentes se reutilizan como contexto, sin afirmar que muestren esos circuitos internos.

## Fuentes primarias públicas

1. STC Metro, [Conformación de un tren](https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren). Equipos generales y captación; no documentación individual del NM-22/NM-79/MP-82.
2. Schneider Electric, [FA32903: ventilación forzada de transformadores TRIHAL](https://www.se.com/nl/en/faqs/FA32903/). Ejemplo de fabricante, no identificación del equipo del STC.
3. ABB, [ACS880 diode supply control program](https://library.e.abb.com/public/e0884101599d4c96a136ff5f1e389266/EN_ACS880_diode_supply_ctrl_prg_FW_F_A4.pdf). Fault tracing, AE14 y 4E03. Sin atribuir sus códigos al rectificador del simulador.
4. Sécheron, [Control & protection relays · SEPCOS](https://www.secheron.com/products-solutions/traction-power-systems/protection-supervision/control-protection-relays/). Protección de tracción en CD.
5. NERC, [Substation DC Voltage Alarm Set Points, Lesson Learned 20100405](https://www.nerc.com/globalassets/programs/event-analysis/lessons-learned/ll20100405_substation_dc_voltage_alarm_set_points.pdf). Página 1, Problem Statement y Details; el caso corresponde a otra red.
6. RAIB, [Safety digest 07/2018 · Bushey](https://www.gov.uk/government/publications/safety-digest-072018-bushey/passenger-trapped-in-train-doors-and-dragged-at-bushey-station-26-march-2018). Notas 2 y 4 y límites de la detección.
7. Publicación oficial, [Regulation (EU) 1302/2014, consolidación 11-03-2020](https://www.legislation.gov.uk/eur/2014/1302/pdfs/eur_20141302_2020-03-11_en.pdf). Cláusulas 4.2.4.4.4 y 4.2.4.7, como referencia comparativa de frenado.

Se distribuyen resúmenes y enlaces, no copias de manuales ni documentos retirados de la biblioteca. Su catálogo gubernamental se conserva. Los enlaces requieren internet; los textos, curvas y modelos del ensayo se ejecutan con recursos locales del proyecto.

## Acceso y comprobación

Explorar flota → elegir modelo → Pruebas visuales de fallos. En la subestación se ofrece el mismo botón junto a sus apartados. Reproducir/Pausar, Reiniciar, Avance y Ver conjunto controlan únicamente la presentación. El recorrido y las misiones existentes se conservan.

Pruebas específicas: ocho casos con fuentes y pendientes, relaciones causales, señales finitas, reloj independiente de 30/60/144 FPS, pausa/avance/pestaña oculta, conjuntos reales de los tres trenes y subestación, colores/transformaciones fuente intactos y geometría prestada no eliminada. Renderizado limitado mediante RenderBudget101 a un máximo de 60 FPS, sin reducir materiales del modelo. No se declara una medición de FPS GPU.

Rama revision/ensayos-visuales-fallos, basada en revision/controles-y-corte-alimentacion (PR #4), para conservar las correcciones anteriores aún pendientes de integración en main.

La suite de regresión quedó completada por bloques: el proceso acumulativo de embarque209 agotó memoria sin fallo de aserciones; se ejecutaron las seis estaciones en procesos separados con las mismas aserciones, seguidas de todos los controles restantes y la prueba del servidor. La verificación nueva de modelos/secuencias volvió a pasar tras ajustar encuadre y liberación de recursos. Registro local qa217.log y qa217-resume.log (fuera de los archivos publicados).

QA WebGL: apertura desde flota y desde subestación, reproducción hasta el final, avance manual, cambio de ámbito y escenario, encuadre de conjunto y cierre/reapertura con restauración de la vista original. Sin errores de consola en los recorridos revisados. La vista deja de renderizar continuamente al pausar y libera modelo propio, controles y entorno al cerrar.
