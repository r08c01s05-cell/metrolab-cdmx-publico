# Convención americana del unifilar

La revisión mantiene los símbolos de cuchilla abierta, interruptor de arco, transformador de círculos acoplados, reactor bobinado, batería de placas largas/cortas y puesta a tierra que ya tenía el dibujo. No había una resistencia rectangular IEC en el unifilar: los rectángulos rotulados REC-1, TD-AUX y TD-CTRL representan bloques funcionales de equipos.

Sí había una mezcla de designaciones. Se sustituyen `DS-1`, `QF-CD` y `Q-AUX` por las funciones de dispositivo utilizadas en la convención americana:

| Identificación | Función representada | Circuito conservado |
| --- | --- | --- |
| 89-1 | Seccionador de línea | C01 |
| 52-1 | Interruptor de corriente alterna | C01 |
| 72-CD | Interruptor de corriente directa | C04 |
| 52-AUX | Interruptor de auxiliares CA | C06 |
| 50 / 51 | Sobrecorriente instantánea / de tiempo | Relé asociado al TC de CA |

En particular, 52 corresponde al interruptor de CA; el interruptor de la rama de tracción CD se identifica como 72. La leyenda y la información del plano presentan estas funciones junto a sus símbolos. Se extiende también la línea de control hasta el borde del relé de medida, cerrando una pequeña separación gráfica.

El mismo registro de dibujo genera SVG, DXF y PDF. Se conservan los catorce circuitos, sus cédulas, cálculos, enlaces de selección, peso de texto y fondo de pantalla. No se agregan aparatos ni conexiones de potencia por este cambio.

Referencias del proyecto: IEEE/ANSI 315-1975, convención gráfica (estado Inactive-Reserved), e IEEE C37.2-2022, funciones de dispositivos. Se mantiene pendiente el cotejo integral con los textos autorizados; no se declara certificación de una instalación. La referencia mexicana de símbolos NMX-J-136-ANCE-2019 y el alcance de las NOM de instalación siguen indicados aparte.

En el modelo 3D, el mímico MT es una línea/barra de corte. Los nombres de bornes A1/A2 y las etiquetas físicas QF1/K1/PS1 de los activos de práctica no son por sí mismos una convención gráfica del unifilar. No se reetiquetan sin la documentación del tablero para evitar discrepancias con sus terminales y actividades.

Validación: `node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_simbologia196.mjs`. Se comprueban CA/CD y funciones, selección de circuitos, exportación compartida, legibilidad y conservación de las catorce cédulas.
