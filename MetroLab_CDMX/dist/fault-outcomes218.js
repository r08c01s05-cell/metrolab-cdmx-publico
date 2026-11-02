import {sampleFault217,FAULT_CASES217,KEYFRAMES217} from './fault-catalog217.js?v=217';

const clamp=x=>Math.max(0,Math.min(1,x));
const ramp=(p,a,b)=>{const t=clamp((p-a)/(b-a));return t*t*(3-2*t);};
export function variants218(id){
 if(id==='sr-cooling')return [['reference','Protección térmica disponible'],['unprotected','Protección no actúa · hipótesis adicional']];
 if(id==='train-brake')return [['reference','Complemento de fricción · supuesto'],['slide','Adherencia reducida + rueda bloqueada · hipótesis adicional']];
 return [['reference','Secuencia de referencia']];
}
export const EXTRA_SOURCES218={
 thermal:{publisher:'Hammond Power Solutions',title:'Transformer is overheating',url:'https://americas.hammondpowersolutions.com/resources/faq/troubleshooting-guide/transformer-is-overheating',locator:'Troubleshooting · overheating',scope:'Describe decoloración, aislamiento quemado y humo como signos posibles de sobrecalentamiento; no establece un tiempo universal de destrucción ni datos del STC.'},
 adhesion:{publisher:'RAIB · Gobierno del Reino Unido',title:'Annual report for 2023',url:'https://www.gov.uk/government/publications/raib-annual-report-2023-published-2024/annual-report-for-2023',locator:'Low adhesion / braking',scope:'Referencia comparativa de baja adherencia rueda–riel. No demuestra prestaciones de los trenes neumáticos del STC; bloqueo y adherencia reducida son hipótesis adicionales.'}
};

// Absolute-time sampling: seeking backwards and different display FPS give the
// same geometry. Distances/angles below belong to a study scene, not a solver.
function speed(id,p,variant){
 if(id==='train-supply')return sampleFault217(id,p).signals.speed;
 if(id==='train-brake')return variant==='slide'?1-.64*ramp(p,.25,1):1-ramp(p,.2,.92);
 return 0;
}
function rampIntegral(p,a,b){const u=clamp((p-a)/(b-a));return (b-a)*(u*u*u-.5*u*u*u*u)+Math.max(0,p-b);}
function signalIntegral(id,key,p){const m=FAULT_CASES217.find(c=>c.id===id).metrics.find(m=>m.id===key);if(!m)return 0;let sum=0;for(let i=0;i<4;i++){const h=Math.max(0,Math.min(p,KEYFRAMES217[i+1])-KEYFRAMES217[i]),span=KEYFRAMES217[i+1]-KEYFRAMES217[i];sum+=h*m.values[i]+(m.step?0:h*h*(m.values[i+1]-m.values[i])/(2*span));}return sum;}
function distanceIntegral(id,p,variant){if(id==='train-supply')return signalIntegral(id,'speed',p);if(id==='train-brake')return variant==='slide'?p-.64*rampIntegral(p,.25,1):p-rampIntegral(p,.2,.92);return 0;}
export function sampleOutcome218(id,progress,variant='reference'){
 const s=sampleFault217(id,progress),p=s.progress;
 const unprotected=id==='sr-cooling'&&variant==='unprotected',sliding=id==='train-brake'&&variant==='slide';
 if(unprotected){s.signals.supply=1;if(p>=.75)s.signals.heat=.82+.18*(p-.75)/.25;s.note=p<.5?s.note:'Hipótesis adicional: no actúa la protección; persiste el calentamiento y puede dañarse el aislamiento.';}
 const distance=8*distanceIntegral(id,p,variant);
 const wheelDistance=8*distanceIntegral(id,sliding?Math.min(p,.48):p,variant);
 const fanAngle=signalIntegral(id,'flow',p)*Math.PI*64;
 const fanRunning=(s.signals.flow??s.signals.compressor??0)>.01;
 const breakerOpen=['sr-cooling','sr-rectifier','sr-feeder'].includes(id)&&s.signals.supply===0;
 const damage=unprotected?ramp(p,.66,1):0;
 const doorOpening=id==='train-doors'?ramp(p,.2,.48):0;
 let result='';
 if(id==='sr-cooling')result=unprotected?(damage>0?'Daño térmico potencial: aislamiento oscurecido y humo ilustrativo. Protección supuesta inoperante.':'Ventilación perdida; se supone que la protección no actúa.'):(breakerOpen?'Protección abierta: transformador desconectado e íntegro. El calor residual no desaparece al abrir.':p>=.2?'El ventilador pierde giro; aumenta el calentamiento.':'Ventilación en servicio; protección cerrada.');
 if(id==='sr-rectifier')result=breakerOpen?'Se abre la protección; rectificador fuera de servicio, sin destrucción supuesta.':p>=.2?'El giro del ventilador disminuye hasta detenerse.':'Refrigeración y alimentación disponibles.';
 if(id==='sr-feeder')result=breakerOpen?'Interruptor abierto: separación visible de contactos y rama aislada.':p>=.2?'Cortocircuito conceptual: la protección todavía no ha abierto en esta fase.':'Contactos cerrados: rama alimentada.';
 if(id==='sr-charger')result=p>=.2?'Cargador fuera de servicio; disminuye la reserva de la batería bajo consumo supuesto.':'Cargador en servicio y reserva estable.';
 if(id==='train-doors')result=p>=.2?'Una pareja de hojas queda abierta; tren inmóvil y tracción inhibida.':'Puertas cerradas; tren detenido para observar el ensayo.';
 if(id==='train-air')result=p>=.2?'Compresor detenido; baja la reserva. Tren inmóvil por condición inicial del ensayo, no por una lógica de freno deducida.':'Tren detenido; compresor disponible.';
 if(id==='train-supply')result=p>=.2?'Sin alimentación de tracción: el esfuerzo decae y el vagón continúa por inercia con las ruedas girando.':'Vagón en movimiento con alimentación disponible.';
 if(id==='train-brake')result=sliding?(p>=.48?'Vagón deslizándose con ruedas bloqueadas: condición adicional supuesta, no efecto universal del fallo eléctrico.':'Se aproxima una condición supuesta de baja adherencia y bloqueo.'):(p>=.92?'El vagón se detiene con el complemento de fricción supuesto.':'El vagón desacelera; las ruedas mantienen rodadura en esta comparación.');
 const breakerOpening=breakerOpen?.12+.88*ramp(p,.75,.80):0;
 const compressorAngle=Math.min(p,.2)*Math.PI*80;
 return {...s,outcome:{distance,wheelDistance,fanAngle,fanRunning,breakerOpen,breakerOpening,compressorAngle,damage,doorOpening,sliding:sliding&&p>=.48,moving:speed(id,p,variant)>.001,result,unprotected}};
}
