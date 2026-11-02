# Visibilidad y carga de los trenes de Línea 8

Se carga primero la pareja cabina/intermedio del tren seleccionado. La otra
familia de Línea 8 se carga después. Cada archivo tiene tres intentos con
espera breve y un límite de 45 segundos por solicitud. Se conservan los archivos
ya cargados; un error no bloquea los reintentos. El botón «Reintentar trenes»
permite recuperar la carga sin recargar toda la simulación.

La selección del tren de enfoque se valida contra la línea activa, evitando
usar un tren de la otra línea durante un cambio de selección.

No se confirmó la causa del fallo reportado en navegador. Los GLB locales
sí cargaron y generaron trenes completos antes de la modificación. Los registros
del servidor no mostraron errores; no registran los errores del cliente.
Esta revisión corrige la recuperación de carga y la selección entre líneas.

Verificación: `verificar_trenes34.mjs` carga los cuatro GLB reales de L8,
construye los trenes NM-79/MP-82 en ambos sentidos, verifica nueve coches,
dimensiones y hojas de puertas, y reproduce fallos temporales y persistentes
para comprobar la recuperación. Sin comprobación visual en navegador.
