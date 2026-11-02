# Vestuarios diferentes por pasajero

Se asignan combinaciones de colores estables según la identidad del personaje:
18 colores base de prendas superiores, 12 de prendas inferiores, 8 de calzado
y 8 de mochila, más variaciones suaves de tono. También cambian los detalles,
correas, suelas y la ropa del niño del modelo familiar. Los materiales de tela
reciben un acabado mate.

Se mantienen las mallas, cortes de ropa, piel, rostros y pelo de los GLB aportados.
Esta revisión varía el vestuario mediante materiales; no añade nuevas prendas
modeladas ni texturas fotográficas. El cambio se aplica en los andenes, durante
el embarque y dentro del vagón. El vestuario se conserva mientras exista la misma
identidad de actor, incluso si se reutiliza una copia del modelo.

Cada personaje tiene copias propias de los materiales de ropa. Las geometrías
y los materiales anatómicos siguen compartidos. No se modifican los GLB originales.
Los materiales de copias descartadas se liberan.

Verificación: `node --loader ./scripts/test-loader.mjs scripts/verificar_vestuarios33.mjs`.
Prueba 320 vestuarios distintos, persistencia al reordenar o reciclar las copias,
aislamiento de materiales y conservación de la anatomía en los cinco modelos.
También se verifica `verificar_personajes31.mjs`. Falta revisión en navegador.
