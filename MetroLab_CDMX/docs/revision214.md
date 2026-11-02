# Revisión 214: carga y contraste fotográfico

## Corrección
StationScene.ready142 comparte una sola preparación pendiente entre el menú, el cambio de línea y la previa. La tarea queda registrada antes de empezar para admitir llamadas reentrantes. Se conserva la compilación de shaders y la espera de activos; al terminar o fallar se permite otra preparación. La previa espera a que termine la carga antes de recolocar el escenario y evita seleccionar una línea que ya está activa.

El bloqueo anterior dejaba compileAsync consultando currentProgram de un material eliminado durante otra preparación simultánea. No se modificó Three.js ni se omitió la preparación gráfica.

## Verificación
- verificar_carga214: preparación concurrente/reentrante, espera real de finalización, nueva preparación y recuperación tras error.
- verificar_imports122: 190 módulos, sin URLs duplicadas.
- verificar_cargas197: los 39 archivos de estación cargan correctamente.
- verificar_referencias213: 39 perfiles/fotografías, geometría conservada y doce módulos protegidos de vías/movimiento sin cambios.
- Navegador WebGL: Gómez Farías L1-03 cargó; cambio desde el selector a Iztacalco L8-11 completado; vista a pie y fotografía desplegada en ambas. Sin errores de consola durante esta revisión.

## Observaciones visuales pendientes
Esta revisión no certifica una réplica exacta de las 39 estaciones. Gómez Farías presenta contraste excesivo entre losas y muros demasiado uniformes. Iztacalco conserva estructura violeta y andén central, pero el plafón y el patrón/escala del pavimento requieren refinamiento frente a la fotografía. No se cambian vías ni apoyos de vagones para corregir acabados.

Capturas locales fuera del repositorio: entregables/Revision_Gomez_Farias214.png y entregables/Revision_Iztacalco214.png. Rama revision/andenes-superficie-l1-l8; revisión pendiente, sin integrar en main.
