# Revisión 210 · Distribución de pasajeros en islas de superficie

La captura del usuario muestra grupos apilados junto al tren y una vista aérea poco clara. Se comprobó un fallo concreto: resolver las colisiones de cada persona por separado podía enviar varias figuras a la misma esquina de una escalera o pilar. Las filas también se llenaban primero junto al borde, dejando sin usar el resto del ancho.

## Cambios

- Las cinco estaciones con islas reparten las filas en profundidad desde las primeras llegadas y usan pequeños desplazamientos deterministas para evitar filas perfectamente alineadas.
- La colocación reserva espacio entre personas, conserva la zona reservada y evita escaleras, pilares y los límites de cada isla. No reduce el conteo del motor, ni elimina figuras, ni modifica los recorridos de embarque o pasajeros dentro del tren.
- El selector abre ahora un encuadre cercano «Detalle de andenes». Conserva la vista general, planta, caminar y cambiar de andén. La vista general es más lateral para apreciar la separación transversal.
- Sin cambios en modelos de tren, texturas, iluminación, física ni limitador de 60 FPS. Sin modificaciones de subestación ni integración en main.

## Verificación

`verificar_afluencia210.mjs`: 900 figuras por estación en Coyuya, Iztacalco, Apatlaco, Aculco y Constitución de 1917, en tres fases de movimiento. Comprueba distancias mínimas entre figuras, cuerpos dentro de su isla, ausencia de penetración en escaleras/pilares y conservación del número de figuras. Incluido en `verificar_colaboracion.mjs`.

La inspección visual local se realizó en Constitución de 1917. El usuario confirmó que la captura corresponde probablemente a Constitución de 1917, en cámara libre. La revisión se concentra en esa escena y comprueba también el comportamiento común de las otras cuatro islas.
