import * as T from 'three';
import {puffTexture226,Smoke226} from './fault-realism226.js?v=229';

// Animaciones visibles 235: every lab scenario gets its own, clearly readable phenomenon on the
// 3D model, on top of a shared state beacon and floor ring (green, amber, red). Everything is a
// pure function of the absolute sample (progress, signals, outcome), so seeking, pausing and the
// display rate give the same picture. Illustrative study effects, not a physical solver.
const OK235=new T.Color('#36d17c'),WARN235=new T.Color('#ffb020'),FAULT235=new T.Color('#ff3b2f');
const hash235=(i,k=0)=>{const h=Math.sin(i*12.9898+k*78.233)*43758.5453;return h-Math.floor(h);};
const smooth235=(x,a,b)=>T.MathUtils.smoothstep(x,a,b);
export function stateColour235(level,target=new T.Color()){return level<1?target.copy(OK235).lerp(WARN235,level):target.copy(WARN235).lerp(FAULT235,Math.min(1,level-1));}
// 0 = normal, 1 = anomaly developing, 2 = protection / consequence.
export function stateLevel235(p){return p<.2?0:p<.75?Math.min(1,(p-.2)/.06):1+Math.min(1,(p-.75)/.04);}

export class FaultShow235{
 constructor(anim){
  this.anim=anim;this.model=anim.model;this.domain=anim.domain;this.effects=new Map();
  const glow=new Uint8Array(64*64*4);for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=(y*64+x)*4,r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5);glow[n]=glow[n+1]=glow[n+2]=255;glow[n+3]=255*Math.max(0,1-r)**1.6;}
  this.glow=this.texture(new T.DataTexture(glow,64,64));this.puff=this.texture(puffTexture226());
  // Children are placed with world coordinates measured now. Train effects ride with the car:
  // each frame the group takes the car's motion since this moment (it stays out of the car's
  // own hierarchy so the model's framing bounds are unchanged).
  this.root=new T.Group();this.root.name='Animaciones visibles235';anim.root.add(this.root);
  this.model.root.updateMatrixWorld(true);this.build235=this.model.root.matrixWorld.clone().invert();this.root.matrixAutoUpdate=false;
  // One light that is never removed (toggling lights would recompile every material).
  this.light=new T.PointLight('#ffffff',0,7,1.6);this.root.add(this.light);
  this.car=this.domain==='train'?this.model.bounds():null;
  this.beacon=this.makeBeacon();this.ring=this.makeRing();
  if(this.domain==='train'){this.doors();this.air();this.supply();this.brake();}else{this.rectifier();this.feeder();this.charger();this.effects.set('sr-cooling',{group:new T.Group(),target:'transformer',apply(){}});}
  for(const e of this.effects.values()){this.root.add(e.group);e.group.visible=false;}
  this.active=null;
 }
 texture(t){t.needsUpdate=true;this.anim.textures.add(t);return t;}
 track(geometry,material){if(geometry)this.anim.geometry.add(geometry);if(material)this.anim.materials.add(material);}
 mesh(geometry,options,parent){const m=new T.MeshStandardMaterial({roughness:.5,...options});this.track(geometry,m);const o=new T.Mesh(geometry,m);parent.add(o);return o;}
 sprite(color,size,parent,opacity=0){const m=new T.SpriteMaterial({map:this.glow,color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending});this.track(null,m);const o=new T.Sprite(m);o.scale.setScalar(size);parent.add(o);return o;}
 // Glowing dots (Points with a soft round sprite); brightness in the colour acts as alpha.
 dots(count,size,parent){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(count*3),3));const m=new T.PointsMaterial({size,map:this.glow,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,sizeAttenuation:true});this.track(g,m);const o=new T.Points(g,m);o.frustumCulled=false;parent.add(o);
  return {o,count,set(i,x,y,z,c,k){g.attributes.position.setXYZ(i,x,y,z);g.attributes.color.setXYZ(i,c.r*k,c.g*k,c.b*k);},done(){g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;}};}
 // Short bright trails (sparks, arcs) with a glowing head so they read at any distance.
 lines(count,parent,head=.05){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(count*6),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(count*6),3));const m=new T.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending});this.track(g,m);const o=new T.LineSegments(g,m);o.frustumCulled=false;parent.add(o);
  const heads=this.dots(count,head,o);
  return {o,count,set(i,a,b,c,k){g.attributes.position.setXYZ(i*2,a.x,a.y,a.z);g.attributes.position.setXYZ(i*2+1,b.x,b.y,b.z);g.attributes.color.setXYZ(i*2,c.r*k*.35,c.g*k*.35,c.b*k*.35);g.attributes.color.setXYZ(i*2+1,c.r*k,c.g*k,c.b*k);heads.set(i,b.x,b.y,b.z,c,Math.min(1,k));},done(){g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;heads.done();}};}
 box(part){const b=this.model.bounds(part);return {b,c:b.getCenter(new T.Vector3()),s:b.getSize(new T.Vector3())};}
 // Rotating warning beacon on a short mast above the studied equipment.
 makeBeacon(){
  const g=new T.Group();g.name='Baliza de estado235';this.root.add(g);
  this.mesh(new T.CylinderGeometry(.012,.012,.32,10),{color:'#2b2f33',metalness:.6},g).position.y=-.2;
  this.mesh(new T.CylinderGeometry(.07,.08,.05,24),{color:'#1d2124',metalness:.4},g).position.y=-.04;
  const dome=this.mesh(new T.SphereGeometry(.065,24,12,0,Math.PI*2,0,Math.PI/2),{color:'#ffffff',emissive:'#36d17c',emissiveIntensity:2,transparent:true,opacity:.9},g);
  const beam=new T.Group();g.add(beam);beam.position.y=.03;
  for(const k of [1,-1]){const cone=new T.ConeGeometry(.09,.55,16,1,true);cone.translate(0,-.275,0);cone.rotateZ(k*Math.PI/2);const m=new T.MeshBasicMaterial({color:'#36d17c',transparent:true,opacity:.35,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});this.track(cone,m);beam.add(new T.Mesh(cone,m));}
  const halo=this.sprite('#36d17c',.5,g,.6);halo.position.y=.03;
  return {g,dome,beam,halo};
 }
 makeRing(){const geo=new T.RingGeometry(.86,1,72);geo.rotateX(-Math.PI/2);const m=new T.MeshBasicMaterial({color:'#36d17c',transparent:true,opacity:.5,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});this.track(geo,m);const o=new T.Mesh(geo,m);o.name='Anillo de estado235';this.root.add(o);
  const inner=new T.RingGeometry(.5,.54,72);inner.rotateX(-Math.PI/2);const m2=m.clone();this.track(inner,m2);const o2=new T.Mesh(inner,m2);o.add(o2);return {o,inner:o2};}

 // Rectificador: aire caliente que sube, ventilador que se frena, brillo térmico y chispa al abrir.
 rectifier(){
  const {b,c,s}=this.box('rectifier'),group=new T.Group();group.name='Sobretemperatura del rectificador235';
  const heat=this.dots(150,.09,group),glow=this.sprite('#ff5a1f',Math.max(s.x,s.y)*1.1,group);glow.position.set(c.x,b.max.y,c.z);
  const fan=this.fan(group,new T.Vector3(c.x,b.min.y+s.y*.35,b.min.z-.08),Math.min(.3,s.x*.16));
  const sparks=this.lines(70,group),top=new T.Vector3(c.x+s.x*.3,b.max.y,b.min.z);
  this.effects.set('sr-rectifier',{group,target:'rectifier',apply:(x)=>{
   const h=smooth235(x.signals.heat??0,.25,.9),t=x.time,col=new T.Color();
   for(let i=0;i<heat.count;i++){const life=(hash235(i)+t*.22)%1,px=c.x+(hash235(i,1)-.5)*s.x*.9+Math.sin(t*2+i)*.06*life,pz=c.z+(hash235(i,2)-.5)*s.z*.8;col.setRGB(1,.35+.45*(1-life),.08);heat.set(i,px,b.max.y+life*(.4+1.4*h),pz,col,h*(1-life)*1.4);}heat.done();
   glow.material.opacity=h*(.55+.25*Math.sin(t*6));this.fanApply(fan,x.outcome.fanAngle,x.signals.flow??0);
   this.burst(sparks,top,x.progress,.75,new T.Color('#ffd27a'));
   x.light={pos:top,color:'#ffd27a',k:this.flash(x.progress,.75)*18+h*3};}});
 }
 // Alimentador de CD: corriente que corre por el cable, arco del cortocircuito y apertura del interruptor.
 feeder(){
  const {b,c,s}=this.box('dc'),group=new T.Group();group.name='Cortocircuito en alimentador235';
  const y=b.max.y+.05,x0=b.min.x-1.2,x1=b.max.x+1.2,z=b.min.z-.1;
  const cable=new T.CylinderGeometry(.025,.025,x1-x0,12);cable.rotateZ(Math.PI/2);this.mesh(cable,{color:'#1b1e20',roughness:.6},group).position.set((x0+x1)/2,y,z);
  const current=this.dots(90,.11,group),arc=this.lines(28,group),sparks=this.lines(90,group),open=this.lines(70,group),fault=new T.Vector3(c.x+s.x*.2,b.min.y+s.y*.55,b.min.z-.06),arcGlow=this.sprite('#bfe0ff',1,group);arcGlow.position.copy(fault);
  this.effects.set('sr-feeder',{group,target:'dc',apply:(x)=>{
   const i=x.signals.current??0,line=x.signals.line??0,p=x.progress,t=x.time,shorted=p>=.2&&p<.75,col=new T.Color().copy(shorted?FAULT235:WARN235).lerp(new T.Color('#ffffff'),shorted?.15:.3);
   for(let k=0;k<current.count;k++){const u=(k/current.count+t*(.15+i*1.6))%1;current.set(k,x0+(x1-x0)*u,y,z-.07,col,line>0?(.6+i)*(.6+.4*hash235(k)):0);}current.done();
   // Jagged arc between the faulted point and the frame, redrawn every few hundredths of second.
   const seed=Math.floor(t*28),a=fault.clone(),end=fault.clone().add(new T.Vector3(.05,-.45,-.15)),blue=new T.Color('#cfe6ff');
   for(let k=0;k<arc.count;k++){const u0=k/arc.count,u1=(k+1)/arc.count,j=(u,n)=>u>0&&u<1?(hash235(seed*31+n)-.5)*.12:0,pa=a.clone().lerp(end,u0).add(new T.Vector3(j(u0,k),0,j(u0,k+50))),pb=a.clone().lerp(end,u1).add(new T.Vector3(j(u1,k+1),0,j(u1,k+51)));arc.set(k,pa,pb,blue,shorted&&hash235(seed)>.15?1.6:0);}arc.done();
   arcGlow.material.opacity=shorted?.6+.4*hash235(seed,3):0;arcGlow.scale.setScalar(.5+.6*hash235(seed,4));
   // Continuous spray while the short lasts, then the breaker opening flash.
   for(let k=0;k<sparks.count;k++){const life=.5+hash235(k,7)*.5,u=((t+hash235(k,8)*life)%life)/life,v=new T.Vector3((hash235(k,9)-.5)*2,1+hash235(k,10)*1.5,-.5-hash235(k,11)),q=fault.clone().add(v.clone().multiplyScalar(u*.5)).add(new T.Vector3(0,-2.4*u*u,0)),q0=q.clone().sub(v.clone().multiplyScalar(.03));sparks.set(k,q0,q,new T.Color('#ffc46b'),shorted?1.4*(1-u):0);}sparks.done();
   this.burst(open,new T.Vector3(c.x-s.x*.3,b.max.y,b.min.z),p,.75,new T.Color('#e8f1ff'));
   x.light={pos:fault,color:shorted?'#bfdcff':'#e8f1ff',k:shorted?6+10*hash235(seed,5):this.flash(p,.75)*20};}});
 }
 // Cargador y batería: energía que entra o sale, y un indicador de reserva por celdas.
 charger(){
  const {b,c,s}=this.box('battery'),group=new T.Group();group.name='Fallo del cargador235';
  const cells=[],base=new T.Vector3(c.x,b.max.y+.25,b.min.z),w=Math.min(.6,s.x*.5);
  this.mesh(new T.BoxGeometry(w+.06,.62,.05),{color:'#14181b',roughness:.4},group).position.set(base.x,base.y+.3,base.z);
  for(let k=0;k<5;k++)cells.push(this.mesh(new T.BoxGeometry(w,.09,.06),{color:'#0c0f10',emissive:'#36d17c',emissiveIntensity:0},group));
  cells.forEach((o,k)=>o.position.set(base.x,base.y+.06+k*.115,base.z-.01));
  const flow=this.dots(70,.1,group),src=new T.Vector3(b.min.x-1,c.y,b.min.z-.05),bus=new T.Vector3(b.max.x+1,c.y+.2,b.min.z-.05);
  this.effects.set('sr-charger',{group,target:'battery',apply:(x)=>{
   const r=x.signals.reserve??1,charging=(x.signals.charger??0)>0,busOn=(x.signals.bus??0)>0,t=x.time,col=new T.Color();
   const level=r*5,colour=r>.6?OK235:r>.3?WARN235:FAULT235,blink=r<.4?.5+.5*Math.sign(Math.sin(t*9)):1;
   cells.forEach((o,k)=>{const lit=Math.max(0,Math.min(1,level-k));o.material.emissive.copy(colour);o.material.emissiveIntensity=lit*2.2*blink;});
   for(let k=0;k<flow.count;k++){const u=(k/flow.count+t*.45)%1,from=charging?src:new T.Vector3(c.x,c.y,b.min.z-.05),to=charging?new T.Vector3(c.x,c.y,b.min.z-.05):bus,q=from.clone().lerp(to,u);q.y+=Math.sin(u*Math.PI)*.25;col.copy(charging?OK235:WARN235);flow.set(k,q.x,q.y,q.z,col,(charging||busOn)?1.1:0);}flow.done();
   x.light={pos:base,color:colour.getStyle(),k:r<.4?blink*4:0};}});
 }
 // Puertas: luces rojas que destellan sobre la pareja abierta y franja ámbar en el hueco.
 doors(){
  const box=this.anim.bounds('doors'),c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3()),group=new T.Group();group.name='Puertas sin enclavamiento235';
  const lamps=[-1,1].map(k=>{const o=this.mesh(new T.SphereGeometry(.06,16,10),{color:'#300',emissive:'#ff2a1a',emissiveIntensity:0},group);o.position.set(c.x+k*s.x*.35,box.max.y+.08,box.max.z+.05);return {o,glow:Object.assign(this.sprite('#ff2a1a',.6,group),{})};});
  lamps.forEach(l=>l.glow.position.copy(l.o.position));
  const gapGeo=new T.PlaneGeometry(1,s.y*.95),gapMat=new T.MeshBasicMaterial({color:'#ffb020',transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});this.track(gapGeo,gapMat);const gap=new T.Mesh(gapGeo,gapMat);gap.position.set(c.x,c.y,box.max.z+.04);group.add(gap);
  this.effects.set('train-doors',{group,target:'doors',apply:(x)=>{
   const open=x.outcome.doorOpening,on=x.progress>=.2&&Math.sin(x.time*10)>0;
   lamps.forEach((l,k)=>{const lit=x.progress>=.2&&(k?on:!on)?1:0;l.o.material.emissiveIntensity=lit*4;l.glow.material.opacity=lit*.9;});
   gap.scale.x=Math.max(.001,open*1.04);gap.material.opacity=open*(.45+.3*Math.sin(x.time*6));
   x.light={pos:new T.Vector3(c.x,box.max.y+.1,box.max.z+.3),color:'#ff2a1a',k:on?5:0};}});
 }
 // Aire: chorro que va del compresor a la reserva y un manómetro que baja.
 air(){
  const {b,c,s}=this.box('mechanics'),group=new T.Group();group.name='Compresor sin reposición235';
  const car=this.car,y=car.min.y+(car.max.y-car.min.y)*.24,z=car.max.z+.1,x0=car.min.x+1.4,x1=car.max.x-1.4,xc=T.MathUtils.clamp(c.x,x0+.5,x1-.5);
  const pipe=new T.CylinderGeometry(.03,.03,x1-x0,12);pipe.rotateZ(Math.PI/2);this.mesh(pipe,{color:'#aab4bb',metalness:.7,roughness:.3},group).position.set((x0+x1)/2,y,z);
  const pump=this.sprite('#7fe0ff',1.1,group);pump.position.set(xc,y,z+.05);
  const stream=this.dots(160,.26,group),leak=this.dots(50,.32,group);
  const dial=new T.Group();dial.position.set(c.x,car.min.y+(car.max.y-car.min.y)*.55,z+.05);dial.scale.setScalar(1.7);group.add(dial);
  this.mesh(new T.CylinderGeometry(.24,.24,.04,40),{color:'#eef1ee',roughness:.6},dial).rotation.x=Math.PI/2;
  this.mesh(new T.TorusGeometry(.24,.02,8,40),{color:'#3a4146',metalness:.7},dial);
  const red=new T.RingGeometry(.16,.21,24,1,Math.PI*.95,Math.PI*.35);this.mesh(red,{color:'#d33',emissive:'#d33',emissiveIntensity:.6,side:T.DoubleSide},dial).position.z=.025;
  const ok=new T.RingGeometry(.16,.21,24,1,-Math.PI*.25,Math.PI*.6);this.mesh(ok,{color:'#2a9',emissive:'#2a9',emissiveIntensity:.4,side:T.DoubleSide},dial).position.z=.025;
  const needleGeo=new T.BoxGeometry(.018,.2,.01);needleGeo.translate(0,.09,0);const needle=this.mesh(needleGeo,{color:'#111'},dial);needle.position.z=.035;
  this.effects.set('train-air',{group,target:'mechanics',apply:(x)=>{
   const on=(x.signals.compressor??0)>0,r=x.signals.reserve??1,t=x.time,white=new T.Color('#9be7ff');
   for(let k=0;k<stream.count;k++){const u=(k/stream.count*2+t*.6)%1,side=k%2?1:-1,end=side>0?x1:x0;stream.set(k,xc+(end-xc)*u,y+Math.sin(u*40+k)*.015,z+.09,white,on?1.1*(1-.5*u):0);}stream.done();pump.material.opacity=on?.6+.4*Math.abs(Math.sin(t*14)):0;
   // Consumption continues: little puffs leave the reserve even after the compressor stops.
   for(let k=0;k<leak.count;k++){const u=(hash235(k)+t*.5)%1;leak.set(k,x1+u*.4,y+u*.25*(hash235(k,2)-.2),z+u*.2,white,.5*(1-u)*Math.min(1,r*1.5));}leak.done();
   needle.rotation.z=Math.PI*.75-r*Math.PI*1.5;
   x.light={pos:dial.position,color:'#ff3b2f',k:r<.4?(Math.sin(t*8)>0?4:0):0};}});
 }
 // Captación: chispas azules en las zapatas mientras hay energía, corriente hacia los motores y
 // un destello cuando se pierde el contacto.
 supply(){
  const col=this.box('collectors'),mot=this.box('motors'),group=new T.Group();group.name='Pérdida de captación235';
  const shoe=new T.Vector3(col.c.x,col.b.min.y,Math.max(col.b.max.z,this.car.max.z-.1)),crackle=this.lines(40,group,.07),current=this.dots(80,.16,group),loss=this.lines(60,group,.08),halo=this.sprite('#8fd0ff',1.2,group);halo.position.copy(shoe);
  this.effects.set('train-supply',{group,target:'collectors',apply:(x)=>{
   const on=(x.signals.supply??0)>0,t=x.time,seed=Math.floor(t*24),blue=new T.Color('#8fd0ff');
   for(let k=0;k<crackle.count;k++){const a=shoe.clone().add(new T.Vector3((hash235(seed,k)-.5)*.3,0,0)),b=a.clone().add(new T.Vector3((hash235(seed,k+40)-.5)*.12,-.06-hash235(seed,k+80)*.1,(hash235(seed,k+120)-.5)*.1));crackle.set(k,a,b,blue,on&&hash235(seed,k+160)>.55?1.6:0);}crackle.done();
   for(let k=0;k<current.count;k++){const u=(k/current.count+t*.9)%1,q=shoe.clone().lerp(mot.c,u);q.y+=Math.sin(u*Math.PI)*.3;current.set(k,q.x,q.y,q.z,blue,on?1:0);}current.done();
   this.burst(loss,shoe,x.progress,.2,new T.Color('#bfe4ff'));halo.material.opacity=on?.55+.45*hash235(seed,11):this.flash(x.progress,.2);halo.scale.setScalar(on?.8+.6*hash235(seed,12):2.4);
   x.light={pos:shoe,color:'#8fd0ff',k:on?2+3*hash235(seed,9):this.flash(x.progress,.2)*16};}});
 }
 // Freno: chispas de fricción en el contacto rueda-riel, brillo azul del freno eléctrico en los
 // motores y humo cuando la rueda se bloquea (variante).
 brake(){
  const mot=this.box('motors'),group=new T.Group();group.name='Pérdida del freno eléctrico235';
  this.anim.model.root.updateMatrixWorld(true);
  const contacts=this.anim.wheels.length?this.anim.wheels.map(w=>{const p=w.pivot.getWorldPosition(new T.Vector3());p.y-=w.radius/1.42;p.z=this.car.max.z+.03;return p;}):[new T.Vector3(mot.c.x,mot.b.min.y,mot.c.z)];
  const sparks=this.lines(160,group,.11),hot=contacts.map(p=>{const o=this.sprite('#ff8a2a',.9,group);o.position.copy(p);return o;}),dyn=contacts.map(()=>this.sprite('#5ab8ff',.7,group));dyn.forEach((o,k)=>o.position.copy(contacts[k]).add(new T.Vector3(0,.35,0)));
  const smoke=new Smoke226(group,this.puff,contacts.map(p=>p.clone()),24,new T.Vector3(-.6,0,0));this.smoke235=smoke;
  this.effects.set('train-brake',{group,target:'motors',apply:(x)=>{
   const f=x.signals.friction??0,e=x.signals.electric??0,moving=x.outcome.moving,slide=x.outcome.sliding,t=x.time,orange=new T.Color('#ffb347'),n=sparks.count;
   for(let k=0;k<n;k++){const at=contacts[k%contacts.length],life=.25+hash235(k,3)*.35,u=((t+hash235(k,4)*life)%life)/life,v=new T.Vector3(-1.4-hash235(k,5)*1.6,.6+hash235(k,6)*1.1,(hash235(k,7)-.5)*.8),q=at.clone().add(v.clone().multiplyScalar(u*.9)).add(new T.Vector3(0,-2.6*u*u,0)),q0=q.clone().sub(v.clone().multiplyScalar(.07));
    const amount=moving?smooth235(f,.3,.9)*(slide?1.8:1):0;sparks.set(k,q0,q,orange,hash235(k,8)<amount*.75?1.5*(1-u):0);}sparks.done();
   dyn.forEach((o,k)=>{o.material.opacity=moving?e*(.7+.3*Math.sin(t*12+k)):0;});hot.forEach((o,k)=>{o.material.opacity=moving?smooth235(f,.3,.9)*(.6+.4*Math.abs(Math.sin(t*17+k*2))):0;});
   smoke.apply(t,slide?.9:0,1);
   x.light={pos:contacts[0],color:'#ffb347',k:moving?f*4:0};}});
 }
 fan(parent,at,radius){
  const g=new T.Group();g.position.copy(at);parent.add(g);
  this.mesh(new T.CylinderGeometry(radius*1.05,radius*1.05,radius*.3,36,1,true),{color:'#30363a',metalness:.55,side:T.DoubleSide},g).rotation.x=Math.PI/2;
  for(let k=1;k<=3;k++)this.mesh(new T.TorusGeometry(radius*k/3,radius*.015,4,40),{color:'#202427',metalness:.6},g).position.z=-radius*.16;
  const rotor=new T.Group();g.add(rotor);const blade=new T.BoxGeometry(radius*.36,radius*.88,radius*.03);blade.translate(0,radius*.47,0);this.track(blade);
  const blades=[];for(let j=0;j<5;j++){const m=this.mesh(blade,{color:'#6b747a',metalness:.35,transparent:true},rotor);m.rotation.z=j*Math.PI*2/5;m.rotation.y=.42;blades.push(m);}
  const disc=this.mesh(new T.CircleGeometry(radius*.94,36),{color:'#9aa3a8',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide},g);
  return {rotor,blades,disc};
 }
 fanApply(fan,angle,flow){fan.rotor.rotation.z=angle*1.6;const blur=smooth235(flow,.25,.8);for(const b of fan.blades)b.material.opacity=1-blur*.75;fan.disc.material.opacity=blur*.45;}
 flash(p,at){const since=(p-at)*16;return since>0&&since<.45?(.55+.45*Math.abs(Math.sin(since*95)))*(1-since/.45):0;}
 // One-off burst of sparks starting at progress `at` (about 1 s of flight under gravity).
 burst(lines,origin,p,at,colour){const since=(p-at)*16,live=since>0&&since<1.1;lines.o.visible=live;if(!live)return;
  for(let i=0;i<lines.count;i++){const a=i*2.399,u=(i*.618)%1,v=new T.Vector3(Math.cos(a)*(.6+u*1.4),.4+((i*.37)%1)*1.6,Math.sin(a)*(.6+u*1.4)),life=.35+((i*.53)%1)*.55,s=Math.min(since,life),k=Math.max(0,1-since/life),q=origin.clone().add(v.clone().multiplyScalar(s*.6)).add(new T.Vector3(0,-2.9*s*s,0)),q0=q.clone().sub(new T.Vector3(v.x,v.y-9.8*s,v.z).multiplyScalar(.02));lines.set(i,q0,q,colour,1.4*k);}lines.done();}
 apply(sample){
  const id=sample.scenario?.id,e=this.effects.get(id);
  for(const [key,f]of this.effects)f.group.visible=key===id;
  this.root.visible=!!e;this.light.intensity=0;if(!e)return;
  this.model.root.updateMatrixWorld(true);this.root.matrix.multiplyMatrices(this.model.root.matrixWorld,this.build235);
  const x={...sample,time:sample.progress*16,light:null};
  // Shared beacon and ring around the equipment under study.
  if(this.active!==id){this.active=id;const {b,c,s}=this.box(e.target);this.beacon.g.position.set(c.x,(this.car?this.car.max.y:b.max.y)+.42,this.car?this.car.getCenter(new T.Vector3()).z:c.z);this.ring.o.position.set(c.x,b.min.y+.02,c.z);this.ring.o.scale.setScalar(Math.max(.8,Math.hypot(s.x,s.z)*.62));}
  const level=stateLevel235(sample.progress),colour=stateColour235(level),spin=x.time*(level<1?2:level<2?5:8),pulse=.5+.5*Math.sin(x.time*(level<1?2:7));
  this.beacon.dome.material.emissive.copy(colour);this.beacon.dome.material.emissiveIntensity=1.5+pulse*2.5;this.beacon.beam.rotation.y=spin;
  for(const m of this.beacon.beam.children)m.material.color.copy(colour);this.beacon.beam.visible=level>=.5;this.beacon.halo.material.color.copy(colour);this.beacon.halo.material.opacity=.4+.5*pulse;
  this.ring.o.material.color.copy(colour);this.ring.o.material.opacity=.25+.45*pulse;this.ring.inner.material.color.copy(colour);this.ring.inner.material.opacity=.15+.3*(1-pulse);
  e.apply(x);
  if(x.light){this.light.position.copy(x.light.pos);this.light.color.set(x.light.color);this.light.intensity=x.light.k;}
 }
 dispose(){this.smoke235?.dispose();this.root.removeFromParent();}
}
