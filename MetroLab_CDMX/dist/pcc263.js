// P.C.C. 263: puesto de mando dentro del simulador. Muestra la línea completa con sus trenes, las
// zonas de tracción de la Línea 1, los flujos de energía (tracción y regeneración) y da órdenes
// con lo que el motor del simulador ya expone: retención en estación (t.wait), energía de línea y
// freno de emergencia. No modifica engine.js.
import {electricState245,DOCUMENTED245,ASSUMED245} from './electric-dashboard245.js?v=255';
import {srPositions261,feedersAt261,zonesFed261,ZONE_STATE261,L1_ZONES261} from './sr-real261.js?v=263';

export const ASSUMED263=Object.freeze({coastBand:.06,holdSeconds:30,note:'Supuestos del ejercicio: la energía regenerada se aprovecha solo si otro tren de la misma línea está consumiendo en ese instante; el resto va a las resistencias de frenado. En una zona sin tensión, el P.C.C. retiene en estación a los trenes que estén detenidos ahí.'});
export const MODES263=Object.freeze({traccion:{label:'Tracción · motor',color:'#ffb238'},deriva:{label:'Marcha por inercia',color:'#93a39d'},regenera:{label:'Frenado · generador',color:'#3fd17f'},detenido:{label:'Detenido',color:'#5b7f8a'}});

// Modo eléctrico de un tren a partir de su velocidad y aceleración.
export function trainMode263(v,a,band=ASSUMED263.coastBand){if(v<.3&&Math.abs(a)<band)return'detenido';if(a>band)return'traccion';if(a<-band&&v>.3)return'regenera';return'deriva';}

// Fotografía eléctrica de una línea. memo guarda la velocidad anterior de cada tren.
export function snapshot263(engine,lineId,memo=new Map(),zones=ZONE_STATE261){
 const line=engine.lines[lineId],positions=srPositions261(line),fed=zonesFed261(zones.out,zones.open).fed,powered=!!engine.power[lineId]&&!engine.emergency,rows=[];
 for(const t of engine.trains){if(t.line!==lineId)continue;const m=memo.get(t.id),dt=m?engine.time-m.time:0;let a=m?.a??0;if(dt>1e-6){a=(t.speed-m.speed)/dt;memo.set(t.id,{time:engine.time,speed:t.speed,a});}else if(!m)memo.set(t.id,{time:engine.time,speed:t.speed,a:0});
  const zone=positions.length?feedersAt261(positions,t.position).zone:null,zoneLive=zone==null||fed.has(zone),mode=trainMode263(t.speed,a);
  const st=electricState245({v:t.speed,a,load:t.load,capacity:engine.capacity||0,traction:mode==='traccion'?1:0,brake:mode==='regenera'?1:0,powered:powered&&zoneLive});
  rows.push({id:t.id,train:t,x:t.position,direction:t.direction,speedKmh:t.speed*3.6,a,mode,zone,zoneLive,state:t.state,inStation:t.wait>0,drawKW:st.inKW,brakeKW:st.brakeKW,regenKW:0,rheoKW:0});}
 // Receptividad: lo que frena un tren lo toman los demás que consumen; el resto va a resistencias.
 const demand=rows.reduce((s,r)=>s+r.drawKW,0),brake=rows.reduce((s,r)=>s+r.brakeKW,0);
 for(const r of rows){if(r.brakeKW<=0)continue;const others=demand-r.drawKW,share=brake>0?r.brakeKW/brake:0,used=powered?Math.min(r.brakeKW,Math.max(0,others)*share):0;r.regenKW=used;r.rheoKW=r.brakeKW-used;}
 const regen=rows.reduce((s,r)=>s+r.regenKW,0),rheo=rows.reduce((s,r)=>s+r.rheoKW,0);
 return{lineId,rows,positions,fed,powered,totals:{demandKW:demand,brakeKW:brake,regenKW:regen,rheoKW:rheo,srKW:Math.max(0,demand-regen),amps:Math.max(0,demand-regen)*1000/DOCUMENTED245.nominalV}};}

// Retenciones: el regulador retiene un tren en su estación hasta liberarlo.
export class HoldBook263{
 constructor(){this.manual=new Set();this.auto=new Set();}
 toggle(id){this.manual.has(id)?this.manual.delete(id):this.manual.add(id);return this.manual.has(id);}
 holdAll(ids){for(const id of ids)this.manual.add(id);}releaseAll(){this.manual.clear();}
 held(id){return this.manual.has(id)||this.auto.has(id);}
 // Trenes detenidos en una zona sin tensión quedan retenidos solos.
 setAuto(rows){this.auto=new Set(rows.filter(r=>!r.zoneLive&&r.inStation).map(r=>r.id));}
 // Solo actúa sobre trenes ya detenidos en estación y que no conduce el usuario.
 apply(engine,seconds=ASSUMED263.holdSeconds){let n=0;for(const t of engine.trains){if(!this.held(t.id)||engine.operator?.trainId===t.id||!(t.wait>0))continue;if(t.wait<seconds){t.wait=seconds;}t.state='Retenido por el P.C.C.';n++;}return n;}}

const fmt=(n,d=0)=>Number(n).toLocaleString('es-MX',{maximumFractionDigits:d,minimumFractionDigits:d});
const ZC={A:'#ffb238',B:'#79dbc1',C:'#c47dff',D:'#ff7a2f',E:'#39a7ff',F:'#e8d44d'};

export class Pcc263{
 constructor(doc=document,win=window){this.doc=doc;this.win=win;this.on=false;this.memo=new Map();this.holds=new HoldBook263();this.phase=0;
  this.button=doc.createElement('button');this.button.type='button';this.button.className='pcc263-toggle';this.button.textContent='🖥 P.C.C.';this.button.title='Puesto Central de Control: trenes, zonas de tracción y flujos de energía';this.button.setAttribute('aria-pressed','false');this.button.onclick=()=>this.toggle();
  (doc.querySelector('.sim106-view-tools')||doc.getElementById('sim106-shell')||doc.body)?.append(this.button);
  this.panel=doc.createElement('aside');this.panel.className='pcc263';this.panel.hidden=true;this.panel.setAttribute('aria-label','Puesto Central de Control');
  this.panel.innerHTML=`<header><div><small>PUESTO CENTRAL DE CONTROL</small><b data-pcc-title>Línea</b></div><button type="button" data-pcc-close aria-label="Cerrar">×</button></header>
<div class="pcc263-orders"><button type="button" data-pcc-holdall>Retener todos en estación</button><button type="button" data-pcc-release>Liberar todos</button><button type="button" data-pcc-power>Cortar energía de la línea</button><button type="button" data-pcc-emergency class="danger">Freno de emergencia</button><button type="button" data-pcc-zones>Restablecer zonas</button></div>
<svg data-pcc-map viewBox="0 0 1000 250" preserveAspectRatio="xMidYMid meet"></svg>
<div class="pcc263-legend"><span style="--c:#ffb238">De la S.R. al tren (motor)</span><span style="--c:#3fd17f">Del tren a la barra guía (generador)</span><span style="--c:#ff6b5e">A resistencias de frenado</span><span style="--c:#5b7f8a">Retenido</span></div>
<div class="pcc263-tiles" data-pcc-tiles></div><table data-pcc-table></table><p class="pcc263-note" data-pcc-note></p>`;
  (doc.getElementById('sim106-stage')||doc.body)?.append(this.panel);const q=s=>this.panel.querySelector?.(s);
  q('[data-pcc-close]')?.addEventListener?.('click',()=>this.toggle(false));
  q('[data-pcc-holdall]')?.addEventListener?.('click',()=>{this.holds.holdAll(this.last?.rows.map(r=>r.id)||[]);this.tick();});
  q('[data-pcc-release]')?.addEventListener?.('click',()=>{this.holds.releaseAll();this.tick();});
  q('[data-pcc-power]')?.addEventListener?.('click',()=>{const b=doc.getElementById('power');if(b)b.click();else{const s=this.state();if(s)s.engine.power[s.currentLine]=!s.engine.power[s.currentLine];}this.tick();});
  q('[data-pcc-emergency]')?.addEventListener?.('click',()=>{doc.getElementById('emergency')?.click();this.tick();});
  q('[data-pcc-zones]')?.addEventListener?.('click',()=>{ZONE_STATE261.out.clear();ZONE_STATE261.open.clear();this.tick();});
  q('[data-pcc-map]')?.addEventListener?.('click',e=>{const g=e.target.closest?.('[data-pcc-sr],[data-pcc-train]');if(!g)return;if(g.dataset.pccSr){const k=g.dataset.pccSr;ZONE_STATE261.out.has(k)?ZONE_STATE261.out.delete(k):ZONE_STATE261.out.add(k);}else this.win.selectSceneTrain?.(g.dataset.pccTrain);this.tick();});
  q('[data-pcc-table]')?.addEventListener?.('click',e=>{const b=e.target.closest?.('[data-pcc-hold]');if(b){this.holds.toggle(b.dataset.pccHold);this.tick();}});
  // Las retenciones se aplican aunque el panel esté cerrado.
  this.timer=win.setInterval?.(()=>this.tick(),200);}
 state(){return this.win.metroViewState?.()||null;}
 toggle(on=!this.on){this.on=on;this.button.setAttribute('aria-pressed',String(on));this.panel.hidden=!on;if(on)this.tick();}
 tick(){const s=this.state();if(!s?.engine)return;const active=this.on||this.holds.manual.size||ZONE_STATE261.out.size||ZONE_STATE261.open.size||this.holds.auto.size;if(!active)return;
  const snap=this.last=snapshot263(s.engine,s.currentLine,this.memo);this.holds.setAuto(snap.rows);this.holds.apply(s.engine);if(this.on){this.phase=(this.phase+3)%24;this.render(snap,s.engine);}}
 render(snap,engine){const q=s=>this.panel.querySelector(s),line=engine.lines[snap.lineId],X=x=>50+x/line.total*900,busY=92,trackY=150;
  q('[data-pcc-title]').textContent=`Línea ${snap.lineId} · ${snap.rows.length} trenes · ${snap.powered?'con tensión':engine.emergency?'freno de emergencia':'sin energía de tracción'}`;
  q('[data-pcc-power]').textContent=engine.power[snap.lineId]?'Cortar energía de la línea':'Restablecer energía';q('[data-pcc-zones]').hidden=!snap.positions.length;
  let h='';
  // Zonas de tracción (solo Línea 1, que es la que trae el material).
  if(snap.positions.length){let from=0;L1_ZONES261.forEach((z,i)=>{const ps=snap.positions.filter(p=>p.zone===z.zone),next=snap.positions.filter(p=>p.zone===L1_ZONES261[i+1]?.zone),to=next.length?(Math.max(...ps.map(p=>p.x))+Math.min(...next.map(p=>p.x)))/2:line.total,live=snap.fed.has(z.zone);
    h+=`<rect x="${X(from)}" y="${busY-5}" width="${X(to)-X(from)-2}" height="10" rx="4" style="fill:${live&&snap.powered?ZC[z.zone]:'#2a3337'};stroke:${live?ZC[z.zone]:'#d64541'};stroke-width:1.5"/><text x="${(X(from)+X(to))/2}" y="${busY-34}" text-anchor="middle" style="fill:${live?'#dfe8e3':'#ff7b6b'};font-size:11px">Zona ${z.zone}${live?'':' sin tensión'}</text>`;from=to;});
   for(const p of snap.positions){const off=ZONE_STATE261.out.has(p.name),x=X(p.x);h+=`<g data-pcc-sr="${p.name}" style="cursor:pointer"><title>S.R. ${p.name}${p.approximate?' (ubicación aproximada)':''}: toca para ${off?'reponerla':'sacarla de servicio'}</title><rect x="${x-6}" y="${busY-26}" width="12" height="12" rx="3" style="fill:${off?'#3b2224':'#1a5e54'};stroke:${off?'#d64541':'#79dbc1'};stroke-width:1.5"/><line x1="${x}" y1="${busY-14}" x2="${x}" y2="${busY-5}" style="stroke:${off?'#5b6b70':'#79dbc1'};stroke-width:1.5${!off&&snap.powered&&snap.totals.srKW>1?`;stroke-dasharray:3 3;stroke-dashoffset:${-this.phase/2}`:''}"/></g>`;}}
  else h+=`<rect x="50" y="${busY-5}" width="900" height="10" rx="4" style="fill:${snap.powered?'#79dbc1':'#2a3337'};stroke:#79dbc1;stroke-width:1.5"/><text x="500" y="${busY-16}" text-anchor="middle" style="fill:#93a39d;font-size:11px">Barra guía · el material no ubica las S.R. de esta línea</text>`;
  // Vía y estaciones.
  h+=`<line x1="50" y1="${trackY}" x2="950" y2="${trackY}" style="stroke:${line.color};stroke-width:4"/>`;
  line.stations.forEach((s,i)=>{const x=X(line.distances[i]);h+=`<circle cx="${x}" cy="${trackY}" r="4" style="fill:#0d1a20;stroke:#f2f6f4;stroke-width:1.5"/><text x="${x}" y="${trackY+16}" text-anchor="end" transform="rotate(-50 ${x} ${trackY+16})" style="fill:#c9d8d4;font-size:9px">${s.nombre}</text>`;});
  // Trenes y flujos.
  const takers=snap.rows.filter(r=>r.drawKW>ASSUMED245.auxKW+1&&r.zoneLive);
  for(const r of snap.rows){const x=X(r.x),held=this.holds.held(r.id),c=held?'#5b7f8a':MODES263[r.mode].color,y=trackY-(r.direction>0?13:-1)-6,dash=`stroke-dasharray:5 4;stroke-dashoffset:`;
   if(snap.powered&&r.zoneLive&&r.drawKW>1&&r.mode!=='regenera')h+=`<line x1="${x}" y1="${busY+5}" x2="${x}" y2="${trackY-14}" style="stroke:#ffb238;stroke-width:${r.mode==='traccion'?3:1.2};${dash}${-this.phase}"/>`;
   if(r.regenKW>1){h+=`<line x1="${x}" y1="${busY+5}" x2="${x}" y2="${trackY-14}" style="stroke:#3fd17f;stroke-width:3;${dash}${this.phase}"/>`;const to=takers.filter(o=>o.id!==r.id).sort((a,b)=>Math.abs(a.x-r.x)-Math.abs(b.x-r.x))[0];if(to){const x2=X(to.x);h+=`<path d="M${x} ${busY+9} Q${(x+x2)/2} ${busY+34} ${x2} ${busY+9}" style="fill:none;stroke:#3fd17f;stroke-width:2;${dash}${-this.phase}"/>`;}}
   if(r.rheoKW>1)h+=`<line x1="${x}" y1="${trackY+8}" x2="${x}" y2="${trackY+22}" style="stroke:#ff6b5e;stroke-width:3;${dash}${-this.phase}"/>`;
   h+=`<g data-pcc-train="${r.id}" style="cursor:pointer"><title>${r.id}: ${held?'retenido':MODES263[r.mode].label}</title><rect x="${x-11}" y="${y}" width="22" height="11" rx="3" style="fill:${c};stroke:#0d1a20;stroke-width:1"/><text x="${x}" y="${y+8.5}" text-anchor="middle" style="fill:#0d1a20;font-size:8px;font-weight:700">${r.direction>0?'▶':'◀'}${r.id.slice(-2)}</text></g>`;}
  q('[data-pcc-map]').innerHTML=h;const T=snap.totals;
  q('[data-pcc-tiles]').innerHTML=`<span><small>Piden los trenes</small><b>${fmt(T.demandKW)} kW</b>tracción y auxiliares</span><span><small>Entregan las S.R.</small><b>${fmt(T.srKW)} kW</b>≈ ${fmt(T.amps)} A a 750 V</span><span class="ok"><small>Regresa a la barra guía</small><b>${fmt(T.regenKW)} kW</b>motores como generadores</span><span class="${T.rheoKW>1?'warn':''}"><small>Se quema en resistencias</small><b>${fmt(T.rheoKW)} kW</b>sin tren que la reciba</span>`;
  q('[data-pcc-table]').innerHTML=`<tr><th>Tren</th><th>Zona</th><th>km/h</th><th>Modo</th><th>kW</th><th>Estado</th><th>Orden</th></tr>`+snap.rows.map(r=>{const held=this.holds.held(r.id),auto=this.holds.auto.has(r.id)&&!this.holds.manual.has(r.id),kw=r.mode==='regenera'?-(r.regenKW+r.rheoKW):r.drawKW;return `<tr><td>${r.id}</td><td>${r.zone??'·'}${r.zoneLive?'':' ⚠'}</td><td>${fmt(r.speedKmh)}</td><td style="color:${MODES263[r.mode].color}">${MODES263[r.mode].label}</td><td>${fmt(kw)}</td><td>${auto?'Retenido: zona sin tensión':held&&r.inStation?'Retenido por el P.C.C.':held?'Se retendrá al llegar':r.state}</td><td><button type="button" data-pcc-hold="${r.id}" aria-pressed="${this.holds.manual.has(r.id)}">${this.holds.manual.has(r.id)?'Liberar':'Retener'}</button></td></tr>`;}).join('');
  const dead=[...L1_ZONES261.map(z=>z.zone)].filter(z=>snap.positions.length&&!snap.fed.has(z));
  q('[data-pcc-note]').textContent=(dead.length?`Zona ${dead.join(', ')} sin tensión: sus trenes detenidos quedan retenidos; los que van entre estaciones siguen hasta la siguiente porque el corte por zona no existe en el motor del simulador. `:'')+'Toca una S.R. para sacarla de servicio y un tren para seguirlo con la cámara. '+ASSUMED263.note;}
 dispose(){this.win.clearInterval?.(this.timer);this.button.remove?.();this.panel.remove?.();}}
export function installPcc263(doc=document,win=window){if(win.pcc263)return win.pcc263;return win.pcc263=new Pcc263(doc,win);}
