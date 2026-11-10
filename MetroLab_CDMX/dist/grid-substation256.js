import * as THREE from 'three';

// Red y protecciones 256. Lleva al simulador los temas de alimentación de la presentación que la
// planta 3D no explicaba: de dónde viene la energía (subestación de alta tensión encapsulada en SF6
// del proyecto Metro-Energía), cómo llega por la red de 15 kV a cada subestación rectificadora,
// el factor de potencia, la densidad del SF6 en las celdas, la protección de sobrecorriente 50/51,
// el calentamiento del transformador con su ventilación y las pérdidas en los diodos.
// Cada dato lleva su fuente; lo que no tiene fuente se marca como supuesto del modelo y se puede
// cambiar en pantalla. Nada de esto modifica el movimiento de los trenes.

export const SOURCES256=Object.freeze({
 seat:{title:'Inauguran CFE y CDMX subestación para el Metro capitalino',publisher:'Energía a Debate',url:'https://energiaadebate.com/inauguran-cfe-y-cdmx-subestacion-para-el-metro-capitalino',note:'GIS de 230 kV aislada en SF6 con siete bahías, cuatro transformadores de 60 MVA, 75 interruptores de 15 kV; alimenta las líneas 1, 2 y 3 a través de sus subestaciones rectificadoras.'},
 chilango:{title:'Así es la nueva subestación eléctrica del Metro para las Líneas 1, 2 y 3',publisher:'Chilango',url:'https://www.chilango.com/noticias/nueva-subestacion-electrica-del-metro/',note:'230/15 kV, encapsulada en hexafluoruro de azufre; galerías subterráneas de cableado del proyecto Metro-Energía.'},
 sf6:{title:'NIA SF6 literature review',publisher:'Western Power Distribution',url:'https://www.westernpower.co.uk/downloads/5857/nia-sf6-literature-review.pdf',note:'Rigidez dieléctrica ≈ 2.5 veces la del aire a presión atmosférica, extinción rápida del arco, GWP de 23,900 a 100 años, vida atmosférica de 3,200 años y subproductos del arco (HF, SOF2, SO2, S2F10…).'},
 density:{title:'Gas density monitor GDM-100',publisher:'WIKA',url:'https://www.wika.com/en-us/gdm_100.WIKA',note:'El densímetro está compensado en temperatura e indica la densidad como presión referida a 20 °C; sus contactos avisan cuando una fuga la baja de los límites definidos.'},
 grid:{title:'Código de Red: factor de potencia en centros de carga',publisher:'Circutor México (resumen del acuerdo CRE A/073/2023)',url:'https://circutor.com/mx/wp-json/wp/v2/posts/54071',note:'Centros de carga de 1 MW o más: factor de potencia mínimo de 0.95 desde 2024 (antes 0.90); se anuncia 0.97 para 2026.'},
 iec:{title:'IEC 60255-151 · curva de tiempo inverso normal',publisher:'IEC (ecuación publicada de la norma)',url:'https://webstore.iec.ch/en/publication/2614',note:'t = TMS · 0.14 / ((I/Is)^0.02 − 1) para la característica inversa normal (Standard Inverse).'},
 trihal:{title:'Thermal protection settings for Trihal transformers',publisher:'Schneider Electric · FAQ FA327260',url:'https://www.se.com/za/en/faqs/FA327260',note:'Transformador seco clase F: 140 °C para la alarma 1 y 150 °C para la alarma 2.'},
 fans:{title:'Forced ventilation on TRIHAL dry-type transformers',publisher:'Schneider Electric · FAQ FA32903',url:'https://www.se.com/nl/en/faqs/FA32903/',note:'La ventilación forzada permite un aumento temporal de potencia del 40 %.'}
});

export const SEAT256=Object.freeze({kvHigh:230,kvMedium:15,bays:7,transformers:4,mvaEach:60,mvBreakers:75,lines:'1, 2 y 3'});
// Assumptions of the teaching model, shown on screen.
export const ASSUMED256=Object.freeze({
 sf6Alarm:.9,sf6Block:.85,          // fraction of rated density (to confirm with the switchgear maker)
 fanOn:110,fanOff:100,               // °C, ventilation start/stop
 alarm1:140,alarm2:150,              // °C, Schneider FAQ for class F
 riseRated:100,exponent:1.6,tauMin:40,ambient:30, // winding rise at rated load (K), exponent, time constant
 fanBoost:1.4,                       // forced air: +40 %
 vf0:.9,rd:.0004,                    // diode threshold (V) and slope resistance (Ω)
 ringNodes:6
});

// ---------- Pure calculations (tested) ----------
export function powerFactor256(P,Q,kv=SEAT256.kvMedium){const S=Math.hypot(P,Q),fp=S?P/S:1;return{S,fp,I:S*1e6/(Math.sqrt(3)*kv*1e3),okGrid:fp>=.95};}
// IEC standard inverse with instantaneous element (50). Returns seconds, 0 for instantaneous, Infinity below pickup.
export function relayTime256(I,{Is=400,tms=.2,inst=4000}={}){if(inst&&I>=inst)return 0;const m=I/Is;if(m<=1)return Infinity;return tms*.14/(Math.pow(m,.02)-1);}
// Steady winding temperature for a per-unit load with or without forced air.
export function windingSteady256(K,fans,a=ASSUMED256){const k=Math.max(0,K)/(fans?a.fanBoost:1);return a.ambient+a.riseRated*Math.pow(k,a.exponent);}
export class TransformerThermal256{
 constructor(a=ASSUMED256){this.a=a;this.reset();}
 reset(){this.theta=this.a.ambient+20;this.fans=false;this.tripped=false;this.alarm=0;this.log=[];this.t=0;}
 // dt in model minutes.
 step(K,dt,{fanFail=false}={}){const a=this.a;const load=this.tripped?0:K;
  if(!fanFail){if(this.theta>=a.fanOn)this.fans=true;else if(this.theta<=a.fanOff)this.fans=false;}else this.fans=false;
  const target=windingSteady256(load,this.fans,a);this.theta+= (target-this.theta)*(1-Math.exp(-dt/a.tauMin));this.t+=dt;
  const prev=this.alarm;this.alarm=this.theta>=a.alarm2?2:this.theta>=a.alarm1?1:0;if(this.alarm===2)this.tripped=true;
  if(this.alarm!==prev)this.log.push({t:this.t,alarm:this.alarm});return this;}
}
// Two six-pulse bridges in parallel: each diode conducts 120° of its bridge's half of Id.
export function diodeLosses256(Id,{vf0=ASSUMED256.vf0,rd=ASSUMED256.rd,diodes=12}={}){const avg=Id/6,rms=Id/(2*Math.sqrt(3)),each=vf0*avg+rd*rms*rms;return{avg,rms,each,total:each*diodes,share:Id?each*diodes/(750*Id):0};}
export function sf6State256(rho,a=ASSUMED256){return rho<=a.sf6Block?'block':rho<=a.sf6Alarm?'alarm':'ok';}
// Ring of N substations fed at node 0 and node N/2; open segments are given by index (segment i joins i and i+1).
export function ringFed256(n,open=new Set(),sources=[0,Math.floor(n/2)],dead=new Set()){
 const fed=new Set();const stack=sources.filter(s=>!dead.has(s));
 while(stack.length){const v=stack.pop();if(fed.has(v))continue;fed.add(v);for(const [w,seg] of[[(v+1)%n,v],[(v-1+n)%n,(v-1+n)%n]])if(!open.has(seg)&&!fed.has(w))stack.push(w);}
 return fed;}

// ---------- SF6 density gauges on the MT cells ----------
export function addSf6Gauges256(model,parts){
 if(!model||model.userData.sf6Gauges256)return model?.userData.sf6Gauges256||[];const mt=parts?.get?.('mt');if(!mt)return[];
 const anchors=model.userData.sf6Anchors256||[];const gauges=[];
 const face=new THREE.MeshStandardMaterial({name:'Carátula SF6 256',color:'#f1f3ee',roughness:.5});
 const body=new THREE.MeshStandardMaterial({name:'Caja densímetro 256',color:'#22272a',metalness:.4,roughness:.45});
 const needleM=new THREE.MeshBasicMaterial({color:'#111'});
 const zone=(c)=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide});
 for(const [i,p] of anchors.entries()){
  const g=new THREE.Group();g.name='Densimetro_SF6_256';g.position.set(p.x,p.y,p.z);g.rotation.y=Math.PI;// face toward −z
  const can=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.045,28),body);can.rotation.x=Math.PI/2;g.add(can);
  const dial=new THREE.Mesh(new THREE.CircleGeometry(.066,32),face);dial.position.z=.024;g.add(dial);
  // Coloured arcs: red (block), yellow (alarm), green (rated).
  const arc=(from,to,c)=>{const m=new THREE.Mesh(new THREE.RingGeometry(.048,.06,24,1,from,to-from),zone(c));m.position.z=.0245;g.add(m);};
  arc(gaugeAngle256(1.1),gaugeAngle256(.92),'#2e9d55');arc(gaugeAngle256(.92),gaugeAngle256(.87),'#e8b32a');arc(gaugeAngle256(.87),gaugeAngle256(.7),'#d64541');
  const pivot=new THREE.Group();pivot.position.z=.026;const needle=new THREE.Mesh(new THREE.BoxGeometry(.004,.052,.002),needleM);needle.position.y=.024;pivot.add(needle);g.add(pivot);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.009,10,8),new THREE.MeshBasicMaterial({color:'#2e9d55'}));led.position.set(.055,-.055,.026);g.add(led);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.12,10),body);stem.position.set(0,-.1,0);g.add(stem);
  mt.add(g);gauges.push({group:g,pivot,led,cell:i,rho:1});
 }
 model.userData.sf6Gauges256=gauges;for(const x of gauges)setGauge256(x,1);return gauges;}
export function gaugeAngle256(rho){const u=(Math.min(1.1,Math.max(.7,rho))-.7)/.4;return Math.PI*(1.25-1.5*u);} // 225° (low, viewer's left) … −45° (high, viewer's right)
export function setGauge256(g,rho){g.rho=rho;g.pivot.rotation.z=gaugeAngle256(rho)-Math.PI/2;const s=sf6State256(rho);g.led.material.color.set(s==='ok'?'#2e9d55':s==='alarm'?'#e8b32a':'#d64541');return s;}
// Record gauge anchors (world space, before the cells are merged): one per MT cell, on top of the front edge.
export function recordSf6Anchors256(model,parts){
 const mt=parts?.get?.('mt');if(!mt)return[];model.updateMatrixWorld(true);const bases=[];mt.traverse(o=>{if(o.isMesh&&/^Gabinete_techo/.test(o.name))bases.push(new THREE.Box3().setFromObject(o));});
 bases.sort((a,b)=>a.min.x-b.min.x);const inv=mt.matrixWorld.clone().invert();
 const anchors=bases.map(b=>new THREE.Vector3((b.min.x+b.max.x)/2,b.max.y+.17,b.min.z+.06).applyMatrix4(inv));
 model.userData.sf6Anchors256=anchors.map(v=>({x:v.x,y:v.y,z:v.z}));return model.userData.sf6Anchors256;}

// The CAD views of the substation inject an unscoped <style> (line,circle,text) into the page, so
// presentation attributes would lose against it: inline styles keep these drawings readable.
export function inlineSvg256(h){return h.replace(/<(line|circle|path|rect|text)\b([^>]*?)(\/?)>/g,(m,tag,attrs,self)=>{let style='';const old=attrs.match(/\sstyle="([^"]*)"/);if(old){style=old[1].replace(/;?$/,';');attrs=attrs.replace(old[0],'');}
 attrs=attrs.replace(/\s(stroke|stroke-width|fill|stroke-dasharray|font-size|text-anchor)="([^"]*)"/g,(_,k,v)=>{if(v!=='')style+=`${k}:${/^[0-9.]+$/.test(v)&&(k==='font-size'||k==='stroke-width')?v+'px':v};`;return '';});
 return `<${tag}${attrs} style="${style}"${self}>`;});}
// ---------- Panel ----------
const fmt=(x,d=0)=>Number(x).toLocaleString('es-MX',{maximumFractionDigits:d,minimumFractionDigits:d});
const src=(...ids)=>`<p class="gp256-src">Fuentes: ${ids.map(id=>`<a href="${SOURCES256[id].url}" target="_blank" rel="noopener">${SOURCES256[id].publisher}</a>`).join(' · ')}</p>`;
const TABS256=[['red','Red de alta tensión'],['anillo','Red de 15 kV'],['sf6','SF6 en las celdas'],['prot','Protección 50/51'],['trafo','Calentamiento del transformador'],['diodos','Pérdidas en los diodos']];
const CHAIN256=[
 ['rnt','Red Nacional de Transmisión','230 kV CA','La CFE entrega la energía en alta tensión. La subestación del proyecto Metro-Energía se conecta a la Red Nacional de Transmisión.',['seat']],
 ['gis','Subestación encapsulada en SF6','230 kV · 7 bahías','En lugar de equipo al aire libre, interruptores, cuchillas y barras van dentro de tubos metálicos con gas SF6. Ocupa mucho menos espacio que una subestación convencional.',['seat','chilango']],
 ['tr','Transformadores de potencia','4 × 60 MVA · 230/15 kV','Bajan la tensión de 230 kV a 15 kV. Entre los cuatro suman 240 MVA instalados.',['seat']],
 ['mv','Red de media tensión','15 kV · 75 interruptores','Cables de 15 kV por galerías y túnel llevan la energía a las subestaciones rectificadoras y al alumbrado y fuerza de las estaciones.',['seat','chilango']],
 ['sr','Subestación rectificadora','15 kV CA → 750 V CD','La planta que se recorre en esta vista: celdas, transformador de doble secundario y rectificador de 12 pulsos.',[]],
 ['via','Barra guía y rieles','+750 V CD · retorno','El positivo llega al tren por la barra guía y regresa por los rieles de seguridad al negativo de la planta.',[]]
];

export class GridPanel256{
 constructor(view,doc=globalThis.document){
  this.view=view;this.doc=doc;this.on=false;this.tab='red';this.leak={on:false,cell:1,rate:.04,clock:0};this.thermal=new TransformerThermal256();this.th={K:1.1,fanFail:false,speed:20,running:false,hist:[]};this.ring={open:new Set(),dead:new Set()};
  this.gauges=addSf6Gauges256(view.model,view.parts);
  const tools=view.dialog?.querySelector?.('.sr126-tools');
  this.button=doc.createElement('button');this.button.type='button';this.button.className='gp256-toggle';this.button.textContent='⚡ Red y protecciones';this.button.setAttribute('aria-pressed','false');this.button.onclick=()=>this.toggle();
  const advanced=tools?.querySelector?.('.sr137-advanced');if(advanced)tools.insertBefore(this.button,advanced);else tools?.append(this.button);
  this.panel=doc.createElement('aside');this.panel.className='gp256';this.panel.hidden=true;this.panel.setAttribute('aria-label','Red y protecciones de la subestación');
  this.panel.innerHTML=`<header><div><small>RED Y PROTECCIONES</small><b>De la red de CFE a la barra guía</b></div><button type="button" data-gp256-close aria-label="Cerrar">×</button></header><nav role="tablist">${TABS256.map(([id,l])=>`<button type="button" role="tab" data-gp256-tab="${id}" aria-selected="${id==='red'}">${l}</button>`).join('')}</nav><div data-gp256-body></div>`;
  (view.dialog?.querySelector?.('.sr126-stage')||doc.body)?.append(this.panel);
  this.panel.querySelector?.('[data-gp256-close]')?.addEventListener?.('click',()=>this.toggle(false));
  for(const b of this.panel.querySelectorAll?.('[data-gp256-tab]')||[])b.addEventListener('click',()=>this.show(b.dataset.gp256Tab));
  this.body=this.panel.querySelector?.('[data-gp256-body]');this.show('red');
 }
 toggle(on=!this.on){this.on=on;this.button.setAttribute('aria-pressed',String(on));this.panel.hidden=!on;if(on&&this.view.status)this.view.status.textContent='Red y protecciones: elige un tema arriba del panel. Los cálculos no cambian el movimiento de los trenes.';}
 show(tab){this.tab=tab;for(const b of this.panel.querySelectorAll?.('[data-gp256-tab]')||[])b.setAttribute('aria-selected',String(b.dataset.gp256Tab===tab));if(!this.body)return;this.body.innerHTML=this['html_'+tab]();this['bind_'+tab]?.();}
 $(s){return this.body?.querySelector?.(s);}
 // --- Red de alta tensión ---
 html_red(){return `<p class="gp256-lead">Así llega la energía a las líneas 1, 2 y 3. Toca cada bloque para ver qué hace.</p><ol class="gp256-chain">${CHAIN256.map(([id,t,v],i)=>`<li><button type="button" data-gp256-chain="${id}"><i>${i+1}</i><b>${t}</b><span>${v}</span></button></li>`).join('')}</ol><div class="gp256-card" data-gp256-chain-card></div>
<h4>Factor de potencia en la entrada de 15 kV</h4><p>El Código de Red pide a los centros de carga de 1 MW o más un factor de potencia mínimo de 0.95. Mueve la potencia activa y la reactiva:</p>
<div class="gp256-row"><label>P (MW) <input type="range" min="1" max="60" step="1" value="30" data-gp256-p><output data-gp256-p-out></output></label><label>Q (Mvar) <input type="range" min="0" max="40" step="1" value="8" data-gp256-q><output data-gp256-q-out></output></label></div>
<div class="gp256-tiles" data-gp256-fp></div>${src('seat','chilango','grid')}`;}
 bind_red(){const card=this.$('[data-gp256-chain-card]');const pick=id=>{const c=CHAIN256.find(x=>x[0]===id);for(const b of this.body.querySelectorAll('[data-gp256-chain]'))b.setAttribute('aria-pressed',String(b.dataset.gp256Chain===id));card.innerHTML=`<b>${c[1]}</b><p>${c[3]}</p>`;};
  for(const b of this.body.querySelectorAll('[data-gp256-chain]'))b.addEventListener('click',()=>pick(b.dataset.gp256Chain));pick('gis');
  const upd=()=>{const P=+this.$('[data-gp256-p]').value,Q=+this.$('[data-gp256-q]').value,r=powerFactor256(P,Q);this.$('[data-gp256-p-out]').textContent=P;this.$('[data-gp256-q-out]').textContent=Q;
   this.$('[data-gp256-fp]').innerHTML=`<span class="${r.okGrid?'ok':'bad'}"><small>Factor de potencia</small><b>${fmt(r.fp,3)}</b>${r.okGrid?'cumple ≥ 0.95':'debajo de 0.95: hay que compensar'}</span><span><small>Potencia aparente</small><b>${fmt(r.S,1)} MVA</b>de ${SEAT256.transformers*SEAT256.mvaEach} MVA instalados</span><span><small>Corriente a 15 kV</small><b>${fmt(r.I)} A</b>I = S / (√3 · 15 kV)</span>`;};
  for(const s of this.body.querySelectorAll('input'))s.addEventListener('input',upd);upd();}
 // --- Red de 15 kV en anillo ---
 html_anillo(){return `<p class="gp256-lead">Esquema en anillo de la red de 15 kV, alimentado desde dos puntos. Toca un tramo para abrirlo o una subestación para sacarla de servicio y mira cuáles siguen energizadas.</p><svg viewBox="0 0 420 300" class="gp256-ring" data-gp256-ring></svg><p data-gp256-ring-note></p><button type="button" data-gp256-ring-reset>Cerrar todo</button><p class="gp256-assume">Supuesto didáctico: seis subestaciones y dos alimentaciones. La presentación habla de un anillo de 15 kV en el túnel; la topología real de la red Metro-Energía no está publicada con este detalle.</p>${src('seat','chilango')}`;}
 bind_anillo(){const n=ASSUMED256.ringNodes,svg=this.$('[data-gp256-ring]'),cx=210,cy=150,R=110;const P=i=>[cx+R*Math.cos(-Math.PI/2+i*2*Math.PI/n),cy+R*Math.sin(-Math.PI/2+i*2*Math.PI/n)];
  const draw=()=>{const fed=ringFed256(n,this.ring.open,undefined,this.ring.dead);let h='';
   for(let i=0;i<n;i++){const [a,b]=[P(i),P((i+1)%n)],open=this.ring.open.has(i),live=fed.has(i)&&fed.has((i+1)%n)&&!open;h+=`<line data-seg="${i}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${open?'#5b6b70':live?'#ffb238':'#5b6b70'}" stroke-width="${open?3:7}" stroke-dasharray="${open?'6 6':''}" style="cursor:pointer"/>`;}
   for(const s of[0,Math.floor(n/2)]){const [x,y]=P(s),dx=(x-cx)/R*46,dy=(y-cy)/R*46;h+=`<line x1="${x}" y1="${y}" x2="${x+dx}" y2="${y+dy}" stroke="#ffb238" stroke-width="5"/><text x="${x+dx*1.15}" y="${y+dy*1.15+4}" fill="#ffd38a" font-size="11" text-anchor="middle">15 kV</text>`;}
   for(let i=0;i<n;i++){const [x,y]=P(i),on=fed.has(i),dead=this.ring.dead.has(i);h+=`<g data-node="${i}" style="cursor:pointer"><rect x="${x-24}" y="${y-15}" width="48" height="30" rx="7" fill="${dead?'#3b2224':on?'#1a5e54':'#2a3337'}" stroke="${on?'#79dbc1':'#d64541'}" stroke-width="2"/><text x="${x}" y="${y+5}" fill="#e8f1ee" font-size="12" text-anchor="middle">SR ${i+1}</text></g>`;}
   svg.innerHTML=inlineSvg256(h);const off=[...Array(n).keys()].filter(i=>!fed.has(i)).map(i=>'SR '+(i+1));this.$('[data-gp256-ring-note]').textContent=off.length?`Sin alimentación: ${off.join(', ')}. Los trenes de ese tramo se quedan sin tracción.`:'Todas las subestaciones siguen alimentadas: el anillo da otro camino a la energía.';
   for(const l of svg.querySelectorAll('[data-seg]'))l.addEventListener('click',()=>{const i=+l.dataset.seg;this.ring.open.has(i)?this.ring.open.delete(i):this.ring.open.add(i);draw();});
   for(const g of svg.querySelectorAll('[data-node]'))g.addEventListener('click',()=>{const i=+g.dataset.node;this.ring.dead.has(i)?this.ring.dead.delete(i):this.ring.dead.add(i);draw();});};
  this.$('[data-gp256-ring-reset]').addEventListener('click',()=>{this.ring.open.clear();this.ring.dead.clear();draw();});draw();}
 // --- SF6 ---
 html_sf6(){return `<p class="gp256-lead">Las celdas de media tensión y la subestación de alta tensión aíslan y apagan el arco con hexafluoruro de azufre (SF6). Arriba de cada celda MT hay un densímetro: míralo en la vista 3D mientras simulas una fuga.</p>
<div class="gp256-tiles"><span><small>Rigidez dieléctrica</small><b>≈ 2.5 ×</b>la del aire a presión atmosférica</span><span><small>Arco eléctrico</small><b>se apaga rápido</b>el gas captura electrones libres</span><span><small>Efecto invernadero</small><b>GWP 23,900</b>vida atmosférica de 3,200 años</span></div>
<h4>Simular una fuga</h4><div class="gp256-row"><label>Celda <select data-gp256-cell>${(this.gauges.length?this.gauges:[0,1,2]).map((_,i)=>`<option value="${i}">MT ${i+1}</option>`).join('')}</select></label><label>Rapidez <input type="range" min=".01" max=".12" step=".01" value="${this.leak.rate}" data-gp256-rate></label><button type="button" data-gp256-leak>Iniciar fuga</button><button type="button" data-gp256-refill>Rellenar y reparar</button></div>
<div class="gp256-tiles" data-gp256-sf6></div>
<h4>Por qué no se usa el triángulo de Duval aquí</h4><p>El triángulo de Duval interpreta gases disueltos en el aceite de un transformador (metano, etileno, acetileno). En el SF6 lo que se revisa es su pureza, humedad y los subproductos del arco: HF, SOF₂, SO₂ y S₂F₁₀, que son tóxicos. Por eso al abrir un compartimento que tuvo arco se usa protección respiratoria y se recupera el gas, nunca se libera.</p>
<p class="gp256-assume">Supuesto del modelo: alarma de rellenado al ${ASSUMED256.sf6Alarm*100} % y bloqueo de maniobra al ${ASSUMED256.sf6Block*100} % de la densidad nominal. Los valores reales los fija el fabricante de cada celda.</p>${src('sf6','density','seat')}`;}
 bind_sf6(){const out=()=>{const g=this.gauges[this.leak.cell],rho=g?g.rho:1-this.leak.clock*this.leak.rate,s=sf6State256(rho);
   this.$('[data-gp256-sf6]')&&(this.$('[data-gp256-sf6]').innerHTML=`<span class="${s==='ok'?'ok':'bad'}"><small>Densidad (referida a 20 °C)</small><b>${fmt(rho*100)} %</b>de la nominal</span><span class="${s==='block'?'bad':s==='alarm'?'warn':'ok'}"><small>Estado</small><b>${s==='ok'?'Normal':s==='alarm'?'Alarma':'Bloqueo'}</b>${s==='ok'?'la celda puede maniobrar':s==='alarm'?'avisar y programar rellenado':'el interruptor no debe abrir ni cerrar: el gas ya no garantiza apagar el arco'}</span>`);
   this.$('[data-gp256-leak]')&&(this.$('[data-gp256-leak]').textContent=this.leak.on?'Pausar fuga':'Iniciar fuga');};
  this.$('[data-gp256-cell]').value=String(this.leak.cell);this.$('[data-gp256-cell]').addEventListener('change',e=>{this.leak.cell=+e.target.value;out();});
  this.$('[data-gp256-rate]').addEventListener('input',e=>{this.leak.rate=+e.target.value;});
  this.$('[data-gp256-leak]').addEventListener('click',()=>{this.leak.on=!this.leak.on;out();});
  this.$('[data-gp256-refill]').addEventListener('click',()=>{this.leak.on=false;for(const g of this.gauges)setGauge256(g,1);out();});
  this.sf6Out=out;out();}
 // --- 50/51 ---
 html_prot(){return `<p class="gp256-lead">Cada alimentador de 15 kV tiene un relevador de sobrecorriente. La función 51 dispara con retardo que baja mientras más grande es la corriente; la función 50 dispara al instante en un cortocircuito franco.</p>
<div class="gp256-row"><label>Arranque Is (A) <input type="range" min="100" max="1000" step="25" value="400" data-gp256-is><output data-gp256-is-out></output></label><label>Dial TMS <input type="range" min=".05" max="1" step=".05" value=".2" data-gp256-tms><output data-gp256-tms-out></output></label><label>50 instantáneo (A) <input type="range" min="1000" max="10000" step="250" value="4000" data-gp256-inst><output data-gp256-inst-out></output></label></div>
<svg viewBox="0 0 440 250" class="gp256-chart" data-gp256-curve></svg><div class="gp256-row"><label>Corriente de falla (A) <input type="range" min="200" max="12000" step="50" value="1600" data-gp256-fault><output data-gp256-fault-out></output></label></div><div class="gp256-tiles" data-gp256-trip></div>
<p class="gp256-assume">Ajustes de ejemplo para practicar. La coordinación real entre el relevador de la SR, el de la red de 15 kV y el de la subestación de 230 kV requiere el estudio de cortocircuito de la instalación.</p>${src('iec')}`;}
 bind_prot(){const svg=this.$('[data-gp256-curve]');const X=I=>40+380*(Math.log10(I)-2)/(Math.log10(20000)-2),Y=t=>20+200*(1-(Math.log10(Math.max(.01,Math.min(100,t)))+2)/4);
  const upd=()=>{const o={Is:+this.$('[data-gp256-is]').value,tms:+this.$('[data-gp256-tms]').value,inst:+this.$('[data-gp256-inst]').value},If=+this.$('[data-gp256-fault]').value;
   for(const [k,v] of[['is',o.Is],['tms',o.tms],['inst',o.inst],['fault',If]])this.$(`[data-gp256-${k}-out]`).textContent=fmt(v,k==='tms'?2:0);
   let d='',first=true;for(let i=0;i<=200;i++){const I=Math.pow(10,2+i*(Math.log10(20000)-2)/200);let t=relayTime256(I,o);if(!isFinite(t))continue;if(t===0)t=.02;d+=`${first?'M':'L'}${X(I).toFixed(1)},${Y(t).toFixed(1)}`;first=false;}
   let grid='';for(const I of[100,1000,10000])grid+=`<line x1="${X(I)}" x2="${X(I)}" y1="20" y2="220" stroke="#ffffff22"/><text x="${X(I)}" y="236" fill="#93a39d" font-size="10" text-anchor="middle">${fmt(I)} A</text>`;
   for(const t of[.01,.1,1,10,100])grid+=`<line x1="40" x2="420" y1="${Y(t)}" y2="${Y(t)}" stroke="#ffffff22"/><text x="35" y="${Y(t)+3}" fill="#93a39d" font-size="10" text-anchor="end">${t} s</text>`;
   const t=relayTime256(If,o);svg.innerHTML=inlineSvg256(`${grid}<path d="${d}" fill="none" stroke="#ffb238" stroke-width="3"/><line x1="${X(If)}" x2="${X(If)}" y1="20" y2="220" stroke="#ff4f3b" stroke-dasharray="4 4"/>${isFinite(t)?`<circle cx="${X(If)}" cy="${Y(t||.02)}" r="6" fill="#ff4f3b"/>`:''}`);
   this.$('[data-gp256-trip]').innerHTML=`<span class="${isFinite(t)?'bad':'ok'}"><small>Resultado</small><b>${!isFinite(t)?'No dispara':t===0?'Disparo instantáneo (50)':fmt(t,2)+' s (51)'}</b>${!isFinite(t)?'la corriente no pasa del arranque':'abre el interruptor del alimentador'}</span><span><small>Múltiplo de arranque</small><b>${fmt(If/o.Is,2)} × Is</b>t = TMS · 0.14 / ((I/Is)^0.02 − 1)</span>`;};
  for(const s of this.body.querySelectorAll('input'))s.addEventListener('input',upd);upd();}
 // --- Transformer heating ---
 html_trafo(){return `<p class="gp256-lead">Las sondas PT100 en las bobinas del transformador mandan la temperatura al relevador. Con carga alta arrancan los ventiladores; si aun así sigue subiendo, el relevador da alarma y después dispara el interruptor de 15 kV.</p>
<div class="gp256-row"><label>Carga (por unidad) <input type="range" min=".2" max="1.6" step=".05" value="${this.th.K}" data-gp256-k><output data-gp256-k-out></output></label><label><input type="checkbox" data-gp256-fanfail ${this.th.fanFail?'checked':''}> Ventiladores averiados</label><button type="button" data-gp256-run>${this.th.running?'Pausar':'Simular 4 horas'}</button><button type="button" data-gp256-reset>Reiniciar</button></div>
<svg viewBox="0 0 440 230" class="gp256-chart" data-gp256-temp></svg><div class="gp256-tiles" data-gp256-thermal></div>
<p class="gp256-assume">Modelo de primer orden: temperatura = ambiente + elevación nominal · (carga)^1.6, con constante de tiempo de ${ASSUMED256.tauMin} min. Elevación nominal de ${ASSUMED256.riseRated} K (límite de la clase F), ambiente de ${ASSUMED256.ambient} °C y arranque de ventiladores a ${ASSUMED256.fanOn} °C son supuestos. La alarma a ${ASSUMED256.alarm1} °C y el disparo a ${ASSUMED256.alarm2} °C siguen la recomendación del fabricante para clase F; la ventilación forzada da hasta 40 % más potencia.</p>${src('trihal','fans')}`;}
 bind_trafo(){const k=this.$('[data-gp256-k]');k.addEventListener('input',()=>{this.th.K=+k.value;this.drawTrafo();});this.$('[data-gp256-fanfail]').addEventListener('change',e=>{this.th.fanFail=e.target.checked;});
  this.$('[data-gp256-run]').addEventListener('click',e=>{this.th.running=!this.th.running;if(this.thermal.t>=240){this.thermal.reset();this.th.hist=[];}e.target.textContent=this.th.running?'Pausar':'Simular 4 horas';});
  this.$('[data-gp256-reset]').addEventListener('click',()=>{this.thermal.reset();this.th.hist=[];this.th.running=false;this.show('trafo');});this.drawTrafo();}
 drawTrafo(){const svg=this.$('[data-gp256-temp]');if(!svg)return;const a=ASSUMED256,X=t=>40+380*t/240,Y=T=>210-190*(T-20)/(180-20);this.$('[data-gp256-k-out]').textContent=fmt(this.th.K,2);
  let g='';for(const [T,c,l] of[[a.fanOn,'#79dbc1','ventiladores'],[a.alarm1,'#e8b32a','alarma'],[a.alarm2,'#d64541','disparo']])g+=`<line x1="40" x2="420" y1="${Y(T)}" y2="${Y(T)}" stroke="${c}" stroke-dasharray="5 4"/><text x="418" y="${Y(T)-4}" fill="${c}" font-size="10" text-anchor="end">${l} ${T} °C</text>`;
  for(const t of[0,60,120,180,240])g+=`<text x="${X(t)}" y="226" fill="#93a39d" font-size="10" text-anchor="middle">${t/60} h</text>`;for(const T of[40,80,120,160])g+=`<text x="35" y="${Y(T)+3}" fill="#93a39d" font-size="10" text-anchor="end">${T}</text>`;
  const d=this.th.hist.map((p,i)=>`${i?'L':'M'}${X(p.t).toFixed(1)},${Y(p.T).toFixed(1)}`).join('');svg.innerHTML=inlineSvg256(`${g}<path d="${d}" fill="none" stroke="#ff7a2f" stroke-width="3"/>`);
  const th=this.thermal,box=this.$('[data-gp256-thermal]');if(box)box.innerHTML=`<span class="${th.alarm===2?'bad':th.alarm?'warn':'ok'}"><small>Devanado</small><b>${fmt(th.theta)} °C</b>${th.tripped?'disparó: transformador fuera de servicio':th.alarm?'alarma de temperatura':'dentro de límites'}</span><span class="${th.fans?'warn':''}"><small>Ventiladores</small><b>${th.fans?'Encendidos':'Apagados'}</b>${this.th.fanFail?'averiados: no pueden arrancar':`arrancan a ${a.fanOn} °C`}</span><span><small>Tiempo simulado</small><b>${fmt(th.t/60,1)} h</b>estable sin ventilación: ${fmt(windingSteady256(this.th.K,false))} °C</span>`;}
 // --- Diodes ---
 html_diodos(){return `<p class="gp256-lead">Cada diodo pierde un poco de energía al conducir: una caída fija más una parte que crece con el cuadrado de la corriente. Esa energía es calor que los disipadores y la ventilación del rectificador tienen que sacar.</p>
<div class="gp256-row"><label>Corriente de salida Id (A) <input type="range" min="0" max="6000" step="100" value="3000" data-gp256-id><output data-gp256-id-out></output></label><label>Caída umbral (V) <input type="range" min=".6" max="2" step=".05" value="${ASSUMED256.vf0}" data-gp256-vf><output data-gp256-vf-out></output></label></div>
<div class="gp256-tiles" data-gp256-diode></div>
<p>En el rectificador de 12 pulsos hay dos puentes en paralelo. Cada puente lleva la mitad de la corriente y cada diodo conduce un tercio del ciclo, así que la corriente media por diodo es Id / 6.</p>
<p class="gp256-assume">Supuestos: caída umbral de ${ASSUMED256.vf0} V y resistencia dinámica de ${ASSUMED256.rd*1000} mΩ por diodo, valores típicos de diodos de potencia sin identificar fabricante. La presentación usa 1.5 a 2 V; puedes moverla para comparar.</p>`;}
 bind_diodos(){const upd=()=>{const Id=+this.$('[data-gp256-id]').value,vf=+this.$('[data-gp256-vf]').value,r=diodeLosses256(Id,{vf0:vf});this.$('[data-gp256-id-out]').textContent=fmt(Id);this.$('[data-gp256-vf-out]').textContent=fmt(vf,2);
   this.$('[data-gp256-diode]').innerHTML=`<span><small>Por diodo</small><b>${fmt(r.each)} W</b>media ${fmt(r.avg)} A · eficaz ${fmt(r.rms)} A</span><span class="warn"><small>Los 12 diodos</small><b>${fmt(r.total/1000,1)} kW</b>de calor en el rectificador</span><span><small>Respecto a la salida</small><b>${fmt(r.share*100,2)} %</b>de ${fmt(.75*Id/1000,2)} MW a 750 V</span>`;};
  for(const s of this.body.querySelectorAll('input'))s.addEventListener('input',upd);upd();}
 // --- Animation step from the view tick ---
 update(dt=0){if(this.leak.on&&this.gauges.length){const g=this.gauges[this.leak.cell];if(g){setGauge256(g,Math.max(.7,g.rho-this.leak.rate*dt));if(g.rho<=.7)this.leak.on=false;}if(this.on&&this.tab==='sf6'){this.sf6Tick=(this.sf6Tick||0)+dt;if(this.sf6Tick>.25){this.sf6Tick=0;this.sf6Out?.();}}}
  if(this.th.running){const minutes=dt*this.th.speed;this.thermal.step(this.th.K,minutes,{fanFail:this.th.fanFail});const last=this.th.hist.at(-1);if(!last||this.thermal.t-last.t>=1)this.th.hist.push({t:this.thermal.t,T:this.thermal.theta});if(this.thermal.t>=240){this.th.running=false;const b=this.$('[data-gp256-run]');if(b)b.textContent='Simular 4 horas';}if(this.on&&this.tab==='trafo')this.drawTrafo();}}
 dispose(){this.button.remove();this.panel.remove();for(const g of this.gauges)g.group.removeFromParent();}
}
