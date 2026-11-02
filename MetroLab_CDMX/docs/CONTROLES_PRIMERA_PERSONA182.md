# Mantenimiento en primera persona

En Subestación → Mantenimiento, pulsa **Entrar en primera persona**. El navegador solicita capturar el mouse únicamente tras ese clic. Mueve el mouse para orientar la vista sin mantener botones. Si no admite la captura, sigue disponible el arrastre con botón derecho.

- **WASD**: caminar con las colisiones existentes.
- **Shift**: paso rápido. **Ctrl**: agacharse mientras se mantiene. **C**: alternar postura.
- **E** o clic izquierdo: interactuar apuntando al equipo. En primera persona, E requiere una pieza del objetivo a un máximo de 2.5 unidades de la cámara.
- **Tab**: bolsa física. **1–9**: seleccionar herramienta. **Q**: guardarla.
- **J**: abrir/cerrar el plan, elegir una intervención y consultar todos sus pasos.
- **H**: ayuda. **Esc**: liberar cursor y cancelar la acción.

El panel ya no ocupa una columna permanente: se abre sobre la escena. El objetivo actual y la respuesta de la práctica se muestran en una tarjeta breve. El plan conserva el checklist y los controles de lectura/interpretación. Para arrastres precisos de piezas y herramientas también se conserva la interacción con cursor libre.

Comprobación automatizada: `node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_controles181.mjs`, además de imports, andén, mantenimiento de trenes y servidor. Las pruebas CPU/DOM no certifican el rendimiento gráfico en un navegador con GPU.

## Corrección de entrada y colisiones (183)

Al terminar la carga de la práctica se enfoca el canvas después de desbloquear la interfaz: WASD funciona sin hacer clic primero en otro botón. También puedes activar la captura del mouse con el primer clic sobre la escena; Esc conserva el modo de cursor libre para trabajar con precisión.

Las mallas grandes exportadas desde Blender pueden agrupar objetos separados. La colisión ahora usa cajas por triángulo en esas mallas y un índice espacial, para no convertir el espacio entre equipos en una pared. La posición inicial busca un lugar libre con espacio delante; se conservan colisiones con los equipos sólidos.

## Menú deslizable (184)

El botón **☰ Menú · J** despliega el plan desde la izquierda. Puedes desplazarte dentro del panel con la rueda y cerrarlo con **Ocultar menú ×** o **J**. La inspección y PAN se conservan dentro del plan. Al cerrar, el teclado vuelve a la escena y el panel deja de recibir foco y clics. En primera persona se ocultan las barras superiores; Esc recupera el cursor y la navegación.

La revisión 184 actualiza juntas las URLs de los módulos relacionados y la hoja de estilos del menú. Para verla en un Codespace existente, actualiza main con `git pull --ff-only origin main` y recarga el navegador. La web publicada por separado no se actualiza con ese comando.
