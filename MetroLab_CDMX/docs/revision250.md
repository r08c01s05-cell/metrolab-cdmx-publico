# Circuito continuo y pausa de análisis · 250

Se continúa en revision/flujo-energia-via-captadores (PR3), pendiente de revisión visual, sin integrar a main.

## Cambios

Cuatro trazos continuos recorren la longitud completa de la línea seleccionada: alimentación y retorno de ambas vías. Una derivación corta por carro motriz sustituye los seis alimentadores superpuestos. Se retiran los picos elevados en los extremos y se reducen opacidad/tamaño de pulsos. Los buffers de las barras estáticas se conservan; la búsqueda de pulsos usa longitudes acumuladas y búsqueda binaria. No cambia vías, apoyos, pasajeros ni física.

Se añaden gabinetes e identificadores SR didácticos y alimentadores inferiores a las dos vías. Para distribuirlos en el escenario se coloca una fuente cada dos estaciones, incluyendo extremos: es un supuesto de exhibición, no inventario ni ubicación real del Metro. Son independientes de los locales SAF existentes, que no se representan como fuentes de tracción. Las barras representan disponibilidad de alimentación: no se calcula flujo de carga, seccionamiento, reparto entre subestaciones o impedancias de la red. El tablero conserva su modelo concentrado anterior.

El conjunto electrónico comparativo conserva proporciones con escala uniforme 0,5; el despiece desplaza su placa 1,5 m. Se mantienen seis posiciones IGBT/diodo solo para VVVF.

En el análisis, Pausar recorrido / Reanudar recorrido y el botón general de pausa conservan las gráficas accesibles sin modal. El registro usa engine.time, no tiempo de reloj: no añade energía ni historial mientras está parado. El menú general de pausa funciona fuera del análisis. Al cerrar el análisis con el recorrido detenido se conserva la pausa.

## Presentación de referencia

Se revisó el archivo local MetroLab_CDMX_80_diapositivas.pptx: 80 láminas rasterizadas, sin texto editable. La lámina34, Circuito principal de potencia, orientó la explicación de captación, disyuntor, filtro/enlace CC, tracción y derivación auxiliar. No se copiaron sus imágenes ni símbolos sin verificar: el símbolo de CA junto a 750 VCC y otras notaciones impiden usarla como plano validado. No se incorporaron datos de corriente máxima ni afirmaciones por modelo a partir de estas imágenes.

## Comprobación

Pruebas energia250: barras completas, fuentes separadas de SAF, derivaciones cortas, buffers estáticos sin nuevas subidas, corte de alimentación, pausa sin historial/energía ficticios y reanudación con tiempo de simulación. energia249 y electrico245 pasaron. Conservado presupuesto de render de 60 FPS; sin medición GPU nueva.
