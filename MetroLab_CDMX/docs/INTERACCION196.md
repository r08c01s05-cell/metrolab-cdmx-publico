# Interacción y montaje · 196

## Funciones que se recuperan

El inspector conserva la plataforma técnica y vuelve a permitir giro automático y arrastre manual. Pausar el giro es una elección persistente; tocar el modelo ya no provoca una reanudación inesperada cuatro segundos después. El encuadre contempla una vuelta completa. Las vistas Interior/Cabina se calculan después de cerrar el despiece, con referencia al piso y al extremo real del modelo.

## Movimiento y espacio de trabajo

En mantenimiento, un clic en el escenario puede capturar el mouse aunque debajo haya un equipo, sin tener que encontrar un trozo de suelo vacío. El arrastre derecho permite orientar la vista con cursor libre. E interactúa y Esc libera el cursor. El plan del taller queda en un cajón J, en vez de reservar una columna permanente. «Ver tren» permite inspeccionar el conjunto y WASD devuelve al puesto de trabajo.

El filtro y el ventilador montados se incluyen en la reserva fija de colisión: el jugador puede acercarse, pero no entrar con la cámara dentro de sus superficies. La reserva no sigue al filtro cuando se transporta.

## Herramientas y medición

La búsqueda de herramientas utiliza volúmenes sobre los bolsillos reales, sin recorrer las mallas detalladas en cada movimiento del mouse. La animación de apertura tarda 380 ms y la extracción/incorporación 480 ms; son tiempos de animación, no una garantía de rendimiento del navegador. La selección completa la extracción directamente. Desde el gesto de selección se solicita la captura del mouse, para continuar al terminar sin otro clic; si el navegador la rechaza, sigue disponible el arrastre derecho. Solo se abre la bolsa al estar a distancia de alcance y una herramienta en uso no aparece duplicada en su bolsillo.

Los agarres se apoyan en la palma, con dedos cerrados alrededor de la herramienta. Los hombros siguen la vertical y el giro del cuerpo, en vez de girar con la inclinación de la cabeza. Se mantienen longitudes fijas de brazo/antebrazo. El anemómetro se aproxima al ventilador durante la medición y regresa a su posición de transporte; la lectura aparece en el LCD del instrumento. Soltar la interacción, alejarse o cancelar interrumpe la toma, conservando el objeto.

El fondo opaco original del LCD deja de tapar el plano dinámico. Las actualizaciones de texto y lectura solo se dibujan si cambian; el acceso a subestación deja de observar indefinidamente todas las mutaciones del documento.

## Montaje

Las dos puertas añadidas al banco de baterías abren hacia el pasillo. Las otras once hojas conservan su apertura. Los cuatro tornillos de ventilación tienen chapa fija, arandelas y vástagos cautivos; los huecos del filtro y ventilador permanecen abiertos para permitir el flujo y la retirada. No se usa una placa maciza que oculte el ejercicio.

La identificación americana del unifilar se documenta en [SIMBOLOGIA196.md](SIMBOLOGIA196.md). Se preservan topología, cédulas y exportadores compartidos.

## Comprobaciones reproducibles

```sh
node scripts/verificar_imports122.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_bolsa196.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_herrajes196.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_simbologia196.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_colision196.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_transporte188.mjs
```

Las verificaciones opcionales `verificar_giro196.cjs` y `verificar_navegacion196.cjs` usan navegador real y eventos de entrada. Requieren un servidor en marcha y `METROLAB_PLAYWRIGHT_PATH` apuntando a Playwright instalado fuera del proyecto. Las capturas se revisan por separado con WebGL por software; no equivalen a medir el rendimiento o la calidad de una GPU del estudiante.
