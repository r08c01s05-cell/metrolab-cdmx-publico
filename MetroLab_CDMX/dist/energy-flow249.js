import * as T from 'three';
import {trainTrack208} from './station-layout208.js?v=209';
import {electricState245,ASSUMED245} from './electric-dashboard245.js?v=249';

export function pointOnPath249(points,u){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+points[i].distanceTo(points[i-1]));
 const d=Math.max(0,Math.min(1,u))*lengths.at(-1);let i=1;while(i<lengths.length-1&&d>lengths[i])i++;
 return points[i-1].clone().lerp(points[i],(d-lengths[i-1])/Math.max(1e-9,lengths[i]-lengths[i-1]));
}
export class FlowPath249{
 constructor(parent,color){this.root=new T.Group();parent.add(this.root);this.lineGeometry=new T.BufferGeometry();this.lineMaterial=new T.LineBasicMaterial({color,transparent:true,opacity:.8});this.line=new T.Line(this.lineGeometry,this.lineMaterial);this.root.add(this.line);this.pulseGeometry=new T.BufferGeometry();this.pulseMaterial=new T.PointsMaterial({color,size:.13,sizeAttenuation:true});this.pulses=new T.Points(this.pulseGeometry,this.pulseMaterial);this.root.add(this.pulses);this.points=[];}
 update(points,time,active=true){this.root.visible=active;if(!active)return;this.points=points;const data=points.flatMap(p=>p.toArray());if(this.lineGeometry.attributes.position?.count!==points.length)this.lineGeometry.setAttribute('position',new T.Float32BufferAttribute(data,3));else{this.lineGeometry.attributes.position.array.set(data);this.lineGeometry.attributes.position.needsUpdate=true;}this.lineGeometry.computeBoundingSphere();const a=new Float32Array(24);for(let i=0;i<8;i++)pointOnPath249(points,((time*.25+i/8)%1+1)%1).toArray(a,i*3);if(!this.pulseGeometry.attributes.position)this.pulseGeometry.setAttribute('position',new T.BufferAttribute(a,3));else{this.pulseGeometry.attributes.position.array.set(a);this.pulseGeometry.attributes.position.needsUpdate=true;}this.pulseGeometry.computeBoundingSphere();}
 dispose(){this.root.removeFromParent();this.lineGeometry.dispose();this.lineMaterial.dispose();this.pulseGeometry.dispose();this.pulseMaterial.dispose();}
}
export class RouteEnergy249{
 constructor(view){this.view=view;this.root=new T.Group();this.root.name='Flujo energético didáctico';view.scene.add(this.root);this.paths=[];for(let i=0;i<6;i++)this.paths.push([new FlowPath249(this.root,'#ffae32'),new FlowPath249(this.root,'#43d8f1')]);this.active=false;this.lastV=0;this.lastTime=null;
  const host=document.querySelector('.sim106-view-tools')||document.getElementById('follow107-tools');this.button=document.createElement('button');this.button.textContent='Flujo de energía en vía';this.button.setAttribute('aria-pressed','false');host?.append(this.button);this.button.onclick=()=>{this.active=!this.active;this.button.setAttribute('aria-pressed',String(this.active));this.note.hidden=!this.active;};
  this.note=document.createElement('p');this.note.hidden=true;this.note.style.cssText='position:absolute;bottom:18px;left:12px;max-width:520px;background:#10282eef;color:white;padding:9px;font-size:12px;pointer-events:none;z-index:8';document.getElementById('sim106-stage')?.append(this.note);
  const prior=view.scene.onBeforeRender;this.callback=(...args)=>{prior?.apply(view.scene,args);this.update();};view.scene.onBeforeRender=this.callback;this.prior=prior;
 }
 update(){const v=this.view,s=v.getState(),e=s.engine,t=e.trains.find(t=>e.operator?t.id===e.operator.trainId:t.id===s.selectedTrain),model=t&&v.trainMeshes.get(t.id);this.root.visible=!!(this.active&&model?.group.visible);if(!this.root.visible)return;
  const key=t.line+':'+t.id;if(this.trainKey!==key){this.lastTime=null;this.lastA=0;this.lastV=t.speed;this.trainKey=key;}const now=e.time??0,dt=this.lastTime===null?0:now-this.lastTime,a=dt>0&&dt<2?(t.speed-this.lastV)/dt:(this.lastA||0);if(dt>0||this.lastTime===null){this.lastA=a;this.lastTime=now;this.lastV=t.speed;}
  const powered=!!e.power[t.line]&&!e.emergency,traction=e.operator?e.operator.throttle:t.wait>0||a<-.05?0:1;
  const st=electricState245({v:t.speed,a:Math.max(-3,Math.min(3,a)),load:t.load,capacity:e.capacity,traction,powered},window.metroDriving107?.electric245?.params||ASSUMED245);
  const state=!powered?'Alimentación cortada':st.tractionKW>1?'Tracción':a<-.05?'Frenado: energía cinética → freno / calor':'Auxiliares';this.note.textContent=`${state} · Línea ${Math.round(st.I).toLocaleString('es-MX')} A · ${Math.round(st.inKW)} kW estimados. Ámbar: barra guía → captador → convertidor. Cian: retorno. Inyección en estación y contactos aproximados; no es el seccionamiento real. La vía conduce; los motores y auxiliares consumen.`;
  const distances=e.lines?.[t.line]?.distances||[],feed=distances.length?distances.reduce((a,b)=>Math.abs(b-t.position)<Math.abs(a-t.position)?b:a):t.position-30;
  const cars=model.group.children.filter(c=>c.userData.formationReference?.powered),track=trainTrack208(t);let n=0;
  for(const car of cars){if(n>=6)break;const index=car.userData.carIndex,d=t.direction||1,cs=t.position+d*(index-4)*16.7,local=(x,y,z)=>car.localToWorld(new T.Vector3(x,y,z));
   // Rails follow the same route map as the infrastructure; car endpoints use
   // its rendered support pose (also in bends), without touching its matrices.
   const rail=(x,y,z)=>{z+=trainTrack208(t,x)-track;return v.alignment97?v.alignment97.map(new T.Vector3(x,y,z)):new T.Vector3(x,y,z);},supply=[];
   const endX=cs+d*5.7,steps=Math.max(12,Math.ceil(Math.abs(endX-feed)/6));supply.push(rail(feed,1,track+3));for(let j=0;j<=steps;j++)supply.push(rail(feed+(endX-feed)*j/steps,.55,track+1.47));
   const contact=local(5.7,.55,1.44),converter=local(0,1,.45),motor=local(5.7,.65,0),returnContact=local(5.7,.2,.72);
   const loadPoint=st.tractionKW>1?motor:converter;supply.push(contact,converter);if(st.tractionKW>1)supply.push(motor);const back=[loadPoint,returnContact];for(let j=0;j<=steps;j++)back.push(rail(endX+(feed-endX)*j/steps,.18,track+.72));back.push(rail(feed,1,track+3));
   this.paths[n][0].update(supply,now,powered);this.paths[n][1].update(back,now,powered);n++;
  }for(;n<6;n++)for(const p of this.paths[n])p.root.visible=false;
 }
 dispose(){for(const pair of this.paths)pair.forEach(p=>p.dispose());this.root.removeFromParent();this.button.remove();this.note.remove();if(this.view.scene.onBeforeRender===this.callback)this.view.scene.onBeforeRender=this.prior;}
}
export function installRouteEnergy249(view){return view.energyFlow249??=new RouteEnergy249(view);}
