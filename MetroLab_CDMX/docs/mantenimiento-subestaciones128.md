# Mantenimiento de subestaciones · revisión 128

Ruta: **Explorar subestaciones → Mantenimiento**. La pestaña se habilita cuando termina de cargar el modelo GLB de Blender. Los accesos anteriores siguen funcionando.

Tres ejercicios:

- **Ventilación del transformador**: inspección, dos fijaciones, retirada del filtro, tres pasadas de limpieza, colocación, fijación y prueba del ventilador (11 acciones).
- **Circuito auxiliar de práctica**: comparación de dos puntos de medida, inspección, apertura del portafusible, sustitución, cierre, nueva lectura y prueba de lámpara (8 acciones).
- **Conexiones del banco auxiliar**: inspección de ambas conexiones, limpieza y ajuste, comprobación final (11 acciones).

Cada ejercicio vincula un panel de práctica 3D al conjunto correspondiente del GLB. Los paneles añadidos son geometría de interacción de Three.js; no se presentan como equipamiento instalado o planos reales. El modelo principal sigue siendo el exportado de Blender en la revisión 127.

Las acciones se realizan eligiendo una herramienta y haciendo clic en la pieza 3D marcada. Como alternativa accesible, los botones con el nombre de cada pieza ejecutan exactamente la misma acción, con las mismas comprobaciones de herramienta, orden y número de pasadas. No hay un botón que complete automáticamente el ejercicio. Se muestra el paso actual, progreso, manual y respuesta a cada acción, incluidas acciones erróneas.

El filtro se desplaza al retirarlo; la suciedad desaparece por pasadas; las fijaciones giran; el fusible cambia y se recoloca; la prueba hace girar el ventilador o enciende el indicador. El circuito auxiliar utiliza lecturas ficticias de 24 V CD y retorno COM implícito de un banco didáctico; no afirma que esa tensión sea la instalada en el Metro. No contiene instrucciones de maniobra sobre una subestación real o equipos energizados de alta tensión.

**Reiniciar** reconstruye la práctica y limpia sus efectos. Las prácticas finalizadas se guardan en almacenamiento local del navegador, sin cuentas ni sincronización; si no está disponible, siguen siendo utilizables durante la sesión. Al volver a Explorar se descarta la práctica en curso y se restauran la cámara, el conjunto seleccionado, el despiece y la visibilidad anteriores. Cerrar y reabrir todo el explorador conserva la práctica en memoria sin dejar su animación activa mientras está cerrado.

Validación:

- `verificar_mantenimiento_sr128.mjs`: las tres secuencias completas, rechazo de herramientas/piezas incorrectas, pasadas, efectos en la geometría, lectura final, reinicio e intersecciones reales de rayos.
- `verificar_interaccion_sr128.mjs`: los tres ejercicios mediante callbacks reales de botones, guardado y progreso, reinicio, una acción mediante raycaster de Three.js, limpieza de escena y restauración de exploración. Contrato DOM con visor simulado, sin WebGL.
- Regresión: `verificar_blender127.mjs`, `verificar_portada114.mjs`, `verificar_inspeccion126.mjs`, `verificar_sim106.mjs`.

No se ha realizado una prueba visual interactiva del sitio en un navegador WebGL ni una medición de FPS.
