// General STC reference supplied by the user; not an individual model schematic.
export const FORMATION9=Object.freeze(['M','R','N','N','PR','N','N','R','M']);
export const FORMATION6=Object.freeze(['M','R','N','N','PR','M']);
export const CAR_TYPES={
 M:{name:'Motriz con cabina',powered:true,cab:true,description:'Dispone de tracción propia y cabina en un extremo del convoy.'},
 N:{name:'Motriz sin cabina',powered:true,cab:false,description:'Aporta tracción al convoy y dispone de espacio para pasajeros sin cabina de conducción.'},
 R:{name:'Remolque',powered:false,cab:false,description:'Sus bogies no incorporan motores de tracción. La referencia sitúa equipos auxiliares bajo la caja.'},
 PR:{name:'Remolque con pilotaje automático',powered:false,cab:false,description:'Remolque central que aloja equipos y captor del pilotaje automático en la referencia general.'}
};
export function carReference(index){if(!Number.isInteger(index)||index<0||index>=9)throw RangeError('Carro fuera de la formación de nueve unidades.');const type=FORMATION9[index];return{index,position:index+1,type,...CAR_TYPES[type],unit:CAR_TYPES[type].cab?'cabina':'intermedio',bogies:2,referenceMotors:CAR_TYPES[type].powered?4:0};}
export function formationSummary(formation=FORMATION9){const motrices=formation.filter(t=>CAR_TYPES[t].powered).length;return{cars:formation.length,motrices,remolques:formation.length-motrices,bogies:formation.length*2,referenceMotors:motrices*4};}
export const TECHNICAL_REFERENCE={source:'https://www.metro.cdmx.gob.mx/operacion/conformacion-de-un-tren',scope:'Descripción general del STC. Equipos y tensiones auxiliares deben confirmarse en la documentación de cada modelo, especialmente el NM-22.',traction:{voltage:750,kind:'V CD',pneumatic:'Captación por escobillas desde la barra guía.',steel:'Captación por pantógrafo desde catenaria; referencia comparativa, fuera de las líneas 1 y 8 de este simulador.'},auxiliaries:[{name:'Compresor',function:'Suministra aire para el frenado neumático y el cierre de puertas en la referencia.'},{name:'Motogenerador',function:'La referencia indica entrada de 750 V y generación de 250 V CA para alumbrado; alimentación desde una motriz N adyacente.'},{name:'Baterías',function:'La referencia indica 72 V para circuitos de mando.'},{name:'Pilotaje automático',function:'Equipos y captor situados en el remolque central PR.'}]};
