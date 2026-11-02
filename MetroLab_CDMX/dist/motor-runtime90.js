import {carReference} from './train-formation.js?v=64';
export function applyMotorRole90(scene,index){const powered=carReference(index).powered;const remove=[];scene.traverse(o=>{if((o.userData.motorAssembly90||o.userData.collectorAssembly111)&&!powered)remove.push(o);});for(const o of remove)o.removeFromParent();scene.userData.motorCount90=powered?4:0;return scene;}
export const MOTOR_PARTS90={
 Colector:'Conjunto de delgas de cobre para la conmutación mediante escobillas. Referencia visual del video de mantenimiento; asignación exacta a NM-79/MP-82 pendiente de ficha.',
 Escobilla:'Bloque de carbón estacionario en contacto con el colector. Solo se muestra en la familia visual con colector.',
 Portaescobilla:'Soporte estacionario de una escobilla de carbón, simplificado a partir del video.',
 Barra:'Elemento conductor del rotor de jaula representado de forma didáctica.',
 Anillo:'Anillo de cortocircuito que une las barras del rotor de jaula. Requisito de proyecto L1 2020, pág. 114.',
 Devanado:'Bobinado representativo. Las espiras, aislamiento y conexión no son un plano de fabricación.',
 Ventilador:'Álabes solidarios al rotor para representar la ventilación interna.',
 Nervadura:'Refuerzo exterior de la carcasa; cotas aproximadas.',
 Carcasa:'Protege y soporta los componentes del motor. La abertura del despiece permite estudiar su interior.',
 Estator:'Parte estacionaria que participa en la producción del campo magnético. Su construcción depende del tipo de motor.',
 Rotor:'Parte giratoria que convierte la interacción electromagnética en par mecánico.',
 Eje:'Transmite el par del rotor hacia el acoplamiento. No se asume una velocidad nominal sin ficha del modelo.',
 Tapa:'Cierra los extremos y contribuye al soporte y alineación del conjunto.',
 Rodamiento:'Permite el giro del eje y soporta cargas. Tipo, holgura y lubricación requieren información del fabricante.',
 Perno:'Fijación representativa. No se han asignado pares de apriete reales.',
 Caja:'Punto conceptual de conexión eléctrica. No representa un diagrama de bornes para conectar un tren real.',
 Soporte:'Representa la sujeción al bogie; la ubicación y dimensiones son aproximadas.',
 Acoplamiento:'Une la salida del motor con la transmisión, permitiendo transmitir el par.',
 Reductor:'Representa la transmisión hacia el eje de rodadura. La relación de engranajes está pendiente de confirmar.',
 Marca:'Marca visual para observar el giro durante el ensayo didáctico.'
};
export function motorDescription90(name){return Object.entries(MOTOR_PARTS90).find(([key])=>name.includes('_'+key))?.[1]||'Conjunto de tracción conceptual. No es un despiece certificado del fabricante.';}
export function motorBench90({power=false,command=0,isolated=false}={}){const demand=Math.max(0,Math.min(100,Number(command)||0));return {running:power&&!isolated&&demand>0,relativeSpeed:power&&!isolated?demand:0,state:isolated?'Motor aislado · sin par':!power?'Alimentación desconectada':demand?'Ensayo de giro · '+demand+' %':'Alimentado · mando en cero'};}

export function motorEvidence94(model){return model==='NM22'?'Referencia L1: asíncrono trifásico de rotor de jaula, alimentado por VVVF (especificaciones 2020, pp. 108 y 114–115). Requisito de proyecto; no confirma fabricante ni diseño construido del NM-22.':'Referencia visual con colector y escobillas del video aportado. No se identifican placa ni fabricante; su aplicación a '+(model==='MP82'?'MP-82':'NM-79')+' es provisional. Dimensiones y montaje aproximados.';}
