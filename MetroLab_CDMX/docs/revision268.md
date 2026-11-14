# Revisión 268: entorno urbano y más realismo en los P.C.C.

Rama `mejora/entorno-pcc268`. Todo dentro de `dist/pcc-building265.js`; no cambia ninguna pieza documentada ni su posición.

## Entorno (`surroundings268`)

Predio con patio adoquinado, barda con reja, caseta y pluma de acceso; banquetas y calles en los cuatro lados con carriles y cruces peatonales; árboles con cajete, luminarias, bancas y jardineras; autos estacionados y circulando; edificios vecinos con ventanas del otro lado de las calles (más bajos del lado de la cámara para no tapar). Es ambientación genérica: no reproduce las manzanas reales de Buen Tono ni de Delicias.

## Construcción (`structure268`, `shell268`)

- P.C.C. 1: columnas con capitel y trabes perimetrales en cada piso, núcleo de escalera y elevador, puerta y extintor por piso, zócalo, pretil, equipos de azotea, antena, marquesina con puertas de cristal y portón de maniobras.
- P.C.C. 2: se dibuja en corte, con muros bajos, columnas y canceles de cristal entre las tres áreas.

## Equipos (`detail268`)

Transformadores con tanque conservador, base, ventiladores, tablero y placa; aisladores con faldones y herrajes; interruptores Oerlikon con bastidor y gabinete de mando; buses con aisladores soporte; gabinetes con zoclo, ducto y pilotos; pupitres y escritorios con monitores, teclado y silla; charolas con cables; grúa con testeros, polipasto, cables y gancho; baterías con bornes; estantería, tanques, bobinas y simulador.

## Imagen

Mapa de entorno para reflejos, relieve en texturas, tres texturas nuevas (ventanas, follaje, adoquín), niebla ligera y sombras de mayor resolución. En «Corte por pisos» y en el armado se oculta el detalle fino para no cargar de más la tarjeta gráfica.

Prueba: `scripts/verificar_edificio_pcc265.mjs` (bloque 268).
