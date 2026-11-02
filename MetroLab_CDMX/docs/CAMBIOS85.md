# Mantenimiento · versión 85

El arrastre usa la matriz real de pantalla a SVG. Incluye zoom, tamaño adaptable y desplazamiento. La geometría tomada conserva su tamaño y el punto de agarre, ocultando el original durante el movimiento. Las puertas tienen sentidos de arrastre independientes. Las puntas dibujan su recorrido hasta el cursor. El giro inverso reduce el avance de la fijación. Las piezas del tablero 3D se desplazan sobre un plano de cámara conservando el punto de agarre; la colocación final valida el destino.

La mano anterior de guante dibujado se sustituyó por dos poses anatómicas con textura de piel, como recurso visual 2D superpuesto. No es un modelo de mano 3D articulado. La imagen adjunta se utilizó como referencia anatómica.

## Recurso visual

Archivo integrado: `/workspace/sites/metro-cdmx-simulador/dist/assets/repair-hands85.png`.
Generado con la herramienta integrada ImageGen, fondo transparente. Original generado: `/workspace/scratch/fc8783fbaffa/generated_images/exec-5b476b28-9ade-48ca-904f-c05a096547be.png`.

Prompt final:

> Create an ORIGINAL asset for a metro maintenance simulator: two isolated photorealistic anatomically natural adult right hands, viewed dorsally from above, using attached photo ONLY as anatomy reference. Transparent background. Horizontal image evenly split into two equal square cells: left cell an open relaxed five-finger hand, fingers pointing straight upward and wrist downward, all fingers complete; right cell same hand loosely gripping an invisible small tool, natural curled fingers and thumb, wrist downward. Center each hand in its cell with a generous transparent margin. Real skin pores, subtle knuckle creases, nails, smooth continuous wrist; soft diffused neutral light, no cast background shadow. No glove, no cut stump ellipse, no lettering or watermark, no scenery. This is a 2D sprite asset, both hands same scale and wrist length, independent silhouettes, do not overlap cell boundary.

## Verificación

Pruebas de eventos de mouse: cuatro actividades completas, puerta al 50 % con escalas 0.5, 1 y 2 y desplazamiento, hojas opuestas, giro reversible, conservación del agarre y destino de punta. Pruebas de Three.js: proyección del punto tomado coincide con el cursor en X e Y durante el arrastre. Pasaron además navegación, documentación, conducción de ambas líneas y nueve prácticas anteriores.

No se realizó comprobación visual interactiva en navegador en este entorno.
