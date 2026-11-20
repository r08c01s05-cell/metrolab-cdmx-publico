// Regulación 279: lo que hace un regulador en el P.C.C. sobre el escenario de práctica del centro de
// control (pcc-centro277). Trabaja sobre la instancia privada de MetroEngine que crea ese centro: usa
// los métodos speedLimit y stationDwell de la instancia y el tiempo de parada t.wait, que son la forma
// en que el propio motor deja configurar a un tren. engine.js no cambia y el simulador principal no se
// toca.
//
// Fuentes:
// · Presentación del usuario «MetroLab CDMX»: diapositiva 77 (regímenes de marcha PA, CMC y CML y
//   dispositivo hombre muerto), 78 (del bloque fijo PA135/SACEM al CBTC de bloque móvil), 57 (registrador
//   de eventos y freno de urgencia) y 59 (curva de protección ATP).
// · Chilango, 6 sep 2023: los NM-22 tienen pilotaje automático, conducción manual controlada (supervisa
//   distancias) y conducción manual restringida (supervisa el límite de velocidad).
// · AMF 2023, «El CBTC en Línea 1 del Metro CDMX»: Siemens Trainguard MT, cantones móviles.
// Lo que no viene en esas fuentes se marca en ASSUMED279.

export const SOURCES279R=Object.freeze([
 {id:'slides',title:'Presentación «MetroLab CDMX», diapositivas 57, 59, 77 y 78',url:null},
 {id:'chilango',title:'Chilango · «¡Línea 1 del Metro estrena nuevo piloto automático!» (6 sep 2023)',url:'https://www.chilango.com/noticias/linea-1-del-metro-estrena-nuevo-piloto-automatico-esto-explican-sus-exdirectores/'},
 {id:'amf',title:'AMF 2023 · El CBTC en Línea 1 del Metro CDMX (Siemens Mobility)',url:'https://amf.org.mx/wp-content/uploads/2023/04/2.%20Pasajeros/Dia%202/1145%20-%201315%20Tecnologia%20en%20Trenes%20de%20Pasajeros/El%20CBTC%20en%20Linea%201%20del%20Metro%20CDMX.pdf'}]);

export const MODES279=Object.freeze({
 PA:{name:'Pilotaje automático',short:'PA',text:'El sistema conduce el tren siguiendo su perfil de velocidad; el conductor vigila, cierra puertas y da la salida.'},
 CMC:{name:'Conducción manual controlada',short:'CMC',text:'Conduce el conductor y el ATP supervisa velocidad y distancia. Si se pasa de la curva, el ATP aplica el freno de urgencia.'},
 CML:{name:'Conducción manual limitada',short:'CML',text:'Conduce el conductor con un tope fijo de velocidad. Se usa cuando falla la protección continua. Chilango la llama «conducción manual restringida».'}});

export const SIGNALLING279=Object.freeze({
 1:{kind:'cbtc',name:'CBTC · bloque móvil',text:'Nueva Línea 1: Siemens Trainguard MT con cantones móviles. Cada tren recibe por radio su autoridad de movimiento hasta la cola del tren de adelante menos un margen.'},
 8:{kind:'fixed',name:'Bloque fijo',text:'Señalización clásica por cantones fijos: un tren solo entra a un cantón libre. La presentación cita PA135 y SACEM como sistemas de bloque fijo; no se verificó cuál usa la Línea 8.'}});

export const ASSUMED279=Object.freeze({
 trainLength:150,        // m, 9 carros de unos 16.7 m (el motor no da la longitud)
 cmlKmh:30,              // km/h, tope de CML; las fuentes no dan el valor
 cmcMargin:5,            // km/h que el conductor deja bajo el límite en CMC
 atpTolerance:5,         // km/h sobre el límite antes de que el ATP intervenga
 blocksPerInterstation:2,// cantones por interestación en la Línea 8
 overlap:15,             // m de margen antes de la señal o de la cola del tren de adelante
 cbtcMargin:50,          // m de margen de la autoridad de movimiento CBTC
 stuckSeconds:60,        // s detenido entre estaciones para dar alarma
 maxRegulationHold:30,   // s máximos que la regulación alarga una parada
 note:'Supuestos del escenario: tren de 150 m, tope de CML de 30 km/h, el conductor de CMC deja 5 km/h de margen, el ATP interviene 5 km/h arriba del límite, dos cantones por interestación en la Línea 8. El freno de urgencia se representa con la deceleración de servicio del motor del simulador.'});

const kmh=v=>v*3.6,ms=v=>v/3.6;
export function clock279(engine){const s=Math.floor(engine.clockSeconds?engine.clockSeconds():engine.time);const h=Math.floor(s/3600)%24,m=Math.floor(s/60)%60,x=s%60;return [h,m,x].map(n=>String(n).padStart(2,'0')).join(':');}
// Fronteras de cantón de una línea: estaciones y puntos intermedios.
export function blocks279(line,per=ASSUMED279.blocksPerInterstation){const B=[];for(let i=0;i<line.distances.length-1;i++){const a=line.distances[i],b=line.distances[i+1];for(let k=0;k<per;k++)B.push(a+(b-a)*k/per);}B.push(line.distances.at(-1));return B;}
export function blockIndex279(B,x){let i=0;while(i<B.length-2&&x>=B[i+1])i++;return i;}
// Tramo que ocupa un tren: la posición es la cabeza y la cola queda atrás según su sentido.
export function occupancy279(t,len=ASSUMED279.trainLength){const d=t.direction||1;return d>0?[t.position-len,t.position]:[t.position,t.position+len];}
export function occupiedBlocks279(B,trains,dir,len=ASSUMED279.trainLength){const occ=new Map();for(const t of trains){if((t.direction||1)!==dir)continue;const [a,b]=occupancy279(t,len);const i=blockIndex279(B,Math.max(B[0],a)),j=blockIndex279(B,Math.min(B.at(-1),b));for(let k=i;k<=j;k++){if(!occ.has(k))occ.set(k,[]);occ.get(k).push(t.id);}}return occ;}

// Intervalo objetivo sugerido: vuelta completa estimada (marcha a 15 m/s de media más paradas)
// entre el número de trenes de la línea, redondeado a 15 s. Es un punto de partida editable.
export function suggestedTarget279(engine,line){const L=engine.lines[line],trip=2*(L.total/15+L.stations.length*(engine.dwell||30));return Math.max(60,Math.round(trip/Math.max(1,engine.fleet)/15)*15);}
export class Regulator279{
 constructor(engine,{lines=[1,8]}={}){this.e=engine;this.lines=lines;this.modes=new Map();this.atp=new Map();this.ltv=[];this.events=[];this.prev=new Map();this.departures=new Map();this.intervals={};this.reg={};this.cml=ASSUMED279.cmlKmh;this.nextId=1;this.base=null;
  for(const l of lines){this.reg[l]={on:false,target:suggestedTarget279(engine,l)};this.intervals[l]={1:[],[-1]:[]};}
  this.attach();this.prevPower={...engine.power};this.prevEmergency=engine.emergency;this.log('info',null,null,'Centro de control en servicio. Todos los trenes en pilotaje automático.');}
 // Conecta las reglas a la instancia del motor. Solo cambia esta instancia, no la clase.
 attach(){const e=this.e;if(e.regulator279===this)return;const proto=Object.getPrototypeOf(e);this.base=t=>proto.speedLimit.call(e,t);this.blockCache=new Map();for(const l of this.lines)this.blockCache.set(l,blocks279(e.lines[l]));e.speedLimit=t=>this.limitKmh(t);e.regulator279=this;}
 detach(){const e=this.e;if(e.regulator279!==this)return;delete e.speedLimit;delete e.regulator279;}
 mode(t){return this.modes.get(t.id)||'PA';}
 decel(t){return t.line===1?1.8:1.2;}
 // Velocidad permitida en km/h para el tren: perfil del motor, régimen, restricciones, señales y ATP.
 limitKmh(t,detail=false){const parts=[];let v=this.base(t);parts.push(['Perfil de la línea',v]);
  const m=this.mode(t);if(m==='CMC'){v=Math.max(5,v-ASSUMED279.cmcMargin);parts.push(['Conductor en CMC',v]);}if(m==='CML'){v=Math.min(v,this.cml);parts.push(['Tope de CML',v]);}
  const b=this.decel(t),d=t.direction||1;
  for(const r of this.ltv){if(r.line!==t.line)continue;const ahead=d>0?r.from-t.position:t.position-r.to,inside=t.position>=r.from&&t.position<=r.to;let lim=Infinity;if(inside)lim=r.kmh;else if(ahead>0&&ahead<1500)lim=kmh(Math.sqrt(ms(r.kmh)**2+2*b*ahead));if(lim<v){v=lim;parts.push([`Restricción ${r.kmh} km/h`,v]);}}
  const auth=this.authority(t);if(auth&&auth.dist!=null){const lim=kmh(Math.sqrt(2*b*Math.max(0,auth.dist-ASSUMED279.overlap)));if(lim<v){v=lim;parts.push([auth.kind==='signal'?'Señal en rojo':'Autoridad CBTC',v]);}}
  const atp=this.atp.get(t.id);if(atp?.braking){v=0;parts.push([atp.reason,0]);}
  return detail?{kmh:v,parts}:v;}
 // Autoridad de movimiento. CBTC: hasta la cola del tren de adelante menos un margen.
 // Bloque fijo: hasta la señal del primer cantón ocupado adelante.
 authority(t){const line=this.e.lines[t.line],d=t.direction||1,sig=SIGNALLING279[t.line]?.kind;if(!line||!sig)return null;const others=this.e.trains.filter(o=>o!==t&&o.line===t.line&&(o.direction||1)===d);
  if(sig==='cbtc'){let best=null;for(const o of others){const tail=d>0?o.position-ASSUMED279.trainLength:o.position+ASSUMED279.trainLength,gap=(tail-t.position)*d;if(gap>0&&(best==null||gap<best))best=gap;}return{kind:'cbtc',dist:best==null?null:Math.max(0,best-ASSUMED279.cbtcMargin),end:best==null?null:t.position+d*Math.max(0,best-ASSUMED279.cbtcMargin)};}
  const B=this.blockCache.get(t.line),occ=occupiedBlocks279(B,others,d),j=blockIndex279(B,t.position);for(let k=j+d;k>=0&&k<B.length-1;k+=d){if(occ.has(k)){const entry=d>0?B[k]:B[k+1];return{kind:'signal',dist:Math.max(0,(entry-t.position)*d),end:entry,block:k,by:occ.get(k)};}}return{kind:'signal',dist:null,end:null};}
 log(level,line,train,text){const ev={time:clock279(this.e),t:this.e.time,level,line,train,text,id:this.nextId++};this.events.unshift(ev);if(this.events.length>200)this.events.length=200;return ev;}
 // Cambiar de régimen solo con el tren detenido (regla del escenario).
 setMode(id,mode){const t=this.e.trains.find(x=>x.id===id);if(!t||!MODES279[mode])return{ok:false,why:'Tren o régimen no válido'};if(t.speed>.3)return{ok:false,why:'Cambia el régimen con el tren detenido'};if(this.atp.get(id)?.braking)return{ok:false,why:'Primero rearma el ATP'};const old=this.mode(t);if(old===mode)return{ok:true};this.modes.set(id,mode);this.log('info',t.line,id,`Régimen ${MODES279[old].short} → ${MODES279[mode].short} (${MODES279[mode].name})`);return{ok:true};}
 trip(id,reason,level='critical'){const t=this.e.trains.find(x=>x.id===id);if(!t)return false;if(this.atp.get(id)?.braking)return false;this.atp.set(id,{braking:true,reason,since:this.e.time});this.log(level,t.line,id,`${reason}: freno de urgencia aplicado a ${Math.round(kmh(t.speed))} km/h`);return true;}
 // Ejercicio: el conductor de un tren en CMC o CML se pasa del límite.
 overspeed(id){const t=this.e.trains.find(x=>x.id===id);if(!t)return{ok:false,why:'Tren no encontrado'};const m=this.mode(t);if(m==='PA')return{ok:false,why:'En PA el sistema no excede su perfil. Pon el tren en CMC o CML.'};if(t.wait>0||t.speed<2)return{ok:false,why:'El tren debe ir en marcha'};const lim=this.limitKmh(t);t.speed=ms(lim+ASSUMED279.atpTolerance+8);this.log('alarm',t.line,id,`Ejercicio: el conductor acelera a ${Math.round(kmh(t.speed))} km/h con límite de ${Math.round(lim)} km/h`);return{ok:true};}
 deadman(id){const t=this.e.trains.find(x=>x.id===id);if(!t)return{ok:false,why:'Tren no encontrado'};if(this.mode(t)==='PA')return{ok:false,why:'El hombre muerto se vigila en conducción manual (CMC o CML)'};if(t.wait>0)return{ok:false,why:'El tren debe ir en marcha'};this.trip(id,'Hombre muerto: manipulador soltado');return{ok:true};}
 rearm(id){const t=this.e.trains.find(x=>x.id===id),a=this.atp.get(id);if(!t||!a?.braking)return{ok:false,why:'No hay freno de urgencia que rearmar'};if(t.speed>.1)return{ok:false,why:'Espera a que el tren se detenga'};this.atp.delete(id);this.log('info',t.line,id,'ATP rearmado desde el P.C.C.; el tren puede continuar');return{ok:true};}
 addLtv(line,fromStation,toStation,kmhLimit){const L=this.e.lines[line];if(!L)return null;const a=Math.min(fromStation,toStation),b=Math.max(fromStation,toStation);if(a===b)return null;const r={id:'LTV'+this.nextId,line,from:L.distances[a],to:L.distances[b],kmh:kmhLimit,label:`${L.stations[a].nombre} – ${L.stations[b].nombre}`};this.ltv.push(r);this.log('alarm',line,null,`Restricción temporal de ${kmhLimit} km/h entre ${r.label}`);return r;}
 removeLtv(id){const i=this.ltv.findIndex(r=>r.id===id);if(i<0)return false;const[r]=this.ltv.splice(i,1);this.log('info',r.line,null,`Se levanta la restricción entre ${r.label}`);return true;}
 setRegulation(line,on,target){const R=this.reg[line];if(!R)return;if(target)R.target=target;if(R.on!==on){R.on=on;this.log('info',line,null,on?`Regulación automática del intervalo activa (${R.target} s)`:'Regulación automática desactivada');}}
 // Intervalo medio de las últimas salidas en cada sentido.
 interval(line,dir){const a=this.intervals[line]?.[dir]||[];if(a.length<2)return null;const s=a.slice(-6);return s.reduce((x,y)=>x+y,0)/s.length;}
 // Una vez por paso del motor.
 step(){const e=this.e;
  if(this.prevEmergency!==e.emergency){this.log(e.emergency?'critical':'info',null,null,e.emergency?'Freno de emergencia general aplicado desde el P.C.C.':'Freno de emergencia general liberado');this.prevEmergency=e.emergency;}
  for(const l of this.lines)if(this.prevPower[l]!==e.power[l]){this.log(e.power[l]?'info':'critical',l,null,e.power[l]?'Tensión de tracción restablecida':'Corte de tensión de tracción en toda la línea');this.prevPower[l]=e.power[l];}
  for(const t of e.trains){if(!this.lines.includes(t.line))continue;const p=this.prev.get(t.id)||{wait:t.wait,target:t.target,stuck:0,alarmed:false};
   // ATP: supervisa CMC y CML.
   const m=this.mode(t);if(m!=='PA'&&!this.atp.get(t.id)?.braking&&t.wait<=0){const lim=this.limitKmh(t);if(kmh(t.speed)>lim+ASSUMED279.atpTolerance)this.trip(t.id,`ATP: sobrevelocidad (${Math.round(kmh(t.speed))} km/h, límite ${Math.round(lim)} km/h)`);}
   // Salidas de estación: intervalo y regulación.
   if(p.wait>0&&t.wait<=0){const key=t.line+':'+p.target+':'+(t.direction||1),last=this.departures.get(key);if(last!=null){const gap=e.time-last,list=this.intervals[t.line][t.direction||1];list.push(gap);if(list.length>20)list.shift();}this.departures.set(key,e.time);}
   const R=this.reg[t.line];if(R?.on&&t.wait>0&&t.wait<.6&&!t.reg279){const key=t.line+':'+t.target+':'+(t.direction||1),last=this.departures.get(key);if(last!=null){const gap=e.time-last,need=R.target*.9-gap;if(need>1){const hold=Math.min(ASSUMED279.maxRegulationHold,need);t.wait+=hold;t.reg279=true;const s=e.lines[t.line].stations[t.target]?.nombre||'';this.log('info',t.line,t.id,`Regulación: retiene ${Math.round(hold)} s en ${s} para no alcanzar al tren anterior (salió hace ${Math.round(gap)} s)`);}}}
   if(t.wait<=0)t.reg279=false;
   // Tren detenido entre estaciones.
   if(t.wait<=0&&t.speed<.1){p.stuck+=e.time-(p.t??e.time);if(p.stuck>ASSUMED279.stuckSeconds&&!p.alarmed){p.alarmed=true;const why=this.atp.get(t.id)?.braking?this.atp.get(t.id).reason:this.authority(t)?.kind==='signal'&&this.authority(t).dist!=null&&this.authority(t).dist<40?'detenido ante señal en rojo':!e.power[t.line]?'sin tensión':'causa no identificada';this.log('alarm',t.line,t.id,`Tren detenido más de ${ASSUMED279.stuckSeconds} s entre estaciones (${why})`);}}else{p.stuck=0;p.alarmed=false;}
   p.wait=t.wait;p.target=t.target;p.t=e.time;this.prev.set(t.id,p);}}
 // Resumen para la consola.
 rows(line){return this.e.trains.filter(t=>t.line===line).map(t=>{const lim=this.limitKmh(t,true),auth=this.authority(t),atp=this.atp.get(t.id),d=t.direction||1;let ahead=null;for(const o of this.e.trains){if(o===t||o.line!==t.line||(o.direction||1)!==d)continue;const gap=(o.position-t.position)*d;if(gap>0&&(ahead==null||gap<ahead.gap))ahead={id:o.id,gap};}
  return{id:t.id,model:t.model,mode:this.mode(t),speed:kmh(t.speed),limit:lim.kmh,limitBy:lim.parts.at(-1)?.[0]||'',auth,atp,ahead,inStation:t.wait>0,station:this.e.lines[line].stations[t.wait>0?t.target:t.target]?.nombre,state:atp?.braking?'Freno de urgencia':t.state,dir:d};});}
}
