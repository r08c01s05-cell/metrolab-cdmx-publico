import * as THREE from 'three';
import {trainTrack208} from './station-layout208.js?v=209';
import {renderPosition203} from './presentation203.js?v=204';
import {bogieHalf212} from './car-support212.js?v=212';
import {FORMATION245} from './electric-dashboard245.js?v=255';
import {srPositions261,feedersAt261} from './sr-real261.js?v=263';
import {brakeSplit279,nearbyTraction279,brakeInfo279} from './braking279.js?v=279';

// Flujo de corriente 250 en el seguimiento del tren. Con un botón se encienden partículas que
// muestran el camino de la corriente de tracción: llega por las barras guía (+750 V CD), entra al
// tren por las escobillas de los carros motrices y regresa por los rieles de seguridad (retorno).
// La cantidad y la velocidad de las partículas siguen a la corriente de línea que calcula el
// análisis eléctrico. Las subestaciones se dibujan a ambos lados del tren sin ubicación real:
// es un esquema del recorrido, no un plano de la alimentación de la línea.
export const MOTOR_CARS250=FORMATION245.map((k,i)=>[k,i]).filter(([k])=>k==='M'||k==='N').map(([,i])=>i);
export const TRACK250={guideZ:1.39,guideY:.53,railZ:.72,railY:.33,reach:260,carSpacing:16.7};
export const COLORS250={positive:'#ff7a2f',train:'#ffd34d',ret:'#39a7ff',regen:'#3fd17f',rheo:'#ff4d3d'};
const COUNT250=420;

// Polylines in longitudinal coordinates (s along the line, y up, lateral offset from the track axis).
export function currentPaths250(train,position,{reach=TRACK250.reach}={}){
 const dir=train.direction||1,h=bogieHalf212(train),out=[];
 const shoes=[];for(const i of MOTOR_CARS250){const c=position+dir*(i-4)*TRACK250.carSpacing;for(const b of[-1,1])shoes.push(c+b*h);}
 const lo=position-reach,hi=position+reach;
 for(const side of[-1,1])for(const s of shoes){
  const feed=s<position?lo:hi;// each shoe draws from the nearer end in this sketch
  out.push({kind:'positive',points:[[feed,TRACK250.guideY,side*TRACK250.guideZ],[s,TRACK250.guideY,side*TRACK250.guideZ],[s,.62,side*1.18],[s,1.05,side*.95]]});
  out.push({kind:'ret',points:[[s,.95,side*.55],[s,TRACK250.railY,side*TRACK250.railZ],[feed,TRACK250.railY,side*TRACK250.railZ]]});
 }
 for(const p of out){let L=0;p.lengths=[0];for(let i=1;i<p.points.length;i++){const a=p.points[i-1],b=p.points[i];L+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);p.lengths.push(L);}p.length=L;}
 return out;
}
export function pointOn250(path,d){d=Math.max(0,Math.min(path.length,d));let i=1;while(i<path.lengths.length-1&&path.lengths[i]<d)i++;const a=path.points[i-1],b=path.points[i],seg=path.lengths[i]-path.lengths[i-1]||1,u=(d-path.lengths[i-1])/seg;return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];}
// Frenado 279. Regenerativo: la corriente sale de las escobillas hacia la barra guía y vuelve por
// los rieles (los caminos de tracción recorridos al revés). Reostático: el motor, como generador,
// alimenta el banco de resistencias de su propio carro; nada sale del tren.
export function brakePaths279(train,position,opts){const dir=train.direction||1,h=bogieHalf212(train),regen=currentPaths250(train,position,opts).map(p=>{const q={kind:p.kind==='positive'?'regenPositive':'regenReturn',points:[...p.points].reverse()};return q;}),rheo=[];
 for(const i of MOTOR_CARS250){const c=position+dir*(i-4)*TRACK250.carSpacing;for(const b of[-1,1])for(const side of[-1,1]){const s=c+b*h;rheo.push({kind:'rheo',car:i,points:[[s,.42,side*.42],[s,.62,side*.5],[c,.66,side*.42]]});}}
 for(const p of[...regen,...rheo]){let L=0;p.lengths=[0];for(let i=1;i<p.points.length;i++){const a=p.points[i-1],b=p.points[i];L+=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);p.lengths.push(L);}p.length=L;}
 return{regen,rheo};}
// Speed and density from line current: a train at standstill only feeds its auxiliaries.
export function flowLevel250(I){const amps=Math.max(0,I||0);return{speed:4+Math.min(1,amps/5000)*36,share:Math.min(1,.12+amps/4500)};}

export class TrackCurrent250{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.on=false;this.time=0;
  this.button=doc.createElement('button');this.button.type='button';this.button.className='tc250-toggle';this.button.innerHTML='〰 Flujo de corriente';this.button.setAttribute('aria-pressed','false');this.button.title='Muestra por dónde circula la corriente de tracción';this.button.onclick=()=>this.toggle();
  (doc.querySelector('.sim106-view-tools')||doc.getElementById('sim106-shell')||doc.body)?.append(this.button);
  this.legend=doc.createElement('aside');this.legend.className='tc250-legend';this.legend.hidden=true;this.legend.setAttribute('aria-live','polite');
  this.legend.innerHTML=`<b>Flujo de la corriente de tracción</b><span><i style="background:${COLORS250.positive}"></i>Barras guía +750 V CD hacia el tren</span><span><i style="background:${COLORS250.train}"></i>Escobillas de los carros motrices</span><span><i style="background:${COLORS250.ret}"></i>Retorno por los rieles de seguridad</span><span><i style="background:${COLORS250.regen}"></i>Frenado regenerativo: del tren a la barra guía</span><span><i style="background:${COLORS250.rheo}"></i>Frenado reostático: a las resistencias del tren (calor)</span><output data-tc250-now></output><output data-tc261-sr></output><small>Las partículas son un esquema del recorrido. Los letreros naranjas marcan las subestaciones de rectificación de la Línea 1 según el material del curso.</small>`;
  (doc.getElementById('sim106-stage')||doc.body)?.append(this.legend);this.now=this.legend.querySelector?.('[data-tc250-now]');this.srOut=this.legend.querySelector?.('[data-tc261-sr]');this.srCache=new Map();
  this.loop=()=>{if(!this.on)return;this.frame=win.requestAnimationFrame?.(this.loop);this.update();};
 }
 view(){return this.win.stationScene;}
 read(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const t=e.trains?.find(x=>e.operator?x.id===e.operator.trainId:x.id===s.selectedTrain);return t?{s,e,t}:null;}
 toggle(on=!this.on){if(on){const other=this.view()?.energyFlow249;if(other){other.active=false;other.button.setAttribute('aria-pressed','false');other.note.hidden=true;}}this.on=on;this.button.setAttribute('aria-pressed',String(on));this.legend.hidden=!on;if(on){this.build();this.last=null;this.loop();}else{this.win.cancelAnimationFrame?.(this.frame);if(this.mesh)this.mesh.visible=false;if(this.markers261)this.markers261.visible=false;if(this.rheo279)this.rheo279.visible=false;}}
 build(){const view=this.view();if(!view?.scene)return;if(this.mesh&&this.mesh.parent===view.scene)return;this.mesh?.removeFromParent();
  const mat=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false,transparent:true,opacity:.95,depthWrite:false});
  this.mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),mat,COUNT250);this.mesh.name='Flujo_corriente250';this.mesh.frustumCulled=false;this.mesh.renderOrder=5;
  this.seeds=Array.from({length:COUNT250},(_,i)=>({path:i,offset:Math.random(),gate:Math.random()}));view.scene.add(this.mesh);}
 update(now=(this.win.performance?.now?.()??Date.now())){
  const r=this.read(),view=this.view();if(!r||!view?.scene){if(this.mesh)this.mesh.visible=false;return;}this.build();if(!this.mesh)return;
  const dt=this.last==null?0:Math.min(.1,(now-this.last)/1000);this.last=now;
  const {s,e,t}=r,st=this.win.electricDashboard245?.state,powered=!!e.power?.[t.line]&&!e.emergency,I=powered?(st?.I??0):0,level=flowLevel250(I);
  // Frenado: reparto entre barra guía y resistencias según el modelo del tren y la receptividad.
  const brakeKW=st?.brakeKW||0,braking=brakeKW>1&&t.speed>.3,split=braking?brakeSplit279(t.model,brakeKW,{receptive:powered&&nearbyTraction279(e,t)>0}):{regen:0,rheo:0},brakeLevel=flowLevel250((split.regen+split.rheo)*1000/750);this.brake279=split;
  if(s.running)this.time+=dt*(braking?brakeLevel.speed:level.speed);
  this.resistors279(view,t,renderPosition203(t,s),split.rheo);
  this.feeders261(view,e,t);const pos=renderPosition203(t,s),paths=currentPaths250(t,pos),route=view.alignment97,m=new THREE.Matrix4(),c=new THREE.Color(),q=new THREE.Quaternion(),scale=new THREE.Vector3(),v=new THREE.Vector3();
  let n=0;
  if(braking){const bp=brakePaths279(t,pos),total=split.regen+split.rheo,fr=total>0?split.regen/total:0;
   for(const seed of this.seeds){if(seed.gate>brakeLevel.share)continue;const regen=seed.offset<fr,list=regen?bp.regen:bp.rheo;if(!list.length)continue;const path=list[seed.path%list.length],d=((seed.offset*path.length+this.time)%path.length),[ps,py,pz]=pointOn250(path,d),lateral=trainTrack208(t,ps)+pz,p=route?route.pose(ps,lateral):{x:ps,z:lateral};
    v.set(p.x,py,p.z);scale.setScalar(regen?1.1:1.2);m.compose(v,q,scale);this.mesh.setMatrixAt(n,m);this.mesh.setColorAt(n,c.set(regen?COLORS250.regen:COLORS250.rheo));n++;}
   this.mesh.count=n;this.mesh.visible=n>0;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
   if(this.now)this.now.textContent=`Frenando · ${Math.round(split.regen).toLocaleString('es-MX')} kW a la barra guía y ${Math.round(split.rheo).toLocaleString('es-MX')} kW a resistencias. ${split.reason}.`;
   return n;}
  for(const seed of this.seeds){const path=paths[seed.path%paths.length];if(!powered||seed.gate>level.share){continue;}
   const d=((seed.offset*path.length+this.time)%path.length),[ps,py,pz]=pointOn250(path,d),lateral=trainTrack208(t,ps)+pz,p=route?route.pose(ps,lateral):{x:ps,z:lateral};
   const inTrain=path.kind==='positive'?d>path.lengths[1]:d<path.lengths[1];
   v.set(p.x,py,p.z);scale.setScalar(inTrain?1.25:1);m.compose(v,q,scale);this.mesh.setMatrixAt(n,m);this.mesh.setColorAt(n,c.set(inTrain?COLORS250.train:COLORS250[path.kind]));n++;}
  this.mesh.count=n;this.mesh.visible=n>0;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
  if(this.now)this.now.textContent=!powered?'Sin energía en la línea: no circula corriente.':`Corriente de línea ${Math.round(I).toLocaleString('es-MX')} A${I<600?' · solo auxiliares o frenando':''}`;
  return n;}
 // Bancos de resistencias de frenado bajo cada carro motriz. Se encienden con la potencia reostática.
 resistors279(view,t,pos,rheoKW){if(!this.rheo279||this.rheo279.parent!==view.scene){this.rheo279?.removeFromParent();const mat=new THREE.MeshBasicMaterial({color:'#5a1a14',toneMapped:false,transparent:true,opacity:.92});this.rheo279=new THREE.InstancedMesh(new THREE.BoxGeometry(2.6,.26,.9),mat,MOTOR_CARS250.length);this.rheo279.name='Resistencias_frenado279';this.rheo279.frustumCulled=false;this.rheo279.renderOrder=4;view.scene.add(this.rheo279);}
  const show=rheoKW>1||brakeInfo279(t.model).type==='rheo';this.rheo279.visible=show;if(!show)return 0;const route=view.alignment97,m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),one=new THREE.Vector3(1,1,1),dir=t.direction||1,heat=Math.min(1,rheoKW/2400);
  MOTOR_CARS250.forEach((i,k)=>{const cpos=pos+dir*(i-4)*TRACK250.carSpacing,lat=trainTrack208(t,cpos),p=route?route.pose(cpos,lat):{x:cpos,z:lat,yaw:0};e.set(0,p.yaw||0,0);v.set(p.x,.62,p.z);m.compose(v,q.setFromEuler(e),one);this.rheo279.setMatrixAt(k,m);});
  this.rheo279.instanceMatrix.needsUpdate=true;this.rheo279.material.color.setRGB(.25+.75*heat,.07+.45*heat*heat,.05+.1*heat);return MOTOR_CARS250.length;}
 // Subestaciones de rectificación 261: letreros en la vía y, en la leyenda, las dos que alimentan al tren.
 positions261(e,lineId){if(!this.srCache.has(lineId))this.srCache.set(lineId,srPositions261(e.lines?.[lineId]));return this.srCache.get(lineId);}
 feeders261(view,e,t){const list=this.positions261(e,t.line);
  if(this.srOut){if(!list.length)this.srOut.textContent='El material aportado solo ubica las subestaciones de rectificación de la Línea 1.';else{const f=feedersAt261(list,t.position),d=p=>Math.round(Math.abs(p.x-t.position)).toLocaleString('es-MX')+' m';this.srOut.textContent=`Zona ${f.zone} · S.R. más cercanas: `+[f.left&&`${f.left.name} (${d(f.left)} hacia Pantitlán)`,f.right&&`${f.right.name} (${d(f.right)} hacia Observatorio)`].filter(Boolean).join(' y ');}}
  if(this.markersLine261!==t.line||this.markers261?.parent!==view.scene){this.markers261?.removeFromParent();this.markers261=null;this.markersLine261=t.line;if(list.length&&view.scene&&this.doc.createElement){const g=new THREE.Group();g.name='Subestaciones_rectificacion261';const route=view.alignment97;
    for(const p of list){const c=this.doc.createElement('canvas');c.width=512;c.height=128;const x=c.getContext?.('2d');if(!x)continue;x.fillStyle='#ff7a2f';x.fillRect(0,0,512,128);x.fillStyle='#1d1006';x.font='bold 46px system-ui,sans-serif';x.textAlign='center';x.fillText('S.R. '+p.name.toUpperCase().slice(0,18),256,56);x.font='34px system-ui,sans-serif';x.fillText('Zona '+p.zone+(p.cs?' · C.S. '+p.cs:'')+(p.approximate?' · aprox.':''),256,104);
     const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,toneMapped:false,depthWrite:false}));const w=route?route.pose(p.x,0):{x:p.x,z:0};sprite.position.set(w.x,4.25,w.z);sprite.scale.set(3.2,.8,1);sprite.name='Letrero_SR261_'+p.name;sprite.raycast=()=>{};g.add(sprite);}
    view.scene.add(g);this.markers261=g;}}
  if(this.markers261)this.markers261.visible=true;}
 dispose(){this.toggle(false);this.mesh?.removeFromParent();this.rheo279?.removeFromParent();this.markers261?.removeFromParent();this.button.remove();this.legend.remove();}
}
export function installTrackCurrent250(doc=document,win=window){if(doc.querySelector('.tc250-toggle'))return win.trackCurrent250;return win.trackCurrent250=new TrackCurrent250(doc,win);}
