import {ASSUMED245,DOCUMENTED245,tractionCap248,FORMATION245} from './electric-dashboard245.js?v=255';
import {inlineSvg256} from './grid-substation256.js?v=263';

// Dinámica y frenado 257. Pestaña nueva del análisis eléctrico con los temas de la presentación
// que el simulador calculaba por dentro pero no mostraba: la curva de esfuerzo tractor contra
// velocidad, la resistencia al avance con pendiente, el límite de adherencia en vía seca y mojada,
// el freno combinado (eléctrico y de fricción), a dónde va la energía del frenado (barra guía o
// resistencias) y la distancia de detención con la curva de protección ATP.
// Todo se calcula a partir del tren que se sigue; no cambia su movimiento (engine.js no se toca).

export const SOURCES257=Object.freeze({
 en50163:{title:'EN 50163: tensiones de alimentación de los sistemas de tracción',publisher:'Railway News',url:'https://railwaynews.net/en-50163-railway-applications-supply-voltages-of-traction-systems-standard.html',note:'Sistema de 750 V CD: mínima permanente 500 V, máxima permanente 900 V, máxima de corta duración 1,000 V.'},
 rubber:{title:'Rubber-tyred metro',publisher:'Wikipedia',url:'https://en.wikipedia.org/wiki/Rubber-tyred_metro',note:'El neumático tiene mejor adherencia que la rueda de acero, frena en menos distancia y sube pendientes de hasta cerca de 13 %, a cambio de más resistencia a la rodadura.'}
});
// Teaching assumptions, editable on screen.
export const ASSUMED257=Object.freeze({
 muDry:.7,muWet:.4,muSteelDry:.25,  // rubber on dry / wet track, steel for comparison
 fadeKmh:7,                         // electric brake fades out below this speed
 vMax1:900,                         // V, highest permanent voltage (EN 50163)
 reaction:1.5,overlap:20,           // s and m for the ATP curve
 rainDecel:1.2,                     // m/s² service braking assumed in rain
 emergency:2                        // m/s², emergency braking of the simulator (engine.js)
});
const g=9.81;
export const MOTOR_SHARE257=FORMATION245.filter(k=>k==='M'||k==='N').length/FORMATION245.length; // 6/9

// Running resistance used by the simulator (N): rolling + aerodynamic, plus grade (‰).
export function resistance257(v,massT,grade=0,p=ASSUMED245){return massT*p.rollingNPerT+p.aeroNPerMs2*v*v+massT*1000*g*grade/1000;}
export function adhesionLimit257(massT,mu){return mu*massT*1000*MOTOR_SHARE257*g;}
// Force the tyres can actually transmit: the smaller of the traction chain and the adhesion.
export function usableForce257(v,massT,mu,p=ASSUMED245){return Math.min(tractionCap248(v,p),adhesionLimit257(massT,mu));}
export function maxAccel257(v,massT,mu,grade=0,p=ASSUMED245){return (usableForce257(v,massT,mu,p)-resistance257(v,massT,grade,p))/(massT*1000*p.rotating);}
// Blended braking for a requested deceleration b: electric first, friction for the rest.
export function blend257(v,massT,b,{fadeKmh=ASSUMED257.fadeKmh}={},p=ASSUMED245){
 const need=massT*1000*p.rotating*b,byPower=v>.1?p.maxKW*1000/v:Infinity,byCurrent=p.forcePerA*p.motorLimitA,fade=Math.min(1,Math.max(0,v*3.6/fadeKmh));
 const electric=Math.min(need,byPower,byCurrent)*fade;return{need,electric,friction:need-electric,share:need?electric/need:0};}
// Where the braking power goes: back to the guide bar while the line voltage stays at or below
// the permanent maximum, otherwise into the on-board resistors.
export function brakeDestination257(Pkw,{receptive=true,V0=DOCUMENTED245.nominalV,R=ASSUMED245.lineOhm,vMax=ASSUMED257.vMax1}={}){
 if(Pkw<=0)return{regen:0,rheo:0,V:V0};if(!receptive)return{regen:0,rheo:Pkw,V:V0};
 // Returning P raises the voltage: V² − V0·V − R·P = 0. Limit the returned power to keep V ≤ vMax.
 const P=Pkw*1000,V=(V0+Math.sqrt(V0*V0+4*R*P))/2;if(V<=vMax)return{regen:Pkw,rheo:0,V};
 const Pmax=vMax*(vMax-V0)/R/1000;return{regen:Pmax,rheo:Pkw-Pmax,V:vMax};}
// Stopping distance and the ATP intervention speed.
export function stoppingDistance257(v,b,{reaction=ASSUMED257.reaction,overlap=ASSUMED257.overlap}={}){return v*reaction+v*v/(2*b)+overlap;}
export function serviceCurve257(d,b){return Math.sqrt(2*b*Math.max(0,d));}
export function atpCurve257(d,b,{reaction=ASSUMED257.reaction,overlap=ASSUMED257.overlap}={}){const D=Math.max(0,d+overlap);return -b*reaction+Math.sqrt(b*b*reaction*reaction+2*b*D);}
// Equilibrium cant for a curve (mm): h = 11.8·V²/R, with V in km/h and R in m.
export function cant257(kmh,R){return 11.8*kmh*kmh/R;}
// The simulator's own service braking and acceleration per line (engine.js).
export const ENGINE_RATES257=Object.freeze({1:{b:1.8,a:1.4},8:{b:1.2,a:1}});

const fmt=(x,d=0)=>Number(x).toLocaleString('es-MX',{maximumFractionDigits:d,minimumFractionDigits:d});
const srcs=(...ids)=>`<p class="dy257-src">Fuentes: ${ids.map(id=>`<a href="${SOURCES257[id].url}" target="_blank" rel="noopener">${SOURCES257[id].publisher}</a>`).join(' · ')}</p>`;

export class TrainDynamics257{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.grade=0;this.track='auto';this.receptive='auto';this.rainDecel=ASSUMED257.rainDecel;this.curveR=300;this.muWet=ASSUMED257.muWet;this.prevSpeeds=new Map();this.brake={regen:0,rheo:0};
  const dash=win.electricDashboard245;this.dash=dash;const root=dash?.root;if(!root)return;
  const tabs=root.querySelector('.ed245-tabs');this.tab=doc.createElement('button');this.tab.type='button';this.tab.setAttribute('role','tab');this.tab.dataset.ed245Tab='dyn257';this.tab.setAttribute('aria-selected','false');this.tab.textContent='Dinámica y frenado';tabs?.append(this.tab);
  this.tab.onclick=()=>dash.showTab('dyn257');
  this.pane=doc.createElement('div');this.pane.dataset.ed245Pane='dyn257';this.pane.hidden=true;this.pane.className='dy257';
  this.pane.innerHTML=`<p class="ed245-hint">Calculado sobre el tren que sigues. No cambia cómo se mueve: muestra lo que su tracción, sus neumáticos y sus frenos pueden hacer en este momento.</p>
<h4>Esfuerzo, resistencia y adherencia</h4>
<div class="dy257-row"><label>Pendiente <input type="range" min="-40" max="40" step="5" value="0" data-dy257-grade><output data-dy257-grade-out></output></label><label>Vía <select data-dy257-track><option value="auto">Según el clima del simulador</option><option value="dry">Seca</option><option value="wet">Mojada</option></select></label><label>μ mojado <input type="range" min=".15" max=".6" step=".05" value="${ASSUMED257.muWet}" data-dy257-mu><output data-dy257-mu-out></output></label></div>
<svg viewBox="0 0 460 250" class="dy257-chart" data-dy257-effort></svg><div class="dy257-tiles" data-dy257-effort-tiles></div>
<h4>Freno combinado y destino de la energía</h4>
<div class="dy257-row"><label>Línea receptiva <select data-dy257-receptive><option value="auto">Según trenes acelerando cerca</option><option value="yes">Sí</option><option value="no">No</option></select></label></div>
<svg viewBox="0 0 460 210" class="dy257-chart" data-dy257-blend></svg><div class="dy257-tiles" data-dy257-blend-tiles></div>
<h4>Distancia de detención y curva ATP</h4>
<div class="dy257-row"><label>Desaceleración con lluvia (m/s²) <input type="range" min=".6" max="1.8" step=".1" value="${this.rainDecel}" data-dy257-rain><output data-dy257-rain-out></output></label><label>Radio de curva (m) <input type="range" min="100" max="1000" step="50" value="300" data-dy257-radius><output data-dy257-radius-out></output></label></div>
<svg viewBox="0 0 460 240" class="dy257-chart" data-dy257-atp></svg><div class="dy257-tiles" data-dy257-atp-tiles></div>
<details class="ed245-notes"><summary>Supuestos y fuentes de esta pestaña</summary><p>Resistencia al avance del simulador: ${ASSUMED245.rollingNPerT} N/t de rodadura más ${ASSUMED245.aeroNPerMs2} N/(m/s)² aerodinámica (forma de Davis con B = 0); la pendiente suma m·g·i. Adherencia supuesta del neumático: μ = ${ASSUMED257.muDry} en seco y ${ASSUMED257.muWet} mojado, con el peso de los ${FORMATION245.filter(k=>k==='M'||k==='N').length} carros motrices (${fmt(MOTOR_SHARE257*100)} % de la masa); el acero en seco (μ ≈ ${ASSUMED257.muSteelDry}) se muestra solo para comparar. El freno eléctrico se desvanece debajo de ${ASSUMED257.fadeKmh} km/h y la fricción completa la parada (supuesto). La energía regresa a la barra guía mientras la tensión no pase de ${ASSUMED257.vMax1} V (máxima permanente de EN 50163); el resto se quema en resistencias. Frenado de servicio del simulador: 1.8 m/s² en Línea 1 y 1.2 m/s² en Línea 8. Curva ATP con el frenado de emergencia del simulador (${ASSUMED257.emergency} m/s²), tiempo de reacción de ${ASSUMED257.reaction} s y margen de ${ASSUMED257.overlap} m (supuestos de la presentación). Peralte de equilibrio h = 11.8·V²/R (fórmula ferroviaria de referencia).</p>${srcs('en50163','rubber')}</details>`;
  root.querySelector('[data-ed245-pane="weight"]')?.after?.(this.pane)??root.append(this.pane);
  const $=s=>this.pane.querySelector(s);this.$=$;
  $('[data-dy257-grade]').addEventListener('input',e=>{this.grade=+e.target.value;this.render();});
  $('[data-dy257-mu]').addEventListener('input',e=>{this.muWet=+e.target.value;this.render();});
  $('[data-dy257-track]').addEventListener('change',e=>{this.track=e.target.value;this.render();});
  $('[data-dy257-receptive]').addEventListener('change',e=>{this.receptive=e.target.value;this.render();});
  $('[data-dy257-rain]').addEventListener('input',e=>{this.rainDecel=+e.target.value;this.render();});
  $('[data-dy257-radius]').addEventListener('input',e=>{this.curveR=+e.target.value;this.render();});
  this.timer=win.setInterval?.(()=>{if(!this.pane.hidden)this.render();},250);
 }
 read(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const op=e.operator,t=e.trains?.find(x=>op?x.id===op.trainId:x.id===s.selectedTrain);if(!t)return null;return{s,e,t};}
 wet(e){return this.track==='wet'||(this.track==='auto'&&e?.weather==='rain');}
 // Trains of the same line, within 2 km and gaining speed, can take regenerated energy.
 nearbyTraction(e,t){let n=0;for(const o of e.trains||[]){if(o===t||o.line!==t.line)continue;const prev=this.prevSpeeds.get(o.id);this.prevSpeeds.set(o.id,o.speed);if(prev!=null&&o.speed>prev+1e-3&&Math.abs(o.position-t.position)<2000)n++;}return n;}
 render(){
  const r=this.read(),st=this.dash?.state;const v=r?.t.speed||0,massT=st?.massT??DOCUMENTED245.emptyT,wet=this.wet(r?.e),mu=wet?this.muWet:ASSUMED257.muDry;
  this.$('[data-dy257-mu-out]').textContent=fmt(this.muWet,2);this.$('[data-dy257-grade-out]').textContent=`${this.grade>0?'+':''}${this.grade} ‰`;
  // Effort chart.
  const X=k=>40+400*k/90,Yf=F=>220-200*F/800e3;let grid='';for(const k of[0,20,40,60,80])grid+=`<line x1="${X(k)}" x2="${X(k)}" y1="20" y2="220" stroke="#ffffff1c"/><text x="${X(k)}" y="236" fill="#93a39d" font-size="10" text-anchor="middle">${k} km/h</text>`;
  for(const F of[0,200e3,400e3,600e3,800e3])grid+=`<line x1="40" x2="440" y1="${Yf(F)}" y2="${Yf(F)}" stroke="#ffffff1c"/><text x="35" y="${Yf(F)+3}" fill="#93a39d" font-size="10" text-anchor="end">${F/1000} kN</text>`;
  const path=f=>{let d='';for(let k=0;k<=90;k+=1){const y=Math.max(10,Math.min(225,Yf(f(k/3.6))));d+=`${k?'L':'M'}${X(k).toFixed(1)},${y.toFixed(1)}`;}return d;};
  const adhD=adhesionLimit257(massT,ASSUMED257.muDry),adhW=adhesionLimit257(massT,this.muWet);
  const Fnow=st?(st.delivered>0?st.delivered:st.force<0?-st.force:0):0;
  this.$('[data-dy257-effort]').innerHTML=inlineSvg256(`${grid}<line x1="40" x2="440" y1="${Yf(Math.min(adhD,790e3))}" y2="${Yf(Math.min(adhD,790e3))}" stroke="#2e9d55" stroke-dasharray="6 4"/><text x="438" y="${Yf(Math.min(adhD,790e3))-4}" fill="#5fd38a" font-size="10" text-anchor="end">adherencia en seco ${fmt(adhD/1000)} kN</text><line x1="40" x2="440" y1="${Yf(adhW)}" y2="${Yf(adhW)}" stroke="#d64541" stroke-dasharray="6 4"/><text x="438" y="${Yf(adhW)-4}" fill="#ff7b6b" font-size="10" text-anchor="end">adherencia mojada ${fmt(adhW/1000)} kN</text><path d="${path(u=>tractionCap248(u))}" fill="none" stroke="#ff7a2f" stroke-width="3"/><text x="${X(8)}" y="${Yf(tractionCap248(1))-6}" fill="#ffb07a" font-size="10">esfuerzo máximo de tracción</text><path d="${path(u=>Math.max(0,resistance257(u,massT,this.grade)))}" fill="none" stroke="#39a7ff" stroke-width="3"/><text x="${X(62)}" y="${Yf(Math.max(0,resistance257(62/3.6,massT,this.grade)))-6}" fill="#8fcaff" font-size="10">resistencia al avance</text>${r?`<circle cx="${X(v*3.6)}" cy="${Yf(Fnow)}" r="6" fill="#ffd34d" stroke="#1d1006"/>`:''}`);
  const usable=usableForce257(v,massT,mu),acc=maxAccel257(v,massT,mu,this.grade),slip=st&&st.force>adhesionLimit257(massT,mu);
  this.$('[data-dy257-effort-tiles]').innerHTML=`<span><small>Fuerza que pueden transmitir los neumáticos</small><b>${fmt(usable/1000)} kN</b>${wet?'vía mojada':'vía seca'} · μ = ${mu}</span><span class="${acc<0?'bad':''}"><small>Aceleración posible ahora</small><b>${fmt(acc,2)} m/s²</b>${acc<0?'la pendiente gana: el tren no puede acelerar':'a '+fmt(v*3.6)+' km/h con '+fmt(massT,1)+' t'}</span><span class="${slip?'bad':'ok'}"><small>Patinaje</small><b>${slip?'Patinaría':'Sin riesgo'}</b>${slip?'pide más fuerza de la que agarra el neumático: el antipatinaje la recorta':'la fuerza pedida está bajo el límite de adherencia'}</span>`;
  // Blended braking chart for a stop from 80 km/h at the line's service rate.
  const line=r?.t.line??1,b=ENGINE_RATES257[line]?.b??1.8;const Xb=k=>40+400*(80-k)/80,Yb=F=>190-170*F/700e3;let gb='';
  for(const k of[80,60,40,20,0])gb+=`<text x="${Xb(k)}" y="205" fill="#93a39d" font-size="10" text-anchor="middle">${k} km/h</text><line x1="${Xb(k)}" x2="${Xb(k)}" y1="20" y2="190" stroke="#ffffff1c"/>`;
  let pe='',pf='';for(let k=80;k>=0;k-=1){const x=blend257(k/3.6,massT,b);pe+=`${k===80?'M':'L'}${Xb(k).toFixed(1)},${Yb(x.electric).toFixed(1)}`;pf+=`${k===80?'M':'L'}${Xb(k).toFixed(1)},${Yb(x.need).toFixed(1)}`;}
  const now=blend257(v,massT,b);
  this.$('[data-dy257-blend]').innerHTML=inlineSvg256(`${gb}<path d="${pf}L${Xb(0)},190L${Xb(80)},190Z" fill="#7c8580" stroke="none"/><path d="${pe}L${Xb(0)},190L${Xb(80)},190Z" fill="#ff7a2f" stroke="none"/><text x="${Xb(74)}" y="182" fill="#1d1006" font-size="11">eléctrico</text><text x="${Xb(5)}" y="${Yb(blend257(1,massT,b).need)-6}" fill="#c9d1cd" font-size="11" text-anchor="end">fricción</text>${r&&v>.2?`<line x1="${Xb(Math.min(80,v*3.6))}" x2="${Xb(Math.min(80,v*3.6))}" y1="20" y2="190" stroke="#ffd34d" stroke-width="2"/>`:''}`);
  const near=r?this.nearbyTraction(r.e,r.t):0,receptive=this.receptive==='yes'||(this.receptive==='auto'&&near>0);
  const braking=st&&st.brakeKW>0,dest=brakeDestination257(braking?st.brakeKW:ASSUMED245.maxKW*.8,{receptive});
  this.$('[data-dy257-blend-tiles]').innerHTML=`<span><small>Reparto ${braking?'ahora':'a esta velocidad'}</small><b>${fmt(now.share*100)} % eléctrico</b>${v*3.6<ASSUMED257.fadeKmh?'a baja velocidad solo queda la fricción':'la fricción completa el resto'}</span><span class="${receptive?'ok':'warn'}"><small>Línea receptiva</small><b>${receptive?'Sí':'No'}</b>${this.receptive==='auto'?`${near} tren${near===1?'':'es'} acelerando a menos de 2 km`:'elegido a mano'}</span><span><small>${braking?'Potencia de frenado ahora':'Ejemplo con '+fmt(ASSUMED245.maxKW*.8)+' kW'}</small><b>${fmt(dest.regen)} kW a la barra</b>${fmt(dest.rheo)} kW a resistencias · ${fmt(dest.V)} V en el tren</span>`;
  // ATP chart: distance to the next stop.
  const dist=r?Math.abs((r.e.lines?.[line]?.distances?.[r.t.target]??r.t.position)-r.t.position):0,span=Math.max(400,Math.min(1600,Math.ceil((dist+50)/200)*200));
  const Xa=d=>40+400*(1-d/span),Ya=k=>220-196*k/100,lim=(r?.e?.speedLimit?.(r.t)??80)/3.6;let ga='';for(let i=0;i<=4;i++){const d=span*i/4;ga+=`<text x="${Xa(d)}" y="236" fill="#93a39d" font-size="10" text-anchor="middle">${fmt(d)} m</text><line x1="${Xa(d)}" x2="${Xa(d)}" y1="20" y2="220" stroke="#ffffff1c"/>`;}
  for(const k of[0,25,50,75,100])ga+=`<text x="35" y="${Ya(k)+3}" fill="#93a39d" font-size="10" text-anchor="end">${k}</text>`;
  const pa=(f)=>{let d='';for(let i=0;i<=120;i++){const x=span*i/120;d+=`${i?'L':'M'}${Xa(x).toFixed(1)},${Math.max(22,Ya(Math.min(100,f(x)*3.6))).toFixed(1)}`;}return d;};
  const rainB=Math.min(b,this.rainDecel);
  this.$('[data-dy257-atp]').innerHTML=inlineSvg256(`${ga}<path d="${pa(d=>atpCurve257(d,ASSUMED257.emergency))}" fill="none" stroke="#d64541" stroke-width="2.5" stroke-dasharray="7 4"/><path d="${pa(d=>Math.min(lim,serviceCurve257(d,b)))}" fill="none" stroke="#2e9d55" stroke-width="3"/><path d="${pa(d=>Math.min(lim,serviceCurve257(d,rainB)))}" fill="none" stroke="#39a7ff" stroke-width="2.5"/><text x="44" y="14" fill="#ff7b6b" font-size="10">- - ATP, emergencia ${ASSUMED257.emergency} m/s²</text><text x="215" y="14" fill="#5fd38a" font-size="10">— servicio ${b} m/s²</text><text x="330" y="14" fill="#8fcaff" font-size="10">— lluvia ${fmt(rainB,1)} m/s²</text>${r?`<circle cx="${Xa(Math.min(span,dist))}" cy="${Ya(v*3.6)}" r="6" fill="#ffd34d" stroke="#1d1006"/>`:''}`);
  this.$('[data-dy257-rain-out]').textContent=fmt(this.rainDecel,1);this.$('[data-dy257-radius-out]').textContent=fmt(this.curveR);
  const over=v>atpCurve257(dist,ASSUMED257.emergency)+.01;
  this.$('[data-dy257-atp-tiles]').innerHTML=`<span><small>Distancia a la parada</small><b>${fmt(dist)} m</b>a ${fmt(v*3.6)} km/h</span><span><small>Distancia de detención</small><b>${fmt(stoppingDistance257(v,b))} m</b>seco · con lluvia ${fmt(stoppingDistance257(v,rainB))} m</span><span class="${over?'bad':'ok'}"><small>ATP</small><b>${over?'Intervención':'Dentro de la curva'}</b>${over?'frenado de emergencia':'reacción '+ASSUMED257.reaction+' s + margen '+ASSUMED257.overlap+' m'}</span><span><small>Peralte de equilibrio</small><b>${fmt(cant257(Math.max(v*3.6,30),this.curveR))} mm</b>a ${fmt(Math.max(v*3.6,30))} km/h en R = ${fmt(this.curveR)} m</span>`;
  return{v,massT,mu,usable,acc,dest,dist};}
 dispose(){this.win.clearInterval?.(this.timer);this.tab?.remove();this.pane?.remove();}
}
export function installTrainDynamics257(doc=document,win=window){if(win.trainDynamics257)return win.trainDynamics257;return win.trainDynamics257=new TrainDynamics257(doc,win);}
