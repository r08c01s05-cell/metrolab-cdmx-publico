# Materiales y menú de mantenimiento · 185

La capa de materiales compartida por trenes, estaciones, infraestructura, taller, subestación y herramientas ahora distingue mejor el agregado mineral y terrazo, grano direccional de metal, pintura, goma y tejido. Los mapas de concreto y suelo tienen 512 × 512 píxeles; los demás mantienen 256 × 256. Las 17 familias comparten 46 mapas con 16 MiB de datos base antes de mipmaps. Se generan localmente, sin nuevas descargas ni licencias externas.

Se mantienen colores, texturas, normales, rugosidad y oclusión originales de los activos. Los detalles usan coordenadas físicas independientes de las etiquetas. Se evita usar el mapa de color como oclusión ambiental, que oscurecía dos veces superficies. No se han reemplazado caras, modelos de personas, letreros ni lecturas. Los modelos con mapas propios conservan esos mapas.

El panel de mantenimiento es más estrecho y conserva un cierre accesible mientras se desplaza. Elegir un modo de cámara o comenzar a caminar cierra el menú automáticamente.

Verificación: `node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_materiales185.mjs` comprueba materiales de NM22, MP82, Pantitlán, subestación y herramientas, preservación de mapas, espacios de color, variación de rugosidad y presupuesto de memoria. También se ejecutan los controles de subestación, andén, mantenimiento de trenes, conducción e imports. El detalle de materiales no garantiza fotorrealismo ni una tasa de cuadros determinada; hace falta revisar escenas y rendimiento con GPU en el equipo de destino.
