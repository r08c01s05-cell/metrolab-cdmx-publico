import {ProbeMotion143,probeParking143,probeContact143,probeTail143} from './measurement-probes143.js?v=143';
import {updateCable142} from './flexible-cable142.js?v=142';
import {fitProbe139} from './repair-tools139.js?v=205';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import * as THREE from 'three';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
const colours={red:'#b4473c',black:'#263033'};
// Both probes remain scene objects: connecting, disconnecting and parking never delete them.
export class MeterLeads123{
 constructor(rig){this.rig=rig;this.probes={};this.wires={};this.last={};this.motion143={};this.lastTime143=performance.now();this.root=new THREE.Group();this.root.name='Multimetro_puntas_y_cables123';rig.group.add(this.root);
  for(const colour of ['red','black']){
   const rubber=new THREE.MeshStandardMaterial({name:'Caucho punta '+colour+'123',color:colours[colour],roughness:.78}),steel=new THREE.MeshStandardMaterial({name:'Acero pulido punta123',color:'#aebbc0',metalness:.9,roughness:.25}),dark=new THREE.MeshStandardMaterial({name:'Aislante punta123',color:'#20282a',roughness:.83}),probe=new THREE.Group();probe.name='m123_probe_'+colour;probe.userData.grip118=[0,0,.15];
   const cylinder=(r1,r2,length,z,material)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,length,16),material);o.rotation.x=Math.PI/2;o.position.z=z;probe.add(o);};
   cylinder(.0022,.003,.035,.0175,steel);cylinder(.004,.012,.062,.066,dark);cylinder(.023,.023,.006,.098,rubber);cylinder(.014,.017,.115,.16,rubber);cylinder(.012,.008,.026,.23,dark);
   for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.0147,.0012,5,20),dark);ring.position.z=.13+i*.018;probe.add(ring);}
   const batches=new Map();for(const o of [...probe.children]){o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);probe.remove(o);o.geometry.dispose();}for(const[m,gs]of batches){probe.add(new THREE.Mesh(mergeGeometries(gs,false),m));gs.forEach(g=>g.dispose());}
   if(rig.probeTemplate139)fitProbe139(probe,rig.probeTemplate139,colour);const hit=new THREE.Mesh(new THREE.CapsuleGeometry(.026,.15,3,8),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=Math.PI/2;hit.position.z=.15;hit.userData.hitProxy123=true;probe.add(hit);
   const id=colour==='red'?'removeRedProbe':'removeBlackProbe';rig.parts[id]=probe;rig.pickRoots.push(probe);rig.group.add(probe);this.probes[colour]=probe;
   const cable=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({name:'Caucho cable '+colour+'123',color:colours[colour],roughness:.8}));cable.name='Cable_multimetro_'+colour+'123';cable.raycast=()=>{};this.root.add(cable);this.wires[colour]=cable;this.last[colour]={from:new THREE.Vector3(Infinity,0,0),end:new THREE.Vector3()};
   const holder=new THREE.Mesh(new THREE.CylinderGeometry(.021,.025,.055,20,1,true),dark.clone());holder.name='Soporte_punta_'+colour+'123';holder.position.set(colour==='red'?.35:-.35,-.25,.15);holder.raycast=()=>{};if(!rig.parts.meter.userData.type142)rig.parts.meter.add(holder);else{holder.geometry.dispose();holder.material.dispose();}
  }
  refineSurfaceMaterials100(this.root);for(const [colour,probe]of Object.entries(this.probes)){refineSurfaceMaterials100(probe);this.motion143[colour]=new ProbeMotion143(probe);this.motion143[colour].set(probeParking143(rig.parts.meter,colour),{immediate:true});}
 }
 sync(state){const rig=this.rig;for(const colour of ['red','black']){const probe=this.probes[colour],terminal=rig.parts[state.probes[colour]];this.motion143[colour].set(terminal?probeContact143(terminal,colour,1):probeParking143(rig.parts.meter,colour),{connected:!!terminal});probe.userData.handTarget=terminal?(colour==='red'?'removeRedProbe':'removeBlackProbe'):(colour==='red'?'selectRedProbe':'selectBlackProbe');}this.step();}

 step(dt){const now=performance.now();dt??=Math.min(.05,Math.max(0,(now-this.lastTime143)/1000));this.lastTime143=now;for(const m of Object.values(this.motion143))m.update(dt);const rig=this.rig;for(const colour of ['red','black']){const from=rig.group.worldToLocal(rig.parts.meter.localToWorld(rig.parts.meter.userData.type142?new THREE.Vector3(colour==='red'?.13:-.13,-.285,.125):new THREE.Vector3(colour==='red'?.10:-.10,-.30,.10))),end=rig.group.worldToLocal(probeTail143(this.probes[colour])),old=this.last[colour];if(from.distanceToSquared(old.from)+end.distanceToSquared(old.end)<1e-10)continue;old.from.copy(from);old.end.copy(end);const middle=from.clone().lerp(end,.5);middle.y=Math.max(.12,Math.min(from.y,end.y)-.22);middle.z=Math.max(from.z,end.z)+.10+(colour==='black'?.018:0);const points=[from,from.clone().add(new THREE.Vector3(.025,-.025,.055)),middle,end.clone().add(new THREE.Vector3(-.025,-.04,.035)),end],wire=this.wires[colour];updateCable142(wire,points,{radius:.0025});}}

}
export function syncMeterLeads123(rig,state){if(rig.id!=='electrical')return;rig.meterLeads123??=new MeterLeads123(rig);rig.meterLeads123.sync(state);}
export function actionObject123(rig,id,state){if(id==='clearProbes')return rig.parts[state.probes.red?'removeRedProbe':state.probes.black?'removeBlackProbe':'meter'];return rig.parts[id==='openTest'||id==='closeTest'?'doorSlideLeft':id==='rotateTest'?'newWheel':id];}
