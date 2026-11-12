# Relevo técnico · revisión 181

## Objetivo
Simulador Metro CDMX L1/L8, trenes NM-22/NM-79/MP-82, taller/inspección, conducción, seguimiento, mantenimiento de trenes y subestación. El usuario busca experiencia de videojuego, modelos/materiales realistas y controles fluidos sin carteles que tapen la vista.

## Último cambio completado
WASD caminar; arrastre con botón derecho orientar; Shift paso rápido; Ctrl agacharse mientras se mantiene; C alternativo; E interactuar; F enfocar; Tab bolsa física; Q guardar herramienta; números seleccionar herramientas preparadas; H ayuda; Esc cancelar. Cruceta oculta en escritorio, recuperable desde ayuda. No reconstruir esto desde cero.

## Módulos clave
- game-keys181.js/css: bindings compartidos y ayuda contextual.
- walk176.js: locomoción de mantenimiento y colisiones de mallas.
- platform-person178.js + person-navigation180.js: observador a altura humana y colisión con pasajeros.
- tool-bag156.js: preparación física, bolsa de suelo y selección de herramientas.
- instrument-placement180.js: colocación manual de instrumento sobre superficie y toma/colocación de puntas; cancelación restaura transformaciones.
- substation-play136.js, substation-maintenance128.js: misiones de subestación.
- maintenance-checklist179.js: checklist basado en estado real, sin botones de completar ficticios.
- station-scene.js: estaciones/pasajeros/cámaras.
- passenger-realism180.js: adultos femeninos Kamala y refinamiento de geometría infantil existente, conserva rig/animaciones.
- cockpit149.js, cab-finish180.js: cabina, brazos y etiquetas.
- home180.js + experience180.css: portada actual de cinco modos. home114.js es histórico y no es la portada montada.

## Comportamientos que preservar
Mantenimiento sobre piezas montadas en tren/tablero. Guantes puestos, no inventario como herramienta. Bolsa ya instalada en suelo; instrumentos no precolocados sobre tablero. Personas no atraviesan modelos. Andén fijo sin cortes; seguir tren activa cortes. Cámara Persona en andén se mantiene en estación. Cierre de puertas con advertencia de 5 segundos. Anuncio de próxima estación una vez durante aproximación.

## Verificaciones de la base
Requieren Node.js moderno (se usa loader propio, sin instalación de paquetes):

```sh
node scripts/verificar_imports122.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_controles181.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_anden181.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_tren_montado156.mjs
node --experimental-loader ./scripts/test-loader.mjs scripts/verificar_conduccion177.mjs
```
La base pasó estos checks: 165 módulos, 6 misiones de subestación/155 acciones proyectadas, 4 misiones de tren/175 acciones y 3 modelos de conducción. Son pruebas CPU/DOM/geometría; falta validar visualmente escenas 3D con GPU en la máquina de destino. No ejecutar todas las pruebas históricas indiscriminadamente: varias corresponden a revisiones anteriores.

## Limitaciones conocidas
No se garantiza fotorrealismo. El entorno anterior no tenía WebGL para QA visual; hay que revisar en navegador local con GPU. Los scripts Blender y fuentes son históricos: inspeccionar rutas y versiones antes de exportar. No todos los adjuntos originales están disponibles; usar solo inventario y referencias reales. No se ha auditado aquí cada plano/afluencia contra una fuente externa actual. El proyecto contiene muchas revisiones heredadas; optimizar con medición y sin borrar recursos por intuición.

Web publicada de referencia: https://metro-cdmx-simulador.santiagogonzal331575.chatgpt.site/

## Actualización 197
Selector L1/L8 previo a conducción/observación (teclas 1/8), misiones independientes con recolocación de bolsa, respuestas y bolsa por números. Garibaldi ya trae .gz: normalizar antes de añadir la extensión. Cabina restaura el frente tras cada pase con caché de superficies. Véase docs/revision197.md y scripts/verificar_misiones197.cjs.

## Actualización 198
MP82_cabina.glb.gz tenía ausente el cierre exterior de la cabina (+X). Se añade el frente al GLB conservando todos los datos previos. No invertir la carrocería: el otro extremo es el testero. Script reproducible reparar_frente198.py; prueba verificar_frente198.mjs; carga/cache 198. Véase docs/revision198.md.

## Actualización 201
Documentos y fuentes restringido al catálogo gubernamental public-sources201.js. No restaurar manuales, planos, láminas, adjuntos ni OCR: se retiraron 542 archivos de dist/docs, dist/tecnica y el archivo documental. El resguardo local está fuera del repositorio y del servidor. Las otras ramas y el historial conservan versiones anteriores; no reescribir historial sin coordinar con los colaboradores. Los lectores históricos ya no cargan esos documentos. La selección de equipos de subestación no dibuja contorno. Ayuda de mantenimiento tras cinco segundos sin acción/progreso, en idle-guide201.js, con teclas y acciones del estado actual. Se oculta al actuar, pausar, abrir plan/bolsa o salir. Sin cambios al render ni a física.

## Integración compartida 204
Recuperadas las mejoras locales 199–203 conservando Biblioteca/portal/HTML original, menú de siete opciones, catálogo gubernamental, retirada documental y ayuda por inactividad. Taller con WorkshopPlay199, puertas manipulables, bolsa acostada y agarres; conexiones/acabados e interior de ventilación; nuevo frente MP82; TrainBoarding200 permite subir, caminar y bajar; personas y Presentation203 con resolución adaptativa. Subestación mantiene contorno oculto. Cache de módulos afectados y modelos 204. Ver docs/revision204.md. Las notas locales 199/201 se renombran para conservar las notas compartidas. verificar_colaboracion añade las regresiones nuevas; pruebas navegador biblioteca204/camaras203/taller199.

## Realismo 205
Surface-detail205 añade acabado multiescala sobre los mapas originales: ocho texturas compartidas de 256 px, 2 MiB antes de mipmaps, UV3 independiente, una muestra de shader omitida en Rendimiento. No aplicar a rostros, letreros ni vidrio; vidrio físico sin transmisión extra. Las clonaciones de materiales deben usar inheritSurfaceDetail205 para conservar callbacks (Material.clone no los copia). Normales de terrazo/podotáctil independientes del albedo; preservan normales originales. Depot-detail205 añade siete lotes instanciados de fijaciones/juntas/canalizaciones/carcasa de luces, sin raycast ni nuevas colisiones, también en el taller. Sombras de inspección 2048 Cinemático/1024 Equilibrado. Cache de módulos afectados 205; modelos siguen en 204. Ver docs/revision205.md y verificar_realismo205.mjs/verificar_render205.cjs. Mantener límite de esqueletos, resolución adaptativa y todos los modos existentes.

## Controles y agarres 206
Taller permite E/F mientras Ctrl pertenece al controlador de postura; pasarela z mínimo .40 y agachado profundo .84 en la retirada de obstrucción, alcance sin ampliar. Guía por superficie real y Ctrl/W/E explícitos. Palanca sigue el pivote, dedos/pulgar opuestos, sin aplastar guante, mando .11 local más cerca. Material-grip206 usa asa/bordes/aro/pinza y centra piezas grandes; InteractionHand117 acepta perfil de contacto/opción de orientación, también en filtro de subestación. Aviso_cierre206.wav contiene cinco segundos de tono grabado audible (extracto previo tenía ambiente al inicio/final), manifiesto 206; mensaje hablado sin cambios. Ver revision206.md y verificar_audio206/palanca206; conducción177/taller199/transporte188 amplían regresiones reales. Sigue pendiente rediseñar refrigeración conforme al grupo ventilador/cámara compartida documentado, no afirmar que ese modelo ya está corregido.

## Previa 208 de Coyuya
Rama revision/coyuya-anden-central, pendiente de revisión del usuario; no integrar a main. Solo L8-10 usa isla central procedural, nuevos bordes/vías, puertas hacia la isla, población y cámara con límites centrales. Entrada ?previa=coyuya o botón del menú. Ver docs/revision208.md. Preservar los otros modelos y el trabajo de subestación que permanece en otro checkout.

## Ampliación 209 de andenes aprobada
El 31 de octubre el usuario aprobó Coyuya y pidió extender a las estaciones correspondientes. Rama revision/andenes-superficie-l1-l8. Coyuya/Iztacalco/Apatlaco/Aculco usan isla única; Constitución dos islas y tres vías, con vía central visual sin servicio automático. Observatorio conserva laterales del GLB y corrige franjas verdes heredadas a rosa. Selector local de seis estaciones, circulación opcional y cambio de andén. Las medidas y accesos son aproximados. Véase docs/revision209.md. La nota 208 de no ampliar ya fue superada por esta autorización. No mezclar el trabajo pendiente de ventilación de subestación del checkout original.

## Corrección 210 de afluencia en islas
Rama revision/andenes-superficie-l1-l8: reserva de espacio para evitar apilar pasajeros al resolver escaleras/pilares; reparto en profundidad y encuadre Detalle de andenes. Conteos y flujos de embarque conservados. Ver docs/revision210.md y verificar_afluencia210.mjs. El usuario identificó la captura como probablemente Constitución de 1917 en cámara libre. Sin integrar a main.

## Corrección 211 de pasajeros en curva
La nueva captura corresponde a ocupantes que se separan del carro, no a esperas en andén. passenger-car211 transforma figuras detalladas, instancias lejanas y apoyos con la misma referencia rígida de cada carro y sincroniza el avance visual. cabinPlacement conserva carAnchor211, también tras el embarque; no eliminarlo. Cámaras de interior/alumno usan la misma referencia. Ver docs/revision211.md y verificar_pasajeros_curva211.mjs (24 casos, ambos sentidos, tres modelos). Suite completa pasada; revisión visual de salida de Constitución. Rama revision/andenes-superficie-l1-l8, sin integrar en main.

## Corrección 212 de apoyo sobre vías
car-support212 sustituye la tangente central por dos apoyos de bogie a distancia rígida. Carrocería, viajeros y cámaras comparten esa referencia; los bogies articulan en su tangente local. bogie-batching212 conserva los triángulos/materiales/UV y agrupa dos bogies durante batchTrainStatics opcional; no modificar los GLB fuente. Distancias derivadas de modelos (.965 × 5.7 m NM22/NM79; .965 × 5.35 m MP82), no cotas certificadas. Ver docs/revision212.md y verificar_apoyos212.mjs; conserva la regresión de pasajeros211. Rama revision/andenes-superficie-l1-l8, sin integrar en main.

## Acabados fotográficos 213
Perfiles de las 39 estaciones en station-reference213; station-finish213 aplica materiales/UV sin cambiar vías, plataformas o escaleras y conserva arte original. Superficies: perfiles/muretes y malla romboidal; Constitución soportes blancos. Pavimentos/plafones de caras visibles, rebote hemisférico solo en estación. El visor ofrece las 39 estaciones y fotografía local. scripts/protegidos213.json protege doce módulos de movimiento respecto a f0587b3. Ver docs/revision213.md: contraste visual confirmado en Doctores; L1/superficies pendientes de QA WebGL por navegador sin respuesta, sin afirmar réplica integral. Primera suite completa pasó; repetición posterior agotó memoria en embarque sin fallo de aserción, se retomó con semiespacio Node de 2 MiB y todos los controles restantes pasaron; validación final completada por bloques. Rama revision/andenes-superficie-l1-l8, sin integrar en main.

## Revisión 214 de carga y comparación
ready142 comparte preparación pendiente para evitar compilaciones simultáneas con materiales eliminados. La previa espera el fin de la carga y evita reseleccionar la línea activa. Pruebas carga214/imports122/cargas197/referencias213 pasadas. QA WebGL de Gómez Farías y cambio a Iztacalco completado, sin errores de consola. Pendiente afinar contraste/patrón del pavimento, detalle de muros L1 y plafón de Iztacalco; no afirmar fidelidad completa. Ver docs/revision214.md. Misma rama de revisión, sin integrar en main.

## Acabados extendidos 215
Pisos de contraste moderado, losas L1 de escala visual .60 x .30 m, variación determinista sin damero y geometría de incrustaciones conservada en pavimentos de superficie. Veta pétrea reforzada; cubiertas superficiales con juntas lineales, Aculco cálido. Veinticinco mapas compartidos de 512 px, sin nuevas luces/objetos. Calidad y límite de 60 FPS intactos. Imports122/referencias213/carga214 pasados; QA WebGL Gómez Farías, Pino Suárez y Aculco. Las 39 estaciones usan los perfiles actualizados, pero no se declara fidelidad exacta ni QA GPU individual. Ver docs/revision215.md. Misma rama de revisión, main intacto.

## Controles y alimentación 216
C alterna agachado/de pie en mantenimiento de tren/subestación; se elimina Ctrl de esos controladores y guías. Lista de mandos de conducción visible por defecto, seis explicaciones y acciones nativas; ocultable. Botón Corte de alimentación junto a Centrar vista en explorar flota, con visor detallado recuperado de entrega local: energy-section160/energy-assets162 y energy216.css; no requiere nuevos GLB. Comparación aérea didáctica sin atribuir tecnología al modelo. Suite compartida completa pasada, incluido alimentacion216; QA WebGL de corte, cabina/lista y briefing/postura C. Ver docs/revision216.md. Rama revision/controles-y-corte-alimentacion, main todavía no actualizado con esta revisión.

## Ensayos visuales de fallos 217
Nuevo catálogo público de ocho escenarios, cuatro de tren y cuatro de subestación, en fault-catalog217.js; evidencias, inferencias, referencias primarias y datos pendientes separados. fault-lab217 ofrece contexto 3D, gráficas normalizadas, secuencia de 16 s, pausa/reinicio/avance; no mantenimiento ni inyección en el motor operativo. fault-model217 reutiliza geometrías en lectura, clona materiales y libera recursos propios al cerrar. Acceso en explorar flota y apartados de subestación. Biblioteca gubernamental y documentos retirados intactos. Tests fallos217/imports122 (195 módulos) pasados; regresión completada por bloques tras OOM de embarque209 acumulativo, sin cambiar aserciones. Ver docs/investigacion-fallos217.md. Rama revision/ensayos-visuales-fallos basada en la 216 pendiente (PR #4), sin integrar aún en main.


## Consecuencias animadas 218
Se amplía el laboratorio217 en revision/ensayos-visuales-fallos. fault-outcomes218 integra posiciones/giros desde avance absoluto, sin acumulación por fotograma; fault-animation218 articula hojas completas, aros/tornillos y marcas testigo de ruedas del clon, añade vía fija de observación y humo suave hipotético. Detalle funcional animado para ventiladores, contactos, batería y compresor; no girar conjuntos eléctricos batidos ni cambiar vías/física del juego. Variantes explícitas: protección térmica que no actúa (daño potencial, no explosión automática) y baja adherencia + bloqueo de ruedas (deslizamiento adicional supuesto). Gráficas y explicaciones coherentes con variantes. Calidad y límite60 conservados. Tests animaciones218/fallos217/imports122 pasados, 197 módulos. Véase docs/revision218.md; pendiente revisión del usuario, mismo PR5 y dependencia PR4, sin integrar en main.

## Fluidez 222
Rama mejora/fluidez-general. cloneCharacter comparte un Skeleton entre las pieles de un mismo personaje con huesos e inversas idénticos (nunca entre personajes): 347→25 actualizaciones/subidas de huesos por cuadro en andén. Vidrio de puertas/testero del tren con forceSinglePass (placas delgadas, opacidad ≤.18). RenderBudget101 añade espera creciente (6–48 s) antes de volver a subir la resolución tras una bajada, para no reasignar el lienzo cada 2 s. Se integran los niveles 221 de pasajeros lejanos (34/78 m) y subidas parciales de instancias/contactos que estaban sin publicar. platform-collision169 protegido: no se tocó. Caché 222 con scripts/sync-runtime222.py. Prueba verificar_fluidez222 en la suite. Medición CPU en SwiftShader sin dibujo, no GPU. Ver docs/revision222.md.


## Flujo de energía 249
Rama revision/flujo-energia-via-captadores. Botón de flujo en recorrido: mapa curvo y offset de vías, captación aproximada de carros motrices, convertidor/carga y retorno, lectura del modelo eléctrico245. Inyección didáctica en estación próxima, no subestaciones/seccionamiento reales. No modifica física ni mapas. Corte de alimentación añade enlace CC y seis posiciones IGBT Q1–Q6 para VVVF comparativo; separables y seleccionables. 10 000 A del tablero es suma indicativa supuesta de motores, no máximo documentado de captación. Fuentes/pendientes y verificación en docs/revision249.md. No trasladar ese valor como dato de placa ni atribuir esquema genérico a cada coche.

## Circuito continuo y pausa250
Misma rama revision/flujo-energia-via-captadores / PR3. Barras completas por ambas vías, SR didácticas independientes de SAF (distribución supuesta cada dos estaciones), derivaciones cortas, pulsos discretos con buffers estáticos y búsqueda binaria. No cálculo de red/seccionamientos. Electrónica comparativa a escala uniforme0,5. Análisis pausa sin modal ni ocultar gráficas; muestreo por engine.time evita integrar consumo durante la pausa. Presentación80 revisada como referencia conceptual, sin copiar símbolos no verificados. Ver docs/revision250.md y prueba energia250.

## Captación bilateral251
SR ilustrativas trasladadas a puntos medios de interestaciones (no ubicaciones reales verificadas). No convertir SAF en rectificadoras. Doce pares de derivaciones para seis motrices, ambos lados y sentidos; ocho barras completas por ambas vías. Corte neumático también bilateral. No duplicar corriente ni atribuir reparto real. Ver docs/revision251.md.

## Posición SR252
Fuente didáctica co-ubicada por cada local real de la maqueta (substations94), anclaje x/z/lado e ID del edificio. Se retira z=13 y distribución independiente. Alimentador desde fachada, gabinete interior, rótulo encima; conservar ambos lados de captación. No cambia clasificación SAF ni certifica función real. Ver revision252.

## Último coche253
Trazos de vía prolongados90 m en terminales y distribución auxiliar esquemática hasta los nueve coches. Anclajes locales por caja; ambos sentidos. Captación motriz y consumos intactos. Ver revision253.

## Intervalos254
Locales L1/L8 distribuidos uniformemente en cada interestación (huecos incluyendo extremos), conservando cantidad/ID/lado/tipo. SR252 los siguen. Posición ilustrativa solicitada, no topografía real. Ver revision254 y verificar_intervalos254.

## Integración255
A petición del usuario, combinar249–254 con main be19ec9 mediante PR3. Conservados mandos de carga, detalles/puertas y flujo eléctrico de subestación nuevos en main. Dos modos de flujo de recorrido mutuamente excluyentes. URLs255. Ver docs/integracion255.md.

## Red y protecciones256
Rama mejora/red-subestacion256. grid-substation256.js: panel «Red y protecciones» en la SR (230 kV SF6 Metro-Energía, FP, anillo 15 kV supuesto, densímetros SF6 3D en celdas MT con fuga, 50/51 IEC, térmico del transformador, pérdidas de diodos). Anclas de densímetros se registran antes del batching (rectifier-assets127). SVG con estilos en línea por el estilo global del CAD171. Ver docs/revision256.md.

## Dinámica y frenado257
Rama mejora/dinamica257. train-dynamics257.js añade pestaña «Dinámica y frenado» al ElectricDashboard245 (esfuerzo-velocidad, resistencia + pendiente, adherencia seca/mojada, freno combinado, energía a barra hasta 900 V EN 50163 o a resistencias, distancia de detención y curva ATP). Lee estado, no toca engine.js. Ver docs/revision257.md.

## Sistemas a bordo258
Rama mejora/a-bordo258. onboard258.js: botón «Sistemas a bordo» en seguimiento con cadena de potencia (VVVF/chopper, convertidor estático), TCMS y freno de urgencia (OR), puertas (AND) y bloque fijo/móvil con distancia real al tren de adelante. Tensiones auxiliares de la presentación marcadas sin fuente. Ver docs/revision258.md.

## Rendimiento y acabado259
Rama mejora/visual-rendimiento259. train-lod259.js (LOD por carro con capas, volúmenes lejanos), passenger-budget259.js (tope de GLB detallados por calidad), weathering259.js (desgaste procedural en mundo: túnel, vía, pisos, muros; barrido cada 90 cuadros desde StationScene.animate). Ver docs/revision259.md.

## Rendimiento260 y guardar instrumento
Rama mejora/rendimiento260. frame-budget260.js (congelar matrices de infraestructura, intervalo de multitud, costado lejano), 4 niveles de pasajeros instanciados, roster260 en caché. Guardar instrumento: ToolBag156.putAway176 + InstrumentPlacement180.store260 + storeInstrument238 con instrumento apoyado. Ver docs/revision260.md.

## S.R. real261
Rama mejora/sr-real261. sr-real261.js: grupos reales de la S.R. (Intersec, transformador 2,750 kVA 15 kV/571 V, rectificador de 168 diodos, D.U.R. 5,000 A, seccionadores, control, ventilador, C.S.), revisión de la maqueta, 17 S.R. de Línea 1 en zonas A–F con 5 C.S. Pestañas «S.R. real» y «Línea 1: zonas y S.R.» en grid-substation256 (sustituyen al anillo de 15 kV; densímetros SF6 virtuales). Letreros de S.R. en vía desde track-current250. Geometría 3D sin remodelar. Ver docs/revision261.md.

## Mando262
Rama mejora/mando262. control262.js: puestos de mando (P.C.C., P.D.C. 5.º piso, sala de interruptores, T.C.D., P.C.L., C.E.E.), equipos telemandados, enclavamientos de 85 kV, telemando por hilo piloto y coordinación de maniobras de una S.R. Pestaña «Mando: P.C.C. y P.D.C.» en grid-substation256; la S.R. en maniobra entra a zones261.out. view.realOnly262 oculta battery y fire en rectifier-view126. Ver docs/revision262.md.

## PCC263
Rama mejora/pcc263. pcc263.js: botón «P.C.C.» (instalado desde driving107), esquema de línea con trenes, zonas y S.R. de Línea 1 (ZONE_STATE261 compartido con grid-substation256), flujos motor/generador/resistencias con snapshot263 y órdenes: HoldBook263 (retención por t.wait de trenes ya detenidos), energía de línea y emergencia por los botones existentes. No toca engine.js. Ver docs/revision263.md.

## Fondo264
Rama mejora/fondo264. El fondo y la niebla de las estaciones cubiertas pasan de #18232a a #5d7482 (visual-quality100.js, palette122.covered) porque el usuario lo veía muy oscuro.

## Edificio PCC265
Rama mejora/edificio-pcc265. Menú «06 · Puestos Centrales de Control» (game86.js, modo 'pcc') carga pcc-building265.js: selector P.C.C. 1 / P.C.C. 2, edificio procedural con fachada, corte, armado animado y ocho niveles con equipo según las diapositivas (FLOORS265). P.C.C. 2 solo con su subestación de alumbrado y fuerza. Medidas y acomodo interno ilustrativos. Ver docs/revision265.md.

## Acabados PCC266
Rama mejora/texturas-pcc266. pcc-building265.js: paint266/kindOf266/dress266 aplican 9 texturas procedurales en gris (concreto, asfalto, metal, gabinete, radiador, celosía, madera, pantalla, porcelana) según el nombre de la pieza, más sombras PCFSoft, ACES, cielo en degradado y contornos. No cambia la geometría. Prueba en verificar_edificio_pcc265.mjs.
