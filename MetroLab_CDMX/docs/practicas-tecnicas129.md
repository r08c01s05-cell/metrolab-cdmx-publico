# Prácticas técnicas de subestaciones · revisión 129

Se añaden tres prácticas dentro de **Explorar subestaciones → Mantenimiento**, conservando las tres básicas. Las técnicas aparecen primero en la lista.

| Práctica | Trabajo del usuario | Comprobación |
|---|---|---|
| Diodos de rectificación | Selección de modo, medidas en ambas polaridades de un patrón y del módulo con falla, interpretación, retirada de puntas, sustitución y repetición de medidas | El patrón conduce/bloquea; el módulo de práctica inicial da 0,02 V en ambos sentidos; el repuesto 0,57 V / OL |
| Comparación de aislamiento | Comparar dos ramales mediante instrumento virtual, interpretar el ramal con resistencia menor, sustituir una muestra y repetir la medición | Valores ficticios A 620 MΩ; B 18 MΩ inicialmente y 610 MΩ después. No son límites de aceptación de una instalación |
| Relé auxiliar y contactos | Medir la bobina, diagnosticar bobina abierta, sustituir el relé de práctica, medir resistencia y contacto NO antes/después de la señal virtual de 24 V CD | Lecturas ficticias OL / 960 Ω en bobina y OL / 0,2 Ω en el contacto; se retira la señal al finalizar |

Son bancos de componentes aislados. No se reproducen maniobras, ajustes de protecciones reales o ensayos de alta tensión de una subestación del Metro. El ensayo de aislamiento solo cambia datos del simulador y no prescribe una tensión de prueba. La tercera actividad comprueba un relé auxiliar; no se atribuye esa lógica a un relé de protección instalado.

## Blender

`assets-source/subestaciones129/` contiene **tres .blend**, tres exportaciones GLB canónicas y renders de Cycles: `diodes`, `insulation` y `relay`. Se crearon con la API real de Blender 4.3: biseles, materiales, textura empaquetada, instrumentos con selector y teclas, puntas, bornes, disipador y diodo, aisladores y ramales, bobina y armadura de relé. Escala en metros; mesa de 2,25 m de ancho. Textos convertidos en mallas con resolución ajustada al uso web.

Scripts: `build-technical129.py` requiere Python 3.11, `bpy==4.3.0`, `numpy<2` y Pillow. `optimize-technical129.py` genera solo los GLB web, con redondeo de posiciones a 1 µm y normales/UV a 1e-4, más compresión gzip (Zopfli opcional). Los GLB canónicos de Blender se conservan. No requiere Draco en el navegador.

Las lecturas se dibujan sobre la pantalla del instrumento 3D. Las dos puntas se desplazan a los bornes elegidos y sus cables se actualizan. Las teclas y puntos de conexión del GLB son seleccionables; la interfaz ofrece las mismas acciones mediante botones con nombre.

## Lógica y uso

- Cada medida exige modo y ambas puntas en las conexiones indicadas; se registra conexión roja, negra y lectura.
- **Retirar puntas** funciona también antes de terminar una medición. En ese caso se vuelve al inicio de esa conexión, sin bloquear el instrumento ni avanzar la práctica.
- El diagnóstico requiere elegir una interpretación; las respuestas incorrectas no completan el paso.
- Las sustituciones solo se habilitan en la secuencia con las puntas retiradas. El repuesto cambia visualmente y después debe verificarse.
- La carga es diferida. Cambiar rápidamente de práctica o salir mientras carga descarta la escena antigua; no se añade una escena pendiente al volver a explorar.
- Se conserva el progreso de prácticas completadas en el mismo almacenamiento local de la revisión 128.

## Referencias conceptuales

- [Fluke 16, hoja de instrucciones](https://media.fluke.com/8fa4422f-0fe9-4108-94d9-b10800be0631_original%20file.pdf): interpretación de la prueba de diodos en ambas polaridades.
- [Fluke, Insulation Resistance Testing](https://media.fluke.com/c34d63d2-ca47-4635-8a9f-b10600665ad3_original%20file.pdf): evaluación de aislamiento en equipo fuera de servicio y consideración del equipo bajo prueba.

Las fuentes respaldan los conceptos de medida; no proporcionan los valores ficticios ni certifican equipos del Metro.

## Verificación

- `verificar_tecnicas129.mjs`: carga real de los tres GLB de Blender, imágenes incorporadas, geometría/escala, secuencias completas, rechazo de errores, diagnóstico, liberación anticipada y reconexión de puntas, lecturas y raycasting.
- `verificar_interaccion_sr128.mjs`: las tres prácticas básicas y las tres técnicas mediante callbacks reales de botones, interpretación y registro, carga asíncrona, cambios rápidos, salida durante carga y restauración del explorador. Contrato DOM, no render WebGL.
- Regresión de explorador, menú y conducción.
- Los tres renders de Blender se revisaron visualmente. No se ha realizado una comprobación visual del sitio en un navegador WebGL ni medido FPS.
