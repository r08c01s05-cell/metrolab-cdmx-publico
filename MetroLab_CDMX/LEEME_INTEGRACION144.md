# MetroLab CDMX · integración 144

Esta edición integra selectivamente MetroLab_CDMX_Simulador_v142.zip en la versión 143. Conserva la documentación, afluencia, interiores recientes de Línea 8, instrumentos nativos y las diez misiones actuales.

## Ejecutar en Visual Studio Code

Abre esta carpeta y ejecuta `python iniciar_simulador.py` en la terminal. Requiere Python 3.10 o posterior, sin instalar paquetes. En Windows también puedes abrir `INICIAR_SIMULADOR.bat`. Para elegir puerto: `python iniciar_simulador.py --port 8100`. El servidor se limita a esta computadora y sirve la carpeta `dist`, incluyendo los documentos de consulta. No abras `index.html` directamente mediante file://.

## Incorporaciones

- Información: portal técnico, partes del tren con vistas 3D, cálculos interactivos y documentos/fuentes originales en tres pestañas.
- Ocho identidades de pasajeros a partir de cinco GLB del ZIP, con texturas, caminata, ropa y mochilas. Las madres utilizan un modelo infantil para el acompañante, no una copia reducida del adulto. Los modelos retirados se conservan en `assets-source/integration144/retired`.
- Ajuste asistido de parada: tren detenido, puertas bloqueadas, energía y vigilancia; máximo 150 m y 2 km/h en este escenario educativo. El botón permite cancelar. Los mandos manuales también cancelan el ajuste. No es una autorización real de circulación en reversa.
- Mapa L8 con proporciones conservadas y selección correspondiente a la posición dibujada; L1 conserva su trazado.
- Selector de tren sin duplicados, colores por línea y suelo de inspección oculto en el despiece.
- Despiece gradual y listado de componentes de la subestación actual; once puertas interactivas conservadas.

La evaluación y sus decisiones están en `dist/docs/Integracion144.md` y `dist/documentacion/integracion144.json`. Los cinco GLB nuevos se optimizaron para la web; las texturas originales de alta resolución siguen dentro del ZIP aportado. Se conservaron topología, esqueletos, UV y clips, con redondeo de vértices bajo precisión visual y texturas de hasta 512 px. Esto no constituye una reconstrucción fotogramétrica ni una promesa de fotorrealismo.
