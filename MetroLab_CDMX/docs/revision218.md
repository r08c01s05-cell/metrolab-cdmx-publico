# Consecuencias animadas de fallos · revisión 218

Se amplía el laboratorio 217 en la misma rama `revision/ensayos-visuales-fallos`. No se modifica el motor de circulación, las vías de las líneas, los pasajeros ni las misiones de mantenimiento.

## Qué se observa

| Caso | Consecuencia visible | Alcance |
|---|---|---|
| Ventilación del transformador | Ventilador que pierde giro; contacto que abre en el detalle funcional | Protección térmica disponible es el caso de referencia; equipo íntegro tras desconectar |
| Variante de protección que no actúa | Oscurecimiento de aislamiento, humo suave y contacto cerrado | Hipótesis adicional seleccionable; daño potencial, no destrucción automática ni explosión |
| Temperatura del rectificador | Ventilador detenido y apertura de protección en detalle funcional | Sin umbrales o curvas reales |
| Alimentador CD | Movimiento del contacto hasta dejar una separación abierta | Detalle esquemático: el GLB tiene contactos batidos con otras piezas, no se rota todo el gabinete |
| Cargador | Se interrumpe la indicación del cargador y disminuye físicamente la barra de reserva | Consumo supuesto, sin autonomía calculada |
| Puertas | Una pareja real de hojas se desplaza y permanece abierta; tren quieto | Se mueven acero, vidrio y juntas juntos; tracción inhibida en el ensayo |
| Aire | Pistón del compresor detenido y barra de reserva decreciente | Tren estacionado como condición inicial, sin deducir un automatismo de freno no documentado |
| Captación | Vagón que avanza respecto de una vía fija y testigos de rueda que giran | Marcha por inercia ilustrativa, sin distancia física calculada |
| Freno eléctrico | Desaceleración y parada con complemento de fricción supuesto | No se garantiza ese comportamiento para cada material rodante del STC |
| Variante de adherencia reducida y bloqueo | Vagón que sigue trasladándose con ruedas/testigos detenidos | Dos hipótesis adicionales explícitas; no se deduce deslizamiento de todo fallo eléctrico |

El detalle SVG está identificado como esquema funcional, complementario al modelo 3D. No representa la ubicación exacta de los contactos o el compresor. La vía de observación generada pertenece solo al laboratorio; no cambia las vías del juego. Las llantas simétricas están agrupadas en el GLB: se articulan los aros y tornillos separados, con pequeñas marcas testigo de giro didácticas. No se modifican sus buffers compartidos.

## Tiempo y recursos

`fault-outcomes218.js` obtiene posiciones, ángulos y estados a partir del avance absoluto. Integra analíticamente señales lineales y la función suave de desaceleración. No acumula distancia por fotograma; pausar, retroceder o cambiar de frecuencia de pantalla no produce deriva. El recorrido de exhibición no se ofrece como metros ni como distancia de frenado real.

`fault-animation218.js` articula únicamente copias de estudio. Conserva matrices originales para restaurarlas; crea y libera sus materiales, geometrías y textura procedural de humo de 64 × 64 px. Los materiales fuente y buffers prestados permanecen intactos. El encuadre completo abarca toda la envolvente de movimiento. Se conserva RenderBudget101 con máximo de 60 FPS, el render bajo demanda en pausa, los materiales, mapas y la iluminación anterior.

## Fuentes adicionales y límites

Consultadas el 1 de noviembre de 2026:

- [Hammond Power Solutions: Transformer is overheating](https://americas.hammondpowersolutions.com/resources/faq/troubleshooting-guide/transformer-is-overheating). Describe signos posibles de sobrecalentamiento, entre ellos aislamiento oscuro/quemado y humo. Sustenta la posibilidad del daño; no proporciona un tiempo universal de fallo ni identifica el transformador del STC.
- [RAIB, Annual report for 2023](https://www.gov.uk/government/publications/raib-annual-report-2023-published-2024/annual-report-for-2023). Referencia comparativa de problemas de adherencia rueda–riel y frenado; no es documentación del tren neumático mexicano.
- Se conservan las fuentes primarias, evidencia y pendientes de [la investigación 217](investigacion-fallos217.md), incluidas protección de tracción CD, puertas y conformación general del tren.

Las variantes actualizan también las señales/gráficas y la explicación de supuestos: en protección inoperante la potencia permanece conectada. No se atribuyen ajustes térmicos, presiones, selectividad, adherencia o lógica de seguridad no verificados a NM-22, NM-79 o MP-82. Los 16 s son tiempo de presentación, no desarrollo real de una avería.

## Verificación

`verificar_animaciones218.mjs`: NM22/NM79/MP82; ocho aros por modelo, dos hojas completas con vidrio/acero, tres ciclos de avance/retroceso/restauración, rodadura frente a ruedas bloqueadas, envolvente de encuadre, no eliminación de geometría prestada, humo solo en la variante no protegida y estado final determinista a 30/60/144 Hz.

`verificar_fallos217.mjs` conserva la regresión de los ocho escenarios y el aislamiento de recursos. `verificar_imports122.mjs` comprueba 197 módulos con URL única y sintaxis válida. El nuevo test se incorpora al verificador compartido. No se repite toda la batería histórica: los cambios están limitados al laboratorio. Falta calibración física con fichas de los equipos y medición de FPS en GPU; no se declaran resultados físicos ni rendimiento medido a partir de las pruebas CPU.

QA WebGL completada: apertura del laboratorio, contraste entre protección activa/inoperante, apertura física de hojas en NM-22, reproducción de frenado hasta la parada, avance manual y variante de bloqueo/deslizamiento. Detalle de protección y puertas comprobados en captura; consola sin errores en el recorrido revisado. presentacion203 y fluidez202 también pasaron (temporización/cadencia CPU, no medición GPU).
