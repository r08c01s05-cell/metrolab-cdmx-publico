# Integración del proyecto compartido · revisión 204

Base compartida: `4086805`, con Biblioteca y portal técnico, menú de siete opciones,
catálogo gubernamental, documentos retirados, bloqueo del servidor, guía por
inactividad y automatización de ramas. Se integran los cambios funcionales de las
revisiones locales 199–203 mediante comparación de tres vías con la base 198.
No se incorpora el historial documental antiguo ni se restauran archivos retirados.

## Mejoras recuperadas

- Taller: interacción apuntada con E, trabajo mantenido, transporte físico con
  manos visibles, S1 accesible y cámara independiente de OrbitControls.
- Subestación: puertas con agarre, alcance, colisión y oclusión; herramientas
  acostadas en la bolsa; agarres de instrumento/destornillador; conexiones y
  acabados; conducto, ventilador y control auxiliar tras el filtro.
- Trenes: MP-82 con parabrisas único y ópticas circulares según referencia aportada;
  entrada, recorrido interior y salida del vagón desde el andén.
- Personas y fluidez: límite de esqueletos próximos, poses instanciadas, rostros y
  pelo conservados, animación entre actualizaciones, búsqueda de puertas más ligera,
  presentación continua del tren y sus cámaras, resolución adaptativa compartida.

La guía por inactividad del taller conserva su lógica y ahora menciona E para girar.
La subestación utiliza el nuevo presupuesto gráfico manteniendo oculto el contorno
de selección, como en la versión compartida. Los sufijos de caché de los módulos
afectados y los modelos de tren cambian a 204 sin duplicar módulos en ejecución.

Las numeraciones 199 y 201 coincidían entre ambos historiales: los documentos del
colaborador mantienen sus nombres; las notas locales se guardan como
`revision199-taller.md` y `revision201-modelo-mp82.md`.

## Verificación

`verificar_colaboracion.mjs` incluye las pruebas nuevas de taller, puertas,
embarque, agarres, ventilación, multitud y presentación. La prueba portable del
frente comprueba el nuevo modelo y los dos extremos del convoy. La comparación
binaria opcional `verificar_mp82_201.mjs` utiliza ahora el commit inicial del
repositorio compartido, que contiene el mismo modelo previo, en lugar de depender
de un commit exclusivo del repositorio anterior; requiere ese historial disponible.

Pruebas opcionales de Chromium: `verificar_biblioteca204.cjs`,
`verificar_camaras203.cjs` y `verificar_taller199.cjs`, con URL local como argumento.
Omiten llamadas de dibujo para comprobar funciones; no miden FPS ni certifican
calidad visual en la GPU del usuario.

Resultado local: 177 módulos válidos, batería CPU/DOM/geometría completa y pruebas
de navegador de Biblioteca, cámaras L1/L8/subestación y taller aprobadas. La prueba
de controles usa ahora el controlador real de gabinetes durante toda la secuencia:
el montaje anterior cerraba puertas sin conectarlas al cambio de misión, por lo
que la nueva oclusión bloqueaba correctamente la punta de prueba. Se conserva la
comprobación de conexión de puntas y de bloqueo por puertas cerradas.
