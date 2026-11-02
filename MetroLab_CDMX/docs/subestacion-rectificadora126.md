# Subestación rectificadora · revisión 126

Se añade una inspección 3D independiente, accesible con **Subestación rectificadora** desde el taller, la selección de trenes y el recorrido. Selección por geometría o lista; acercamiento al conjunto; interior/edificio, despiece, aislamiento y encuadre. El recorrido se pausa y se restaura al cerrar. La escena se carga al abrir, se reutiliza y no se anima cerrada. Navegación: arrastre para girar, botón derecho para pan y rueda para zoom.

## Base y alcance

- Información aportada: **METRO.pdf**, páginas 14–16. Describe transformador seco 15 kV / 540 V CA, doble secundario, rectificador de silicio dodecafásico y bobina de equilibrio, alimentación 750 V CD y ventilación forzada. Se conservan como referencias documentales históricas, sin afirmar que sean valores instalados en todas las unidades actuales.
- Referencias gráficas aportadas: *Despiece técnico de subestación rectificadora.png*, *Infografía de Subestación Rectificadora de Tracción.png* y *Despiece de subestación rectificadora.png*. Se usan sus familias de componentes, no sus leyendas contradictorias de tensión ni un transformador de aceite en sustitución del seco descrito en el documento.
- Contraste de arquitectura: [ABB Enviline TDR/WDR](https://library.e.abb.com/public/2435f4fd81c44b39ac28bfec91542945/Enviline%20TDR,%20WDR%20EN.pdf). Documenta rectificación estacionaria de tracción y opciones de protección, medida y control. No identifica los equipos instalados en CDMX.

Modelo **didáctico general**, de dimensiones ilustrativas en metros. No representa una planta levantada, inventario de activos, ubicación, ajuste de protecciones o procedimiento de intervención real. No modifica las cantidades y emplazamientos de SAF/locales eléctricos existentes ni los reclasifica como rectificadoras. CD− (retorno de tracción) y PE (protección) se modelan separados; no se representa una alimentación bipolar ±750 V.

## Conjuntos internos

1. Celdas MT: envolventes abiertas, barras, aisladores, polos de interruptor, seccionamiento, transformadores de medida y módulos de protección.
2. Transformador seco: núcleo laminado, yugos, mordazas, tres primarios y dos secundarios por columna, salidas diferenciadas y ventiladores.
3. Rectificación: dos puentes de seis diodos (12 diodos), disipadores con aletas, fusibles, barras, sensores, ventiladores y reactor de equilibrio.
4. Distribución CD: interruptores, cámaras de extinción, seccionadores de cuchilla, barras, aisladores y medidores; salida positiva y retorno identificados.
5. Control: módulos en carriles DIN, fuentes/protecciones, canaletas ranuradas, borneras representadas por módulos, pantalla de supervisión y comunicaciones. No reproduce un circuito de control cable por cable.
6. Banco auxiliar de 16 celdas ilustrativas, puentes, bornes, bastidor y cargador. Sin atribuir química, autonomía o tensión no comprobadas.
7. Transformador auxiliar, tablero de servicios, luminarias y toma.
8. Bandejas con peldaños y soportes, acometidas, secundarios, salida CD y control; tapas parciales de registro.
9. Barra PE, terminales, enlaces a envolventes y registro/electrodo ilustrativo.
10. Losa, muros, bancada y acceso.
11. Cubierta, extractores y rejillas.
12. Detectores, sirena, central, pulsador y extintores.

Se muestran superficies PBR procedurales de acero, pintura, cobre, aislantes y hormigón. Las mallas se agrupan por material dentro de cada conjunto seleccionable: 69 mallas y 27.608 triángulos. No se han reexportado archivos Blender ni modificado los modelos de trenes en esta revisión.

## Verificación

- `scripts/verificar_rectificadora126.mjs`: doce conjuntos, diodos, doble secundario, equipos, geometría finita, índices, escalas, transformaciones independientes y mapas de acabado.
- `scripts/verificar_inspeccion126.mjs`: eventos reales de entrada/salida mediante contrato DOM con visor simulado; pausa/restauración, reutilización de visor, parada de animación y conservación de pausa previa.
- Regresión: `verificar_sim106.mjs` y `verificar_mantenimiento125.mjs`.
- Sin comprobación de render WebGL ni medición de FPS en navegador. Las pruebas de CPU/DOM no equivalen a una validación visual interactiva.
