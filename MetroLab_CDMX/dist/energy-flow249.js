import * as T from 'three';
import {trainTrack208} from './station-layout208.js?v=209';
import {electricState245,ASSUMED245} from './electric-dashboard245.js?v=250';

function lengths250(points){const a=[0];for(let i=1;i<points.length;i++)a.push(a.at(-1)+points[i].distanceTo(points[i-1]));return a;}
export function pointOnPath249(points,u,lengths=lengths250(points)){
 const d=Math.max(0,Math.min(1,u))*lengths.at(-1);let lo=1,hi=lengths.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(lengths[mid]<d)lo=mid+1;else hi=mid;}const i=lo;
 return points[i-1].clone().lerp(points[i],(d-lengths[i-1])/Math.max(1e-9,lengths[i]-lengths[i-1]));
}
export class FlowPath249{
 constructor(parent,color){this.root=new T.Group();parent.add(this.root);this.lineGeometry=new T.BufferGeometry();this.lineMaterial=new T.LineBasicMaterial({color,transparent:true,opacity:.8});this.line=new T.Line(this.lineGeometry,this.lineMaterial);this.root.add(this.line);this.pulseGeometry=new T.BufferGeometry();this.pulseMaterial=new T.PointsMaterial({color,size:.13,sizeAttenuation:true});this.pulses=new T.Points(this.pulseGeometry,this.pulseMaterial);this.root.add(this.pulses);this.points=[];}
 update(points,time,active=true){this.root.visible=active;if(!active)return;this.points=points;const cached=this.longBus250&&this.geometryPoints250===points;if(!cached){const data=points.flatMap(p=>p.toArray());if(this.lineGeometry.attributes.position?.count!==points.length)this.lineGeometry.setAttribute('position',new T.Float32BufferAttribute(data,3));else{this.lineGeometry.attributes.position.array.set(data);this.lineGeometry.attributes.position.needsUpdate=true;}this.lineGeometry.computeBoundingSphere();this.lengths250=lengths250(points);this.geometryPoints250=points;}const lengths=this.lengths250,count=this.longBus250?Math.min(512,Math.max(8,Math.ceil(lengths.at(-1)/24))):8,a=new Float32Array(count*3);for(let i=0;i<count;i++)pointOnPath249(points,((time*(this.longBus250?12/Math.max(1,lengths.at(-1)):.25)+i/count)%1+1)%1,lengths).toArray(a,i*3);if(this.pulseGeometry.attributes.position?.count!==count)this.pulseGeometry.setAttribute('position',new T.BufferAttribute(a,3));else{this.pulseGeometry.attributes.position.array.set(a);this.pulseGeometry.attributes.position.needsUpdate=true;}this.pulseGeometry.computeBoundingSphere();}
 dispose(){this.root.removeFromParent();this.lineGeometry.dispose();this.lineMaterial.dispose();this.pulseGeometry.dispose();this.pulseMaterial.dispose();}
}
// Dedicated illustrative rectifiers; SAF rooms are never used as traction supplies.
export function rectifierPositions250(line){const d=line?.distances||[];if(d.length<2)return [];return d.slice(1).map((x,i)=>(d[i]+x)/2);}
export function rectifierAnchors252(rooms=[]){return rooms.map((room,i)=>({id:room.userData?.id||String(i),x:room.userData?.x??room.position.x,z:room.position.z,side:room.userData?.side??(room.position.z<0?-1:1)}));}
export class RouteEnergy249{
 constructor(view){this.view=view;this.root=new T.Group();this.root.name='Circuito de tracción · esquema educativo';view.scene.add(this.root);this.paths=[];for(let i=0;i<12;i++)this.paths.push([this.path('#efb75e'),this.path('#64bac5')]);this.buses=[];this.feeders=[];this.sources=new T.Group();this.root.add(this.sources);this.active=false;this.lastV=0;this.lastTime=null;
  const host=document.querySelector('.sim106-view-tools')||document.getElementById('follow107-tools');this.button=document.createElement('button');this.button.textContent='Flujo de energía en vía';this.button.setAttribute('aria-pressed','false');host?.append(this.button);this.button.onclick=()=>{this.active=!this.active;this.button.setAttribute('aria-pressed',String(this.active));this.note.hidden=!this.active;};
  this.note=document.createElement('p');this.note.hidden=true;this.note.style.cssText='position:absolute;bottom:18px;left:12px;max-width:510px;background:#10282eef;color:white;padding:10px 14px;border-radius:8px;font-size:12px;line-height:1.5;pointer-events:none;z-index:8';document.getElementById('sim106-stage')?.append(this.note);
  const prior=view.scene.onBeforeRender;this.callback=(...args)=>{prior?.apply(view.scene,args);this.update();};view.scene.onBeforeRender=this.callback;this.prior=prior;
 }
 path(color){const p=new FlowPath249(this.root,color);for(const m of [p.lineMaterial,p.pulseMaterial]){m.depthTest=false;m.depthWrite=false;}p.lineMaterial.opacity=.65;p.pulseMaterial.sizeAttenuation=false;p.pulseMaterial.size=2.5;p.line.renderOrder=10000;p.pulses.renderOrder=10001;return p;}
 clearNetwork(){for(const p of [...this.buses,...this.feeders])p.dispose();this.buses=[];this.feeders=[];this.sources.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});this.sources.clear();}
 rail(t,x,y,z){return this.view.alignment97?this.view.alignment97.map(new T.Vector3(x,y,z)):new T.Vector3(x,y,z);}
 network(t,line){if(this.networkLine===line&&this.networkMap===this.view.alignment97&&this.networkRooms252===this.view.substations94)return;this.clearNetwork();this.networkLine=line;this.networkMap=this.view.alignment97;this.networkRooms252=this.view.substations94;const end=line?.distances?.at(-1)||1000;
  for(const direction of [-1,1]){const dummy={...t,direction};for(const side of [-1,1])for(const ret of [false,true]){const p=this.path(ret?'#64bac5':'#efb75e');p.longBus250=true;const points=[],steps=Math.ceil(end/6);for(let j=0;j<=steps;j++){const x=end*j/steps;points.push(this.rail(t,x,ret?.21:.57,trainTrack208(dummy,x)+side*(ret?.72:1.47)));}if(ret)points.reverse();p.fixed250=points;this.buses.push(p);}}
  const anchors=rectifierAnchors252(this.view.substations94);this.sourcePositions250=anchors.map(a=>a.x);this.sourceAnchors252=anchors;
  for(const [i,anchor] of anchors.entries()){
   const {x,z:sourceZ,side:sourceSide}=anchor,portZ=sourceZ-sourceSide*.12,center=this.rail(t,x,1.15,sourceZ+sourceSide*1.65),cabinet=new T.Mesh(new T.BoxGeometry(3,2.3,1.8),new T.MeshStandardMaterial({color:'#7c8887',metalness:.35,roughness:.65}));cabinet.position.copy(center);cabinet.name='SR didáctica '+(i+1);cabinet.userData.localId252=anchor.id;this.sources.add(cabinet);
   if(document.createElement('canvas').getContext){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');c.fillStyle='#173138';c.fillRect(0,0,512,96);c.fillStyle='#efcb92';c.font='bold 30px sans-serif';c.textAlign='center';c.fillText('SR '+String(i+1).padStart(2,'0')+' · DIDÁCTICA',256,59);const texture=new T.CanvasTexture(canvas),label=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));label.position.copy(this.rail(t,x,4.7,sourceZ+sourceSide*1.65));label.scale.set(7,1.3,1);this.sources.add(label);}
   for(const direction of [-1,1]){const dummy={...t,direction},z=trainTrack208(dummy,x);for(const side of [-1,1])for(const ret of [false,true]){const p=this.path(ret?'#64bac5':'#efb75e'),a=this.rail(t,x,ret?.21:.57,z+side*(ret?.72:1.47)),b=this.rail(t,x,1.1,portZ);p.fixed250=ret?[a,this.rail(t,x,-.25,z+side*.72),this.rail(t,x,-.25,portZ),b]:[b,this.rail(t,x,-.25,portZ),this.rail(t,x,-.25,z+side*1.47),a];this.feeders.push(p);}}}
 }
 update(){const v=this.view,s=v.getState(),e=s.engine,t=e.trains.find(t=>e.operator?t.id===e.operator.trainId:t.id===s.selectedTrain),model=t&&v.trainMeshes.get(t.id);this.root.visible=!!(this.active&&model?.group.visible);if(!this.root.visible)return;
  const key=t.line+':'+t.id;if(this.trainKey!==key){this.lastTime=null;this.lastA=0;this.lastV=t.speed;this.trainKey=key;}const now=e.time??0,dt=this.lastTime===null?0:now-this.lastTime,a=dt>0&&dt<2?(t.speed-this.lastV)/dt:(this.lastA||0);if(dt>0||this.lastTime===null){this.lastA=a;this.lastTime=now;this.lastV=t.speed;}
  const powered=!!e.power[t.line]&&!e.emergency,traction=e.operator?e.operator.throttle:t.wait>0||a<-.05?0:1;
  const st=electricState245({v:t.speed,a:Math.max(-3,Math.min(3,a)),load:t.load,capacity:e.capacity,traction,powered},window.metroDriving107?.electric245?.params||ASSUMED245);
  const state=!powered?'Sin alimentación':st.tractionKW>1?'Tracción':a<-.05?'Frenado · disipación térmica':'Servicios auxiliares';this.note.textContent=`${state} · ${Math.round(st.I).toLocaleString('es-MX')} A de línea · ${Math.round(st.inKW)} kW estimados. Ámbar: alimentación / captación · cian: retorno. Rectificación entre estaciones · captación izquierda y derecha. SR didáctica en cada local existente; función eléctrica real pendiente de verificar. Barras energizadas; sin cálculo de reparto entre SR.`;
  this.network(t,e.lines?.[t.line]);for(const p of [...this.buses,...this.feeders])p.update(p.fixed250,now,powered);this.sources.visible=powered;
  const cars=model.group.children.filter(c=>c.userData.formationReference?.powered);let n=0;
  for(const car of cars){for(const side of [-1,1]){if(n>=12)break;const index=car.userData.carIndex,d=t.direction||1,cs=t.position+d*(index-4)*16.7,x=cs+d*5.7,z=trainTrack208(t,x),local=(x,y,z)=>car.localToWorld(new T.Vector3(x,y,z));
   const contact=local(5.7,.55,side*1.44),converter=local(4.8,.75,.45),motor=local(5.7,.65,0),rail=this.rail(t,x,.57,z+side*d*1.47),ret=this.rail(t,x,.21,z+side*d*.72),load=st.tractionKW>1?motor:converter;
   const supply=[rail,contact,converter];if(st.tractionKW>1)supply.push(motor);
   this.paths[n][0].update(supply,now,powered);this.paths[n][1].update([load,local(5.7,.3,side*.72),ret],now,powered);n++;
  }}for(;n<12;n++)for(const p of this.paths[n])p.root.visible=false;
 }
 dispose(){this.clearNetwork();for(const pair of this.paths)pair.forEach(p=>p.dispose());this.root.removeFromParent();this.button.remove();this.note.remove();if(this.view.scene.onBeforeRender===this.callback)this.view.scene.onBeforeRender=this.prior;}
}
export function installRouteEnergy249(view){return view.energyFlow249??=new RouteEnergy249(view);}
