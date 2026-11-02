# Revisión 142 · Instrumentos, intervención y experiencia

Base recuperada: c89d58b6ad144259c0a087c163e159296bc36acd (versión 141). Los archivos no guardados de un intento anterior se perdieron al reiniciarse el entorno; esta revisión se reconstruyó sobre el código conservado y se verificó de nuevo.

## Referencias y alcance

Las ocho capturas 012214, 012305, 012411, 012420, 012428, 012440, 012457 y 012535 se conservan en assets-source/referencias142. Son capturas del simulador: documentan problemas visuales y no son fotografías de instrumentos reales de fabricante. No aportan cotas ni diagramas eléctricos nuevos.

Los instrumentos METROLAB son diseños educativos genéricos, no réplicas comerciales ni equipos de medición certificados. Los valores son ficticios de entrenamiento, sin relación con mediciones del Metro. No se afirma haber alcanzado fotorrealismo. Los trenes, andenes, afluencia, clima, cámaras y audios anteriores se conservan; esta revisión no reconstruye cada modelo del proyecto.

## Modelos editables y GLB

- instrumentos142.blend: multímetro, megóhmetro con LINE/EARTH/GUARD y anemómetro de hélice; carcasas moldeadas, juntas, teclas, tornillos, serigrafía, sockets, selector y resguardos. Metros, +Y arriba y frente +Z al exportar. La composición del render coloca los tres instrumentos separados para revisión; cada raíz se usa individualmente en ejecución.
- servicio_ventilation142.blend: medio filtrante continuo de 40 pliegues, perfiles de aluminio, sello de goma y polvo fino con textura RGBA embebida. Conserva cuatro tornillos, bandeja, filtro extraíble y nombres interactivos. Su render nativo aún contiene el instrumento de soporte anterior; el anemómetro nuevo se instala en ejecución.
- subestacion142.blend: conserva doce conjuntos y once bisagras; incorpora perfiles de chasis, travesaños y perforaciones detrás de las hojas cerradas. El cartel SALIDA queda asociado al cerramiento. Conserva la disposición eléctrica anterior. El archivo editable se guarda cerrado; GLB exporta extremos de apertura de 105 grados para el contrato de animación existente.

Los GLB llevan los mapas embebidos y se sirven comprimidos con gzip. Los scripts de reconstrucción y los renders de revisión se conservan con el código fuente. Los renders de Blender no son capturas del navegador.

## Interacción y didáctica

El ejercicio de aislamiento utiliza el megóhmetro; diodos, relé y banco general eléctrico usan multímetro; ventilación usa anemómetro. La lectura LCD procede del estado de la misión. Se puede enfocar el instrumento. Las puntas siguen siendo objetos conectables y retirables y sus puertos se ajustan al nuevo instrumento.

La práctica de ventilación compara 0.6 m/s antes y 2.4 m/s después de la intervención. Son valores ilustrativos, no criterios normativos. La limpieza permite pasadas continuas; una liberación tras arrastrar no regala una pasada adicional. Se toleran pequeños huecos entre pliegues mientras se conserva el objetivo capturado. Tornillos mantienen clics, giro y pulsación sostenida, sin doble avance al soltar. Se retira la caja de selección permanente.

Los cables actualizan atributos de geometría existentes en vez de destruir geometrías y materiales por movimiento. La vista de mantenimiento de SR se actualiza hasta 60 Hz, condicionada por el equipo; no se afirma un FPS medido.

## Carga real e interfaz

Portada nueva con cinco experiencias y una paleta común carbón/menta/ámbar. Se conservan controles nativos y sus manejadores. No se añaden botones decorativos sin acción.

Las cargas esperan promesas reales de modelos y materiales, compilación de shaders y un primer fotograma renderizado. Flota, inspección, banco general, subestación, misiones SR, recorrido y cambios de línea tienen barreras de carga. Las entradas de fondo quedan inertes y la física del recorrido no avanza mientras la barrera global está activa. Si un recurso necesario falla, queda una pantalla con reintento y salida; un tiempo límite es un fallo, no una carga exitosa. Los escenarios posteriores del recorrido siguen cargándose progresivamente.

El audio se activa por acción del usuario; su carga espera decodificación y conserva los avisos y momentos de reproducción anteriores.

## Verificación

- Tres modelos nativos: jerarquías, geometría finita, límites de mallas, controles, puertos y LCD; comparación de flujo.
- Barrera de carga: pendiente hasta modelo/compilación/fotograma, bloqueo de fondo, cargas simultáneas, fallo/reintento y tiempo límite.
- Quinientas actualizaciones de cables sin sustituir buffers.
- Seis misiones SR: estados finales, clic/mantener/girar, arrastre/retorno/cancelación del filtro y teclado. Once hojas y 1094 mallas internas revisadas contra cierre de gabinetes.
- Cuatro misiones generales completas, incluidas 52 acciones del ejercicio eléctrico y retirada de puntas.
- Arranque real de app.js en DOM de prueba; tracción/freno, pausa y velocidades 1/2/5. Conservación del canvas, cámaras, mapa y manejadores.
- Auditoría de 75 GLB servidos: geometría finita, UV, mapas embebidos/materiales y presupuesto de texturas.
- Revisados renders nativos de instrumentos, filtro y subestación.

No se realizó validación visual en navegador ni medición de FPS en el dispositivo del usuario: no hay capacidad de navegador de prueba disponible en este entorno. Las pruebas DOM/CPU no sustituyen esa comprobación.
