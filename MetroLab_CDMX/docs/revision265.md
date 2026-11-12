# Revisión 265: edificios de los Puestos Centrales de Control

Rama `mejora/edificio-pcc265`. Apartado nuevo en el menú principal: «06 · Puestos Centrales de Control». Al entrar se elige P.C.C. 1 o P.C.C. 2.

## P.C.C. 1 (Buen Tono)

Edificio en 3D con cuatro vistas: edificio completo, corte por pisos, armado (los pisos se colocan de abajo hacia arriba y al final la fachada) y cada piso por separado con su equipo rotulado. La distribución es la de las diapositivas «Edificio del P.C.C. 1» de la presentación METRO 7EM1:

- Sótano: acometidas de Jamaica (lado A) y Nonoalco (lado B), transformadores de potencial y de corriente, interruptores Oerlikon, buses de 85 kV, S.R.M. en el muro divisor, cuchillas de tierra y tanques de CO2 al norte; bombeo de aceite, protección catódica, nitrógeno, control de cárcamos y galerías de cables al sur.
- Planta baja: TA1, TA2, TB1, TB2 y transformador de reserva, seccionadores Soulé, bobinas de punto neutro y grúa viajera de 80 toneladas.
- Primer piso: lockers y galería de cables de 15 kV y de control.
- Segundo piso: salas de interruptores de 15 kV, cuatro buses de tracción y dos de alumbrado.
- Tercer piso: bodegas de permanencias, cableado de control, grupo volante y baterías.
- Cuarto piso: mando centralizado, sala de relevadores, cargadores y rectificadores, banco de baterías, telefonía y Programa General de Tráfico.
- Quinto piso: Puesto Central de Control, P.D.C. con su tablero de distribución y gerencias de líneas 1, 2 y 3.
- Sexto piso: oficinas, videovigilancia, BINOI, simulador y conmutador general.

## P.C.C. 2

El material solo trae el diagrama unifilar de su subestación de alumbrado y fuerza: dos transformadores de 500 kVA alimentados desde el P.C.C. 1 por los circuitos AA 109 y AB 109, dos cabinas «N» y una cabina «P». Se dibuja eso dentro de un volumen translúcido rotulado como edificio no descrito. No se afirma qué líneas atiende.

## Supuestos y límites

- Medidas del edificio (44 m de lado, alturas de piso) y posición de cada equipo dentro de su piso: ilustrativas. El material da listas por piso, no planos.
- Sí se respeta lo que el material ubica: 85 kV en el lado norte del sótano, servicios en el sur, S.R.M. en el muro entre las cámaras de buses y subestaciones A y B en lados opuestos.
- La fachada sigue el modelo de la diapositiva (volumen oscuro con celosía vertical, azotea roja, domo blanco y pórtico de estructura blanca) sin reproducir el logotipo del Metro.
- No se tocó `engine.js` ni módulos protegidos. `game86.js` solo recibe la entrada de menú y la carga diferida del módulo.

Archivos: `dist/pcc-building265.js`, `dist/pcc265.css`. Prueba: `scripts/verificar_edificio_pcc265.mjs`.
