# Revisión 216: controles prácticos y corte de alimentación recuperado

## Cambios

- Mantenimiento de trenes y subestación: C alterna agachado/de pie; no requiere mantener una tecla. Los controladores y atajos de herramientas rechazan combinaciones Ctrl; ya no interpretan Ctrl como postura. Se actualizan briefing, ayuda, bolsa, avisos de alcance y guía de tareas. WASD, E/F, Tab, Q, J y números mantienen sus funciones. La navegación de pasajeros en andén conserva su comportamiento anterior.
- Conducción con manos: la lista de seis mandos se muestra por defecto con nombre, número y explicación. Puede ocultarse con Lista de mandos. Usa los mismos eventos de alcance de la mano y acciones reales del pupitre; no añade acciones paralelas. Se elige esta alternativa solicitada en lugar de inclinar el pupitre físico y alterar sus puntos de contacto. En ventanas estrechas se distribuye en tres columnas y dos filas.
- Explorar flota: botón visible Corte de alimentación · vía al motor junto a Centrar vista. Recupera energy-section160 y energy-assets162 de la entrega local existente, adaptando imports, caché y selector al modelo actual del taller. Incluye NM-22, NM-79 y MP-82, corte frontal/transversal, despiece, conjuntos seleccionables, barra lateral y comparación de captación aérea. Usa triángulos de coches/bogies/captadores y vías existentes. La adaptación aérea es didáctica; no atribuye rodadura férrea a estos trenes neumáticos.
- Se conservan detalle de materiales al clonar, calidad gráfica, límite de 60 FPS y renderizado del corte solo cuando cambia la vista. Sin cambios a vías de servicio, cinemática de vagones ni pasajeros. No se incluye el trabajo pendiente de ventilación en otro checkout.

## Comprobaciones

Suite scripts/verificar_colaboracion.mjs completa pasada. Incluye 192 módulos con URL única, privacidad, seis prácticas de subestación, cuatro misiones de tren, conducción de tres modelos, contención/apoyos en curvas y geometría de estaciones.

Prueba nueva verificar_alimentacion216.mjs: seis combinaciones de modelo/captación, activos reales de tren y vía, activación/desactivación del corte y tres ciclos de despiece/ensamblaje sin perder transformaciones. Se actualizan las pruebas de teclado para C y se comprueba que Ctrl+W no active movimiento ni postura. Las pruebas de pupitre verifican lista visible, explicación de cada botón, ocultar/mostrar y actuación real de la emergencia.

QA WebGL local: acceso desde flota al corte, geometría y controles del visor; conducción con lista visible; briefing con C y cambio de postura en misión. Las pruebas CPU no son mediciones de FPS GPU.

Rama revision/controles-y-corte-alimentacion, preparada para revisar antes de integrar en main.
