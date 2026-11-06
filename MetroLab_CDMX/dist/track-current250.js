import * as THREE from 'three';
import {trainTrack208} from './station-layout208.js?v=209';
import {renderPosition203} from './presentation203.js?v=204';
import {bogieHalf212} from './car-support212.js?v=212';
import {FORMATION245} from './electric-dashboard245.js?v=250';

// Flujo de corriente 250 en el seguimiento del tren. Con un botón se encienden partículas que
// muestran el camino de la corriente de tracción: llega por las barras guía (+750 V CD), entra al
// tren por las escobillas de los carros motrices y regresa por los rieles de seguridad (retorno).
// La cantidad y la velocidad de las partículas siguen a la corriente de línea que calcula el
// análisis eléctrico. Las subestaciones se dibujan a ambos lados del tren sin ubicación real:
// es un esquema del recorrido, no un plano de la alimentación de la línea.
export const MOTOR_CARS250=FORMATION245.map((k,i)=>[k,i]).filter(([k])=>k==='M'||k==='N').map(([,i])=>i);
export const TRACK250={guideZ:1.39,guideY:.53,railZ:.72,railY:.33,reach:260,carSpacing:16.7};
export const COLORS250={positive:'#ff7a2f',train:'#ffd34d',ret:'#39a7ff'};
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
// Speed and density from line current: a train at standstill only feeds its auxiliaries.
export function flowLevel250(I){const amps=Math.max(0,I||0);return{speed:4+Math.min(1,amps/5000)*36,share:Math.min(1,.12+amps/4500)};}

export class TrackCurrent250{
 constructor(doc=document,win=window){
  this.doc=doc;this.win=win;this.on=false;this.time=0;
  this.button=doc.createElement('button');this.button.type='button';this.button.className='tc250-toggle';this.button.innerHTML='〰 Flujo de corriente';this.button.setAttribute('aria-pressed','false');this.button.title='Muestra por dónde circula la corriente de tracción';this.button.onclick=()=>this.toggle();
  (doc.querySelector('.sim106-view-tools')||doc.getElementById('sim106-shell')||doc.body)?.append(this.button);
  this.legend=doc.createElement('aside');this.legend.className='tc250-legend';this.legend.hidden=true;this.legend.setAttribute('aria-live','polite');
  this.legend.innerHTML=`<b>Flujo de la corriente de tracción</b><span><i style="background:${COLORS250.positive}"></i>Barras guía +750 V CD hacia el tren</span><span><i style="background:${COLORS250.train}"></i>Escobillas de los carros motrices</span><span><i style="background:${COLORS250.ret}"></i>Retorno por los rieles de seguridad</span><output data-tc250-now></output><small>Esquema: las subestaciones se suponen a ambos lados del tren; su posición no es real.</small>`;
  (doc.getElementById('sim106-stage')||doc.body)?.append(this.legend);this.now=this.legend.querySelector?.('[data-tc250-now]');
  this.loop=()=>{if(!this.on)return;this.frame=win.requestAnimationFrame?.(this.loop);this.update();};
 }
 view(){return this.win.stationScene;}
 read(){const s=this.win.metroViewState?.(),e=s?.engine;if(!e)return null;const t=e.trains?.find(x=>e.operator?x.id===e.operator.trainId:x.id===s.selectedTrain);return t?{s,e,t}:null;}
 toggle(on=!this.on){this.on=on;this.button.setAttribute('aria-pressed',String(on));this.legend.hidden=!on;if(on){this.build();this.last=null;this.loop();}else{this.win.cancelAnimationFrame?.(this.frame);if(this.mesh)this.mesh.visible=false;}}
 build(){const view=this.view();if(!view?.scene)return;if(this.mesh&&this.mesh.parent===view.scene)return;this.mesh?.removeFromParent();
  const mat=new THREE.MeshBasicMaterial({color:'#ffffff',toneMapped:false,transparent:true,opacity:.95,depthWrite:false});
  this.mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.055,8,6),mat,COUNT250);this.mesh.name='Flujo_corriente250';this.mesh.frustumCulled=false;this.mesh.renderOrder=5;
  this.seeds=Array.from({length:COUNT250},(_,i)=>({path:i,offset:Math.random(),gate:Math.random()}));view.scene.add(this.mesh);}
 update(now=(this.win.performance?.now?.()??Date.now())){
  const r=this.read(),view=this.view();if(!r||!view?.scene){if(this.mesh)this.mesh.visible=false;return;}this.build();if(!this.mesh)return;
  const dt=this.last==null?0:Math.min(.1,(now-this.last)/1000);this.last=now;
  const {s,e,t}=r,st=this.win.electricDashboard245?.state,powered=!!e.power?.[t.line]&&!e.emergency,I=powered?(st?.I??0):0,level=flowLevel250(I);
  if(s.running)this.time+=dt*level.speed;
  const pos=renderPosition203(t,s),paths=currentPaths250(t,pos),route=view.alignment97,m=new THREE.Matrix4(),c=new THREE.Color(),q=new THREE.Quaternion(),scale=new THREE.Vector3(),v=new THREE.Vector3();
  let n=0;
  for(const seed of this.seeds){const path=paths[seed.path%paths.length];if(!powered||seed.gate>level.share){continue;}
   const d=((seed.offset*path.length+this.time)%path.length),[ps,py,pz]=pointOn250(path,d),lateral=trainTrack208(t,ps)+pz,p=route?route.pose(ps,lateral):{x:ps,z:lateral};
   const inTrain=path.kind==='positive'?d>path.lengths[1]:d<path.lengths[1];
   v.set(p.x,py,p.z);scale.setScalar(inTrain?1.25:1);m.compose(v,q,scale);this.mesh.setMatrixAt(n,m);this.mesh.setColorAt(n,c.set(inTrain?COLORS250.train:COLORS250[path.kind]));n++;}
  this.mesh.count=n;this.mesh.visible=n>0;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;
  if(this.now)this.now.textContent=!powered?'Sin energía en la línea: no circula corriente.':`Corriente de línea ${Math.round(I).toLocaleString('es-MX')} A${I<600?' · solo auxiliares o frenando':''}`;
  return n;}
 dispose(){this.toggle(false);this.mesh?.removeFromParent();this.button.remove();this.legend.remove();}
}
export function installTrackCurrent250(doc=document,win=window){if(doc.querySelector('.tc250-toggle'))return win.trackCurrent250;return win.trackCurrent250=new TrackCurrent250(doc,win);}
