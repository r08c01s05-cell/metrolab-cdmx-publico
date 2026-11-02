# MetroLab · versión 87

Portada gráfica independiente de cualquier estación o taller: tipografía de juego, emblema, órbitas, fondo animado y menú de cuatro experiencias. Los modelos del taller se cargan al abrir Explorar, no como fondo de portada.

En el taller, cada nombre se proyecta bajo la cabecera y sigue la cámara. El cursor y las tarjetas resaltan el convoy con emisión azul. Los materiales del taller se clonan; el resaltado no cambia el modelo original del visor.

La selección abre una pantalla de carga. La geometría anterior queda oculta y el visor se muestra al terminar la carga real. Los errores permiten reintentar y la cancelación evita que una carga antigua reabra el modelo. La escena del visor contiene solo el coche seleccionado; el entorno de taller queda oculto. El nombre y la línea aparecen bajo el visor. Los cambios de modelo desde la barra lateral usan la misma pantalla de carga.

## Cuatro bancos 3D manipulables

- Puertas: aislar, arrastrar la obstrucción a la bandeja, energizar y desplazar ambas hojas hasta completar apertura/cierre.
- Ventilación: girar tornillos, retirar tapa, conectar el enchufe al puerto, volver a cerrar y fijar, energizar y ensayar. El rotor gira al completar el ensayo y la cubierta se atenúa para observarlo.
- Rodadura: aislar, bloquear apoyo, retirar rueda, colocar repuesto, fijar y girar una vuelta. Se corrigió la selección desde el centro y se añadió una marca de giro visible.
- Electricidad: verificar 0 V, abrir, comprobar F1, sustituir, cerrar y verificar 24 V. La lámpara muestra el resultado. Se separó la tapa retirada del repuesto para que no lo tape.

Los bancos son geometría didáctica propia; no representan una intervención completa certificada sobre mecanismos reales. La mano sigue siendo una imagen superpuesta. El esquema anterior queda disponible como alternativa, incluida la falta de WebGL.

## Verificación

Se completaron las cuatro reparaciones por rayos de selección sobre geometría real, movimientos de mouse, rotación y callbacks reales de la interfaz. También pasaron la alternativa esquemática, el flujo del menú, carga/fallo/cancelación, resaltado/restauración, proyección de nombres, formación de nueve coches, navegación, nueve prácticas anteriores, documentación y conducción de ambas líneas.

No se verificó el render final en navegador. Las pruebas de selección 3D no renderizan WebGL y las de modelos usan decodificación de imágenes simulada en Node.
