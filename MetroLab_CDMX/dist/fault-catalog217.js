// Public primary sources reviewed 2026-11-01. Only summaries and links are
// distributed, never copies of withdrawn project documents or manufacturer PDFs.
export const FAULT_SOURCES217=Object.freeze({
 stc:{title:'Conformación de un tren',publisher:'STC Metro · Gobierno CDMX',url:'https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren',locator:'Equipos bajo la caja; alimentación de carros motrices',scope:'Descripción general del STC; no es el esquema eléctrico particular de NM-22, NM-79 o MP-82.'},
 cooling:{title:'Forced ventilation on TRIHAL dry-type transformers',publisher:'Schneider Electric · FA32903',url:'https://www.se.com/nl/en/faqs/FA32903/',locator:'Ventilación forzada y calentamiento de devanados',scope:'Ejemplo de fabricante, no identificación del transformador instalado en el STC.'},
 rectifier:{title:'ACS880 diode supply control program',publisher:'ABB · manual público',url:'https://library.e.abb.com/public/e0884101599d4c96a136ff5f1e389266/EN_ACS880_diode_supply_ctrl_prg_FW_F_A4.pdf',locator:'Fault tracing: entradas AE14 y 4E03',scope:'Unidad industrial con diodos. Solo se traslada el mecanismo térmico; no códigos, ajustes ni topología al rectificador del Metro.'},
 feeder:{title:'Control & protection relays · SEPCOS',publisher:'Sécheron · fabricante de protección de tracción',url:'https://www.secheron.com/products-solutions/traction-power-systems/protection-supervision/control-protection-relays/',locator:'Protección de paneles CD y líneas de contacto frente a cortocircuitos',scope:'Principio de protección de tracción CD; curvas y selectividad deben estudiarse para la instalación concreta.'},
 battery:{title:'Substation DC Voltage Alarm Set Points',publisher:'NERC · Lesson Learned 20100405 · 14 abril 2010',url:'https://www.nerc.com/globalassets/programs/event-analysis/lessons-learned/ll20100405_substation_dc_voltage_alarm_set_points.pdf',locator:'Página 1: Problem Statement y Details',scope:'Incidente documentado en otra red; sus tensiones y ajustes no se usan como valores del Metro.'},
 door:{title:'Passenger trapped in train doors at Bushey · Safety digest 07/2018',publisher:'RAIB · Gobierno del Reino Unido',url:'https://www.gov.uk/government/publications/safety-digest-072018-bushey/passenger-trapped-in-train-doors-and-dragged-at-bushey-station-26-march-2018',locator:'Notas 2 y 4; apartado Previous similar occurrences',scope:'Material rodante distinto del STC; muestra también que un enclavamiento no garantiza detectar todo objeto atrapado.'},
 braking:{title:'Rolling stock TSI · Regulation (EU) 1302/2014, texto consolidado 11-03-2020',publisher:'Publicación oficial · legislation.gov.uk',url:'https://www.legislation.gov.uk/eur/2014/1302/pdfs/eur_20141302_2020-03-11_en.pdf',locator:'Cláusulas 4.2.4.4.4 y 4.2.4.7',scope:'Referencia comparativa europea sobre frenado combinado y pérdida del freno dinámico. No es una norma de aplicación acreditada a este Metro.'}
});
const metric=(id,label,values,step=false)=>({id,label,values,step});
export const FAULT_CASES217=Object.freeze([
 {id:'sr-cooling',domain:'substation',title:'Pérdida de ventilación forzada',target:'transformer',component:'Devanados y refrigeración del transformador seco',sources:['cooling'],
 evidence:'El fabricante relaciona la ventilación forzada con el control del calentamiento de los devanados.',
 inference:'Se representa pérdida de caudal bajo carga constante y una respuesta térmica progresiva. La alarma y apertura final son supuestos del ensayo.',
 pending:'Potencia y pérdidas, clase térmica, temperatura ambiente, sensores, inercias y ajustes de alarma/disparo.',
 steps:['Ventilación disponible y carga estable.','Se pierde el flujo forzado; la carga permanece.','El indicador térmico aumenta y aparece una alarma ilustrativa.','Se ilustra desconexión protectora; el equipo no se enfría instantáneamente.'],
 flow:['Carga','Devanados','Refrigeración','Protección'],metrics:[metric('flow','Caudal relativo',[1,1,.05,0,0]),metric('heat','Índice térmico',[.2,.2,.48,.82,.9]),metric('supply','Conexión de potencia',[1,1,1,0,0],true)]},
 {id:'sr-rectifier',domain:'substation',title:'Sobretemperatura del rectificador',target:'rectifier',component:'Diodos, disipadores y ventilación del rectificador',sources:['rectifier'],
 evidence:'ABB documenta avisos y fallos térmicos de una unidad con diodos por sobrecarga o fallo de ventilación.',
 inference:'La cadena ventilación insuficiente → calentamiento → alarma → salida interrumpida es conceptual, sin copiar los códigos ABB al STC.',
 pending:'Pérdidas de diodos, reparto de corriente, refrigeración, sensores y protecciones del rectificador real.',
 steps:['Disipación y salida de CD disponibles.','Se reduce la refrigeración del equipo.','Aumenta el indicador térmico; aviso conceptual de sobretemperatura.','La protección supuesta interrumpe la salida de CD.'],
 flow:['CA','Puentes de diodos','Disipación','Salida CD'],metrics:[metric('flow','Ventilación relativa',[1,1,.1,0,0]),metric('heat','Índice térmico',[.2,.2,.5,.85,.9]),metric('supply','Salida disponible',[1,1,1,0,0],true)]},
 {id:'sr-feeder',domain:'substation',title:'Cortocircuito en alimentador de CD',target:'dc',component:'Interruptor y alimentador de tracción CD',sources:['feeder'],
 evidence:'La protección de tracción CD supervisa paneles y líneas frente a fallos eléctricos, especialmente cortocircuitos.',
 inference:'Se ilustra el aumento de corriente y la apertura del alimentador afectado. No se calcula corriente prospectiva, arco ni coordinación real.',
 pending:'Impedancias de red y retorno, alimentación por extremos, inductancia, curvas, poder de corte y selectividad.',
 steps:['Alimentador cerrado y corriente de servicio.','Se introduce un cortocircuito conceptual aguas abajo.','La señal de corriente aumenta; la protección detecta el fallo.','Abre el interruptor de la rama: cesa la corriente de esa rama.'],
 flow:['Barra CD','Interruptor','Alimentador','Retorno'],metrics:[metric('current','Índice de corriente',[.25,.92,.92,0,0],true),metric('supply','Rama conectada',[1,1,1,0,0],true),metric('line','Disponibilidad de la rama',[1,1,.35,0,0])]},
 {id:'sr-charger',domain:'substation',title:'Fallo del cargador de baterías',target:'battery',component:'Cargador, batería y alimentación de control',sources:['battery'],
 evidence:'NERC documenta pérdida de capacidad de protección y control tras un fallo del cargador y descenso de tensión de CD.',
 inference:'Primero se representa respaldo por batería; después, reserva decreciente. No se supone pérdida instantánea de todas las protecciones.',
 pending:'Tensión y química, estado de carga, envejecimiento, consumos, autonomía y alarmas de la instalación.',
 steps:['Cargador disponible; reserva estable.','Falla el cargador; la batería sostiene el bus de control.','La reserva baja bajo carga; aparece aviso ilustrativo.','Se muestra riesgo de indisponibilidad de control al agotarse la reserva.'],
 flow:['Cargador','Batería','Bus auxiliar','Control'],metrics:[metric('charger','Cargador disponible',[1,0,0,0,0],true),metric('reserve','Reserva gráfica',[1,1,.75,.4,.1]),metric('bus','Disponibilidad de control',[1,1,1,1,0],true)]},
 {id:'train-doors',domain:'train',title:'Cierre sin confirmación de enclavamiento',target:'doors',component:'Puertas de pasajeros y autorización de tracción',sources:['door'],
 evidence:'El informe RAIB describe la relación entre confirmación de cierre, liberación de frenos y autorización de tracción.',
 inference:'En este caso una hoja queda sin confirmación y se inhibe la autorización. No se afirma que el sistema detecte todos los objetos atrapados.',
 pending:'Circuito de puertas de cada modelo, sensores, enclavamientos y estados de seguridad documentados.',
 steps:['Confirmación de puertas disponible.','Una puerta pierde la confirmación de cierre.','La indicación de puertas señala la anomalía.','La autorización de tracción permanece inhibida en el ensayo.'],
 flow:['Hoja','Sensor de cierre','Enclavamiento','Tracción'],metrics:[metric('closed','Cierre confirmado',[1,0,0,0,0],true),metric('permission','Autorización de tracción',[1,0,0,0,0],true),metric('command','Solicitud del mando',[.7,.7,.7,.7,.7])]},
 {id:'train-air',domain:'train',title:'Compresor sin reposición de aire',target:'mechanics',component:'Compresor, reserva y circuitos neumáticos',sources:['stc'],
 evidence:'El STC identifica el compresor como suministro de aire para frenado neumático y cierre de puertas.',
 inference:'Con compresor detenido y consumo sostenido se ilustra reducción de reserva; los efectos exactos requieren el esquema neumático del modelo.',
 pending:'Ubicación exacta por carro, caudal, volúmenes, consumos, presostatos y lógica de freno/puertas.',
 steps:['Compresor y reserva disponibles.','Se detiene la reposición de aire.','Baja la reserva gráfica mientras persiste el consumo supuesto.','Se señala disponibilidad neumática degradada; no se inventa un umbral en bar.'],
 flow:['Compresor','Depósito','Distribución','Freno / puertas'],metrics:[metric('compressor','Compresor disponible',[1,0,0,0,0],true),metric('reserve','Reserva relativa',[1,1,.75,.4,.15]),metric('demand','Consumo supuesto',[.5,.5,.5,.5,.5])]},
 {id:'train-supply',domain:'train',title:'Pérdida de captación de tracción',target:'collectors',component:'Captadores y cadena eléctrica de tracción',sources:['stc'],
 evidence:'El STC describe la toma de corriente desde la barra guía mediante escobillas en carros motrices.',
 inference:'Se retira la alimentación disponible de tracción: el par desaparece, pero la velocidad no se hace cero instantáneamente. El movimiento no se integra al motor del juego.',
 pending:'Topología de alimentación, redundancias entre carros, protecciones, masa, pendiente y resistencias al avance.',
 steps:['Captación y esfuerzo de tracción disponibles.','Se interrumpe el aporte de energía en el escenario.','El esfuerzo de tracción cae; la inercia conserva movimiento.','Se muestra marcha sin esfuerzo motor; no es una curva de frenado calculada.'],
 flow:['Barra guía','Captador','Conversión','Motor'],metrics:[metric('supply','Captación disponible',[1,0,0,0,0],true),metric('effort','Esfuerzo relativo',[.7,.7,0,0,0]),metric('speed','Velocidad ilustrativa',[.7,.7,.68,.62,.55])]},
 {id:'train-brake',domain:'train',title:'Pérdida del freno eléctrico',target:'motors',component:'Tracción, freno dinámico y complemento de fricción',sources:['braking'],
 evidence:'La referencia europea trata el frenado combinado y exige analizar la pérdida de esfuerzo del freno dinámico cuando contribuye al frenado.',
 inference:'Se compara un complemento de fricción disponible con la pérdida eléctrica. Su compensación es un supuesto, no una prestación garantizada de NM-22/NM-79/MP-82.',
 pending:'Arquitectura de frenado, capacidad de fricción, adherencia, carga, mezcla de frenos y distancias reales.',
 steps:['Demanda de frenado repartida entre dos contribuciones.','Se pierde el esfuerzo de frenado eléctrico.','Se solicita mayor contribución de fricción en esta comparación.','Se conserva solo una demanda gráfica; no se certifica distancia de parada.'],
 flow:['Demanda','Freno eléctrico','Fricción','Esfuerzo total'],metrics:[metric('electric','Freno eléctrico relativo',[.65,.65,0,0,0]),metric('friction','Fricción supuesta',[.25,.25,.4,.9,.9]),metric('total','Suma gráfica',[.9,.9,.4,.9,.9])]}
]);
export const FAULT_SCOPE217='Secuencia educativa de 16 s de escena, sin escala temporal de avería. Señales normalizadas: índices gráficos 0–1, no mediciones ni umbrales de protección. El color térmico es falso color. No inyecta fallos en el tren operativo ni incluye reparación, herramientas o maniobras reales.';
export const KEYFRAMES217=Object.freeze([0,.2,.5,.75,1]);
export function sampleFault217(id,progress){
 const scenario=FAULT_CASES217.find(s=>s.id===id);if(!scenario)throw Error('Ensayo no disponible');
 const p=Math.min(1,Math.max(0,Number.isFinite(progress)?progress:0));let segment=0;while(segment<3&&p>=KEYFRAMES217[segment+1])segment++;
 const u=(p-KEYFRAMES217[segment])/(KEYFRAMES217[segment+1]-KEYFRAMES217[segment]);
 const signals=Object.fromEntries(scenario.metrics.map(m=>[m.id,m.step?m.values[p===1?4:segment]:m.values[segment]+u*(m.values[segment+1]-m.values[segment])]));
 const phase=p<.2?0:p<.5?1:p<.75?2:3;return {progress:p,phase,signals,note:scenario.steps[phase],alarm:phase>=2,scenario};
}
export class FaultClock217{
 constructor(){this.progress=0;this.playing=false;this.last=null;}
 seek(p){this.progress=Math.max(0,Math.min(1,Number(p)||0));this.last=null;}
 play(){if(this.progress===1)this.seek(0);this.playing=true;this.last=null;}
 pause(){this.playing=false;this.last=null;}
 advance(now,visible=true){if(!visible||!this.playing){this.last=null;return this.progress;}if(this.last!==null)this.progress=Math.min(1,this.progress+Math.max(0,now-this.last)/16000);this.last=now;if(this.progress===1)this.pause();return this.progress;}
}
