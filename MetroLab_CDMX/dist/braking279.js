// Frenado 279: a dónde va la energía cuando el motor trabaja como generador, según el modelo de tren.
// Fuentes: presentación del usuario «MetroLab CDMX» (diapositiva 35: NM-79 y MP-82 con chopper y freno
// electrodinámico exclusivamente reostático; NM-22 con VVVF, regenerativo + blending; diapositiva 54:
// regenera a la barra guía mientras la red está por debajo de 900 V, si no deriva a resistencias) y
// ALAMYS, «Aprovechamiento de energía de frenos»: los trenes chopper tenían 20 % de capacidad regenerativa
// de proyecto que «nunca se alcanzó» en la práctica.
import {ASSUMED245,DOCUMENTED245} from './electric-dashboard245.js?v=255';
// Tensión permanente más alta para 750 V CD (EN 50163), la misma que usa train-dynamics257.
export const VMAX279=900;
// Misma ecuación que brakeDestination257: al devolver P la tensión sube, V² − V0·V − R·P = 0.
function destination279(Pkw,{receptive=true,V0=DOCUMENTED245.nominalV,R=ASSUMED245.lineOhm,vMax=VMAX279}={}){if(!receptive)return{regen:0,rheo:Pkw,V:V0};const P=Pkw*1000,V=(V0+Math.sqrt(V0*V0+4*R*P))/2;if(V<=vMax)return{regen:Pkw,rheo:0,V};const Pmax=vMax*(vMax-V0)/R/1000;return{regen:Pmax,rheo:Pkw-Pmax,V:vMax};}

export const SOURCES279=Object.freeze({
 slides:'Presentación «MetroLab CDMX», diapositivas 35 (tecnologías de control por generación) y 54 (frenado electrodinámico, EN 50163)',
 alamys:{title:'ALAMYS · Aprovechamiento de energía de frenos (Metro de la Ciudad de México)',url:'https://www.alamys.org/wp-content/uploads/2021/07/Aprovechamiento-de-energía-de-frenos.pdf'}});
export const BRAKE279=Object.freeze({
 'NM-22':{type:'regen',control:'VVVF (IGBT)',label:'Regenerativo + mezcla con fricción',short:'Regenerativo'},
 'NM-79':{type:'rheo',control:'Chopper',label:'Electrodinámico reostático',short:'Reostático'},
 'MP-82':{type:'rheo',control:'Chopper',label:'Electrodinámico reostático',short:'Reostático'}});
export function brakeInfo279(model){return BRAKE279[model]||{type:'regen',control:'—',label:'Sin dato del modelo',short:'Sin dato'};}
export function rheoOnly279(model){return brakeInfo279(model).type==='rheo';}
// Reparto de la potencia de frenado eléctrico (kW). receptive: hay trenes que pueden tomarla.
export function brakeSplit279(model,Pkw,opts={}){if(!(Pkw>0))return{regen:0,rheo:0,V:opts.V0??750,reason:'Sin frenado eléctrico'};
 if(rheoOnly279(model))return{regen:0,rheo:Pkw,V:opts.V0??750,reason:`${model} · ${brakeInfo279(model).control}: el freno eléctrico solo disipa en resistencias`};
 const d=destination279(Pkw,opts);return{...d,reason:!opts.receptive?'Línea no receptiva: ningún tren cercano toma la energía':d.rheo>0?'La tensión llegaría a 900 V: el excedente va a resistencias':'Regresa a la barra guía'};}
// Trenes de la misma línea que traccionan a menos de 'reach' metros.
export function nearbyTraction279(engine,t,reach=2000){let n=0;for(const o of engine?.trains||[])if(o!==t&&o.line===t.line&&o.wait<=0&&Math.abs(o.position-t.position)<reach&&o.state==='Acelerando')n++;return n;}
