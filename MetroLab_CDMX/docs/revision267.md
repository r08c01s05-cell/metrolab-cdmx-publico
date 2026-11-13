# Revisión 267: P.C.C. 2 completo

Rama `mejora/pcc2-267`. El P.C.C. 2 del apartado «Puestos Centrales de Control» deja de ser solo su subestación y pasa a tener tres áreas.

## Fuentes

- Infografía «Metro CDMX · PCC2» que aportó el usuario: líneas 7, 8, 9, B y 12; hora pico de 6:00 a 10:00; 24 trenes y unos 300 usuarios por minuto en Línea 8; partes del tablero de control óptico (reloj madre, indicador de retrasos, control de tráfico, número de tren, estación, alimentación de tracción); foto de la sala circular.
- Boletín del Metro (recorrido de julio de 2024, texto que aportó el usuario y nota de Posta del 7 de agosto de 2024): P.C.C. 2 en la sede de Delicias 67; cuarto técnico con gabinetes de respaldo de telecomunicaciones y CBTC, interconectado con la Nueva Línea 1, redundante, en operación para Pantitlán - Isabel la Católica; respalda al nuevo P.C.C. 1 y se enlaza por la galería subterránea.
- Reportaje de Chilango: el P.C.C. 2 controla las líneas 7, 8, 9 y B; equipo de cada regulador.
- Material del curso: subestación de alumbrado y fuerza (dos transformadores de 500 kVA, circuitos AA 109 y AB 109, cabinas «N» y «P»).

## Qué se agregó

- Sala de regulación circular con un puesto por línea: tablero de control óptico (textura esquemática propia, `paintTco267`), reloj madre, tres pupitres y pantallas de andenes.
- Cuarto técnico: gabinetes de respaldo de telecomunicaciones y de CBTC, charolas y enlace a la galería de cables.
- Subestación de alumbrado y fuerza, como estaba.
- Lista de áreas en el panel lateral, con texto, datos y notas de discrepancias.

## Discrepancias y supuestos declarados en pantalla

- Ubicación: Delicias 67 según el boletín; la infografía dice Talleres de Zaragoza. Se toma el boletín.
- Línea 12: solo aparece en la infografía; se rotula así.
- NM16 y NM22: los menciona la infografía; no se confirma en qué líneas del P.C.C. 2 circulan.
- Edificio no descrito: volumen sin pisos; áreas una junto a otra. Número de gabinetes y de pupitres, ilustrativo.

Prueba: `scripts/verificar_edificio_pcc265.mjs` (bloque 267).
