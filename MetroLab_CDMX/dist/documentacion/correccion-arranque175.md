# Corrección de arranque · 175

La integración 174 dejó incompleto el método `view(id)` de `window.workshopGame`. El navegador rechazaba por sintaxis el módulo `workshop.js`; no se emitía `workshop-ready`, y mantenimiento, conducción y seguimiento esperaban la inicialización del taller.

Se restaura el método completo conservando el despiece nuevo y los callbacks de carga actuales. La espera de controles del menú tiene ahora límite de 10 segundos con error recuperable. Se actualizan las URL de caché de los módulos afectados.

La verificación de importaciones ahora ejecuta también `node --check` sobre los 150 módulos del grafo de arranque, evitando que una prueba de rutas pase con un módulo que no puede interpretarse. Además se revisaron los 159 archivos JavaScript de dist sin errores de sintaxis.

Pruebas: revisión de sintaxis e importaciones; pruebas CPU/DOM de conducción y seis cámaras. Navegador: el menú de mantenimiento llega al manual y a su primera misión, en lugar de quedarse esperando `workshop-ready`. Este navegador tiene WebGL deshabilitado y muestra el error de disponibilidad 3D; no se afirma una ejecución gráfica completa en ese entorno.
