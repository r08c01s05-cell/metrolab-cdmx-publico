# Revisión 197

- Antes de conducir o de observar la red se elige Línea 1 o Línea 8. Se puede pulsar el botón o la tecla 1/8; Volver cancela sin cargar un recorrido. La selección carga un tren compatible con la línea.
- El taller permite elegir cualquiera de sus cuatro misiones, sin una secuencia obligatoria. Al cambiar se reinicia la práctica y se recoloca la bolsa en el suelo del nuevo puesto. Al completar se vuelve a elegir misión.
- Las opciones de diagnóstico de ventilación responden a sus números sin liberar el mouse. La bolsa también muestra números para elegir herramientas mientras está abierta; no sustituye los controles normales cuando está cerrada.
- Corregida la carga de Garibaldi: su URL ya acababa en .gz y se le estaba agregando otra extensión .gz. Se comprueban los 39 archivos reales de estaciones con sus rutas de datos.json.
- La geometría original del frente del tren se restaura después de cada pase de render de cabina. La lista de superficies se conserva en caché para evitar recorrer el tren cada fotograma.
- Rótulo genérico «INSTRUMENTO DIDÁCTICO» sobre el instrumento; se retiran las letras originales que estaban modeladas en su geometría. Ajuste del ángulo del agarre lateral, conservando el límite de alcance de los brazos y la animación de medición.
- Versiones de módulos y estilos sincronizadas a 197 para los archivos afectados.

## Verificación

Pruebas CPU/DOM: imports, 39 estaciones comprimidas, práctica física completa de ventilación con respuesta por teclado, 175 acciones proyectadas de las cuatro misiones de tren, conducción de los tres modelos y controles.

Prueba de navegador: `METROLAB_PLAYWRIGHT_PATH=/ruta/a/playwright node scripts/verificar_misiones197.cjs http://127.0.0.1:8100/`. Usa Chromium y omite las llamadas de dibujo para comprobar la navegación y las cargas, sin medir FPS ni afirmar calidad gráfica en el equipo del alumno.

Los cambios se entregan mediante Git. Esta revisión no puede iniciar por sí sola el servidor de un Codespace ajeno detenido; el servicio de sincronización previamente instalado necesita estar en ejecución.
