// Inventario del software; no ficha de homologación del material real.
export const PERFILES270 = Object.freeze([
 {id:'NM22',nombre:'NM-22',linea:'Línea 1',motor:'Asíncrono de jaula · representación de proyecto',convertidor:'VVVF con IGBT · modelo didáctico',pendiente:'Ficha instalada, potencia por motor, parámetros del inversor y configuración exacta de frenos.'},
 {id:'NM79',nombre:'NM-79',linea:'Línea 8 · asignación del escenario, no inventario operativo actual',motor:'Corriente continua con colector · modelo didáctico',convertidor:'Chopper documentado; semiconductor de la unidad pendiente',pendiente:'Variante y rehabilitación: no asignar SCR, GTO o IGBT sin identificar el equipo.'},
 {id:'MP82',nombre:'MP-82',linea:'Línea 8 · ficha pública del operador',motor:'Corriente continua con colector · modelo didáctico',convertidor:'Chopper documentado; semiconductor de la unidad pendiente',pendiente:'Ficha del motor, convertidor instalado y posibles modificaciones por unidad.'}
]);
export const CONSIDERACIONES270 = Object.freeze([
 'Los tres modelos representan rodadura neumática y captación lateral a 750 V de corriente continua. No trasladar esta tensión a todas las líneas.',
 'La regeneración no identifica por sí sola un motor asíncrono: un sistema de corriente continua también puede regenerar si su arquitectura lo permite.',
 'La receptividad de la red, las protecciones y el frenado de fricción condicionan la respuesta. No se garantizan distancias reales de parada.',
 'Línea 8 incluye superficie: Coyuya, Iztacalco, Apatlaco, Aculco y Constitución de 1917. La lluvia física depende del tramo, no solo del número de línea.',
 'Una restricción de marcha por lluvia puede abarcar toda una línea sin significar que su túnel esté mojado. La interfaz conserva ese escenario como hipótesis operativa.',
 'CBTC, ATP, ATO, vigilancia y enclavamientos son representaciones educativas; su disponibilidad real exige confirmar tren, línea y fecha.',
 'El límite de velocidad de escenario es 80 km/h en L1 y 60 km/h en L8. Las aceleraciones de 1.4/1.0 m/s² y frenos de 1.8/1.2 m/s² son parámetros del software, no prestaciones certificadas.',
 'La formación geométrica compartida todavía utiliza la referencia tradicional de nueve carros. No acredita la distribución de equipos ni motorización individual del NM-22.'
]);
export function renderPerfiles270(host) {
 const doc = host.ownerDocument;
 const details = doc.createElement('details');
 const summary = doc.createElement('summary');
 summary.textContent = 'Mapa técnico por tren · datos y supuestos';
 details.append(summary);
 for (const p of PERFILES270) {
  const h = doc.createElement('h4'); h.textContent = p.nombre + ' · ' + p.linea;
  const text = doc.createElement('p'); text.textContent = p.motor + '. ' + p.convertidor + '. Pendiente: ' + p.pendiente;
  details.append(h,text);
 }
 const ul = doc.createElement('ul');
 for (const text of CONSIDERACIONES270) { const li = doc.createElement('li'); li.textContent = text; ul.append(li); }
 details.append(ul);
 const sources = doc.createElement('p');
 sources.append('Referencias públicas: ');
 for (const [title,url] of [
  ['Línea 8','https://www.metro.cdmx.gob.mx/la-red/linea-8'],
  ['Ficha MP-82','https://www.metro.cdmx.gob.mx/operacion/parque-vehicular/mp-82'],
  ['Clasificación histórica de tracción · ASCM','https://ascm.gob.mx/IR/Informes/934.pdf']
 ]) {
  const a = doc.createElement('a'); a.textContent=title; a.href=url;
  a.target='_blank'; a.rel='noopener noreferrer'; sources.append(a,' · ');
 }
 details.append(sources); host.append(details);
}
