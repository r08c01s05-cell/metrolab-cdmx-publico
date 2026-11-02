# v136 · Cierre de gabinetes y taller de subestación

## Modelo Blender

Se parte de `subestacion_rectificadora134.blend`. Las siete envolventes ahora tienen chapas laterales, base y techo continuos con frente a Z=0.90 y fondo Z=2.45 (metros del modelo ilustrativo). Las puertas conservan las bisagras, se ajustan en altura a cada gabinete y cierran con holgura respecto al zócalo. Se retira el reactor de su posición saliente y se coloca dentro de la envolvente. No se recortan ni ocultan componentes al cerrar.

Las placas de identificación, los medidores CD y la pantalla SCADA son solidarios a las hojas. Tiradores y ranuras se sitúan en la cara exterior. Las puertas se exportan abiertas a 105° para que el controlador conserve el extremo abierto; el `.blend` se guarda cerrado. El recorrido completo de barrido no está certificado contra colisiones entre hojas de gabinetes vecinos.

También se corrige el banco Blender de ventilación: la bandeja y sus soportes tienen el ancho y la altura necesarios para recibir el filtro retirado en su posición de reposo.

Archivos editables y GLB sin comprimir: `assets-source/subestaciones136/`. Los GLB comprimidos que se cargan en web están en `dist/models/subestaciones136/`. Regeneración: `scripts/build-substation136.py` con Blender Python 4.3 (`bpy==4.3.0`, Python 3.11, NumPy < 2). Las dimensiones son de la representación didáctica; no son un levantamiento de una instalación del Metro.

## Interfaz e interacción

Se retira el rótulo decorativo del fondo del taller general y del taller de subestación. Se conservan las identificaciones de instrumentos y piezas.

En el modo de mantenimiento de subestación, el objetivo está en una columna lateral y las herramientas en una banda inferior fuera del lienzo 3D, con la paleta azul y latón del taller general. Misiones, manual y acciones alternativas siguen disponibles en paneles desplegables. Las etiquetas sobre el escenario son contextuales y temporales.

- Clic sobre la pieza válida: inspeccionar, medir o conectar.
- Fijaciones: mantener pulsado, girar alrededor de su centro o realizar cuatro clics breves. La liberación por sí sola no completa un trabajo parcial.
- Cepillo: arrastrar sobre el filtro o usar clics alternativos; la misión conserva su cuenta de pasadas.
- Filtro: arrastrar hasta el contorno del destino y soltar. Un abandono fuera del destino no avanza el paso.
- Botón derecho o central: PAN; rueda: zoom. La rotación queda deshabilitada durante el mantenimiento y se restaura al explorar.
- E: acción del objetivo con la herramienta seleccionada; F: enfoque; 1–8: herramientas disponibles; Esc: soltar/cancelar, sin cerrar accidentalmente el apartado.
- La herramienta automática se puede desactivar. Los botones de piezas son una alternativa al gesto.

Se restauran el puntero y la cámara al cancelar, cambiar de misión, perder el foco o salir. El progreso parcial de una fijación se conserva entre clics, y se limpia al reiniciar la misión.

## Verificación

`verificar_juego136.mjs`: UI real con DOM de prueba, traslado de botones activos, cuatro clics / mantener / no duplicar al soltar, E/F/1–8/Esc, arrastre del filtro mediante rayo y plano, entrega/cancelación, seis misiones sobre bancos GLB, restauración de controles, siete envolventes y 551 mallas interiores por detrás de las hojas cerradas; pantallas unidas a puertas y retirada del rótulo.

Regresiones: seis prácticas mediante callbacks de botones (`verificar_interaccion_sr128`), bancos de servicio y cuatro fijaciones (`verificar_subestacion134`), cámaras (`verificar_vistas134`), guante real (`verificar_mano_sr134`), cuatro actividades del taller general (`verificar_mantenimiento125`) y grafo de imports (`verificar_imports122`). Revisiones de render de gabinetes abiertos y cerrados en Blender/Cycles.

No hay control-browser disponible: la interfaz y los FPS no se han verificado en un navegador con WebGL. Los renders de Blender revisan el modelo nativo, no son capturas del simulador web.

El paquete web omite las dos copias GLB sustituidas (SR127 y ventilación134) para mantenerse dentro del límite de publicación. Sus originales editables permanecen en assets-source. El verificador de GLB y la referencia del inventario apuntan al modelo136.
