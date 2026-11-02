# Revisión 203 · personas y continuidad de movimiento

Las personas cercanas animan ahora sus esqueletos en cada dibujo entre las actualizaciones de trayectorias de la multitud. La posición y orientación de los peatones se suaviza sin cambiar sus coordenadas de colisión; el movimiento del tren se mantiene separado para que los ocupantes no se deslicen por retraso de suavizado. Se conserva el límite de 24 esqueletos próximos y las demás figuras instanciadas.

En las figuras simplificadas se conserva una malla más fina en la cabeza, tanto de pie como sentadas, sin aumentar el detalle de todo el cuerpo. Los materiales de piel mantienen sus texturas con reflejos más discretos y anisotropía. Se corrige el pelo de las pasajeras: sus capas nativas pasan a recorte alfa de doble cara y dejan de desaparecer por ordenación de transparencias y un umbral excesivo. No se sustituyen los personajes por modelos nuevos ni se promete fotorrealismo.

El dibujo del tren y las cámaras que lo siguen utiliza el resto del reloj fijo de física para reconstruir el movimiento entre pasos de 20 ms. Esta presentación se limita a ese intervalo y no rebasa la estación al aproximarse; las paradas, pausas y estados de sobrecarga conservan la posición calculada. Funciona con trazado recto y curvo y restaura las transformaciones lógicas después de dibujar, incluso ante un error del renderer. No cambia velocidad, demanda, separación, física ni resultados de las prácticas.

El presupuesto gráfico compartido ajusta gradualmente la resolución ante intervalos lentos sostenidos, con un mínimo y recuperación cuando vuelve a haber margen. Ignora intervalos de segundo plano y respeta los perfiles elegidos. Depósito, exploración del tren, taller y recorrido ya lo utilizan; la vista de subestación también lo usa ahora en exploración y mantenimiento, eliminando el antiguo límite fijo de 30 Hz en exploración. Esto reduce saturación gráfica sin eliminar contenido ni alterar el tiempo de simulación. No supone FPS garantizados en una GPU concreta.

## Verificación

- `verificar_presentacion203.mjs`: avance uniforme entre muestras físicas, límites de estación/pausa, restauración de tren/carro/cámara al dibujar, trazado recto/curvo y adaptación/recuperación de resolución.
- `verificar_personas203.mjs`: personaje nativo con animación y posición continuas entre cálculos de multitud, colisiones sin mutación, pausa estable y pelo nativo de doble cara.
- `verificar_camaras203.cjs [baseURL]`: interfaz nativa en L1/L8, cámaras de seguimiento, persona en andén, interior, conducción y presupuesto común en subestación. Omite llamadas GL: no mide FPS de GPU.
- Se conservan las regresiones de multitud nativa con 632 figuras, embarque en tres modelos/ambos sentidos, conducción, controles de andén, cuatro misiones de taller, trece puertas y mantenimiento físico de ventilación.
- Renders de los personajes nativos revisados con Chromium/WebGL por software. Imports de ejecución únicos: 177 módulos.
