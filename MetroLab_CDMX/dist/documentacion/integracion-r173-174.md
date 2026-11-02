# Integración selectiva R173 → desarrollo 174

Se comparó MetroLab_Proyecto_Completo_Desarrollo_R173.zip con la versión publicada 157. Son ramas diferentes: no se reemplazó el proyecto entero.

## Integrado
- Unifilar CAD editable, cédulas de 14 circuitos y cálculos educativos de conductores, caída de tensión y protección. Exportadores PDF, SVG, DXF, CSV y JSON del R173; datos supuestos identificados y editables. Acceso desde Fuentes/documentación y desde la subestación.
- Referencia NOM-001-SEDE-2012 local, almacenada sin pérdida con gzip. No se declara conformidad ni se sustituyen placas verificadas o un proyecto eléctrico.
- Reloj de simulación fijo de 20 ms, con límite de recuperación, pausa por sobrecarga y un máximo de 60 FPS. Se conserva la calidad seleccionada y la velocidad 1×/2×/5×.
- Exhibición circular, etiquetas ancladas y despiece progresivo reversible, conservando triángulos, normales y coordenadas UV.
- Colisiones con pilares y muros del andén; las trayectorias de embarque conservan su control existente. Acabados de suelo con relieve sutil conservando mapas y paletas originales.
- Separación de asientos NM79 respecto a pared y piso, moviendo las estructuras completas y ajustando los puntos de asiento de pasajeros. Ajuste lateral de 26.75 mm y vertical de 33.43 mm en los dos modelos actuales.
- Carteles interiores con impresión mate, recorrido de Línea 1 a mayor resolución y mapa original conservado sin estiramiento.

## Conservado de la versión actual
Los seis trenes GLB, personajes, cabinas, guantes, bolsa física, actividades montadas y su picking. Se descartaron sustituciones antiguas de R173 que eliminaban texturas o volvían opaco el cristal de cabina. Se preservan la afluencia y sus fuentes; el JSON mensual solo se comprime sin pérdida y su cargador se adapta.

## Pendiente o no incorporado
No se incorporó el descargador completo sin conexión de la rama R173, que reportaba una descarga incompleta. Tampoco se sustituyeron binarios actuales por modelos más antiguos ni se importaron acabados que borraban normal maps y rugosidad. No se asegura equivalencia de medidas reales sin documentación verificable.

## Verificación
- Importaciones: 150 módulos con URL de caché coherente.
- Temporización a 15/30/60/144 FPS y límite de 60 FPS a 60–240 Hz.
- Cálculos y generación de CSV/PDF/SVG; 14 circuitos y controles de datos incompletos.
- Seis GLB actuales idénticos a la base: ningún triángulo perdido; tres ciclos de despiece y ensamblado por modelo; seis trenes verificados.
- Ajustes NM79 idempotentes, puntos de asiento corregidos, obstáculos de andén y afluencia mensual idéntica byte por byte tras descompresión.
- Pruebas CPU/DOM de conducción, cámaras y mantenimiento: cuatro misiones montadas con 175 acciones de puntero; bolsa, guante y seis herramientas conservados.
- Navegador: edición de corriente de 8 a 16 A actualizó cédula y unifilar. No se pudo comprobar la descarga desde el navegador por tiempo de espera del evento de descarga; la generación de archivos se verificó en CPU.
- Limitación visual: WebGL está deshabilitado en el navegador de pruebas. No se afirma una inspección visual 3D de esta entrega; geometría e interacción se verificaron sin renderizado.
