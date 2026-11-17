# Mapeo técnico y respuesta a persona en vía

Base revisada: main 33d0814, 17 de noviembre de 2026. Rama: feat/mapeo-emergencias-identidad. Inventario del software, no certificado de características instaladas.

## Funciones presentes

| Área | Implementación | Alcance |
|---|---|---|
| Conducción y red | engine, manual-driver, cab-systems, station-scene | L1/L8, puertas, vigilancia, emergencias, seguimiento, demanda y cámaras |
| Geometría | car-support212, passenger-car211, station-reference213 | Dos apoyos por carro, pasajeros solidarios, perfiles de 39 estaciones; dimensiones aproximadas |
| Inspección y taller | workshop, energy-section160, energy-detail249 | Despiece, captadores, motores y convertidores por familia; prácticas con herramientas |
| Subestaciones | substation, sr-real261, grid-substation256 | Equipos, ventilación, fallos visuales, unifilar y estimaciones eléctricas |
| Alimentación | alimentacion269 y alimentacion/ | Patio 3D, torres, transformación, rectificación y captación; secundarios ilustrativos |
| Análisis | electric-dashboard245, train-dynamics257, onboard258 | Corriente, energía, adherencia y frenado; varios cálculos emplean valores compartidos, no fichas por modelo |
| Control | pcc263, pcc-building265, control262 | Operación didáctica; no reproduce un sistema de seguridad homologado |
| Documentación | biblioteca, technical-portal | Fuentes públicas, portal y documento aportado; mantener atribuciones |

## Material rodante

| Modelo | Asignación del software | Tracción representada | Lo que falta verificar |
|---|---|---|---|
| NM-22 | L1 | VVVF/IGBT y asíncrono de jaula | Ficha instalada, distribución individual de equipos y parámetros. Los requisitos L1 2020 no prueban por sí solos el equipo entregado. |
| NM-79 | L8, escenario | Motor CC y chopper | Variante/rehabilitación y semiconductor; la asignación a L8 no prueba inventario operativo actual. |
| MP-82 | L8 | Motor CC y chopper | Semiconductor, modificaciones y parámetros por unidad. La ficha pública sí sitúa el modelo en L8. |

La regeneración no es exclusiva del motor asíncrono. No se debe concluir SCR/GTO/IGBT únicamente a partir de la palabra chopper. La formación geométrica general todavía usa M-R-N-N-PR-N-N-R-M; revisar específicamente NM-22 antes de afirmar su distribución de motores. Las tensiones auxiliares de referencias generales tampoco son universales.

Valores de escenario: 750 V CC; límites 80 km/h L1 y 60 km/h L8; aceleración 1.4/1.0 m/s² y desaceleración de servicio 1.8/1.2 m/s². La lluvia usa límite seleccionable, factor de aceleración 0.65 y parada multiplicada por 1.25: supuestos del programa, no ajustes reales de KNR. Las curvas educativas de adherencia no modifican por sí solas la física operativa.

## Lluvia y exposición

L8 no es totalmente subterránea: el proyecto representa Coyuya, Iztacalco, Apatlaco, Aculco y Constitución de 1917 como superficies. La posición de portales usa interpolación aproximada (35/65 %), no levantamiento topográfico. No se modifican vías ni geometría en esta revisión.

Se cambia el valor inicial a restricción en exterior. Se mantiene la hipótesis explícita de restricción operativa en toda la línea. El análisis automático de adherencia ahora consulta la exposición del tren, independientemente de esa restricción. El modo manual «Mojada» permite estudiar agua en túnel como hipótesis, sin atribuirla al clima exterior.

## Incidente visual

En Ensayos visuales → Tren → Persona en vía. Se representa detección, frenado progresivo, inhibición de tracción, parada anterior a la figura y llegada de personal al andén. No se anima salto, contacto ni lesiones. No existe reposición automática: al finalizar persiste el bloqueo. El acceso a vías, rescate y reposición quedan pendientes de verificación y autorización. No es entrenamiento de rescate ni predice la distancia real necesaria.

La escena usa el laboratorio aislado existente, no altera trenes operativos ni el modelo compartido. Admite los tres modelos, pausa, avance y reinicio; la geometría se deriva de tiempo absoluto. Conserva el presupuesto de renderizado a 60 FPS.

## Identidad y límites de revisión

Se conserva la marca propia «Metro en la ciudad» y se sustituyen títulos residuales «METRO CDMX» y el encabezado del HTML aportado. Las referencias bibliográficas, enlaces, licencias y nombres de modelos permanecen identificables. No se afirma que mencionar al operador infrinja derechos ni se declara una depuración jurídica completa.

Los seis GLB de flota se inspeccionaron por nombres de nodos: no aparecieron nodos identificados como logo/STC/emblema/escudo. Esto no descarta marcas horneadas en texturas, carteles o fotografías. Esos recursos y los personajes de terceros requieren revisión visual y de licencias antes de afirmar que todo el paquete está libre de marcas. No se borran a ciegas señales de seguridad ni mallas funcionales.

## Fuentes y aplicabilidad

- [Línea 8, operador](https://www.metro.cdmx.gob.mx/la-red/linea-8): características de la línea; contrastar tramos con la cartografía.
- [Diagnóstico de movilidad, SEMOVI](https://semovi.cdmx.gob.mx/storage/app/media/diagnostico-tecnico-de-movilidad-pim.pdf): tabla de líneas, estaciones y tipo de tramo.
- [MP-82, ficha del operador](https://www.metro.cdmx.gob.mx/operacion/parque-vehicular/mp-82): dimensiones y asignación publicada; no acredita todo semiconductor instalado.
- [Informe ASCM, programa 73](https://ascm.gob.mx/IR/Informes/934.pdf): clasificación histórica chopper de NM-79 y MP-82, no inventario actual.
- [Modelo operativo L1, proyecto agosto 2020](https://metro.cdmx.gob.mx/storage/app/media/Banners/aclaraciones170920/bases/anexo%20I/Doc_Act/Documento%201.8%20Modelo%20Operativo.pdf): contempla persona caída a vías y parada/corte; no prueba protocolo vigente ni implementación real.

Solo se enlazan documentos públicos; no se redistribuyen PDFs retirados ni documentos sensibles.
