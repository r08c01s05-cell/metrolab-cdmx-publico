import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export function detailBench132(rig){if(rig.detail132)return rig;rig.detail132=true;
 const steel=new THREE.MeshStandardMaterial({name:'Acero mecanizado banco132',color:'#a3acae',metalness:.85,roughness:.36}),cast=new THREE.MeshStandardMaterial({name:'Fundicion motor132',color:'#667071',metalness:.38,roughness:.70}),rubber=new THREE.MeshStandardMaterial({name:'Goma banda banco132',color:'#262c2c',roughness:.88});
 const buckets=new Map();function add(parent,g,m,x=0,y=0,z=0,rx=0,rz=0){g.rotateX(rx);g.rotateZ(rz);g.translate(x,y,z);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}const key=parent.uuid+m.uuid;if(!buckets.has(key))buckets.set(key,{parent,m,gs:[]});buckets.get(key).gs.push(g);}
 const box=(p,x,y,z,w,h,d,m)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 if(['ventilation','electrical'].includes(rig.id))for(const sign of[-1,1])for(const y of[.50,1.76]){box(rig.group,sign*1.30,y,-.22,.64,.07,.10,cast);box(rig.group,sign*.99,y,-.13,.08,.14,.12,steel);}
 if(rig.id==='ventilation'){
  const rotor=rig.parts.rotor;if(rotor){for(const child of [...rotor.children]){child.removeFromParent();child.geometry?.dispose();}const blade=new THREE.Shape();blade.moveTo(.08,-.025);blade.bezierCurveTo(.20,-.04,.47,-.16,.55,-.07);blade.bezierCurveTo(.60,.04,.47,.20,.34,.23);blade.bezierCurveTo(.23,.18,.17,.08,.08,.04);blade.closePath();for(let i=0;i<7;i++)add(rotor,new THREE.ExtrudeGeometry(blade,{depth:.012,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:12}),cast,0,0,0,0,i*Math.PI*2/7);add(rotor,new THREE.CylinderGeometry(.095,.12,.085,32),steel,0,0,.04,Math.PI/2);}
  const motor=new THREE.Group();motor.name='Motor_ventilacion132';motor.position.set(0,1.12,-.09);rig.group.add(motor);add(motor,new THREE.CylinderGeometry(.20,.20,.27,32),cast,0,0,0,Math.PI/2);for(let i=0;i<12;i++){const a=i*Math.PI/6;add(motor,new THREE.BoxGeometry(.016,.035,.25),cast,Math.cos(a)*.20,Math.sin(a)*.20,0,0,a-Math.PI/2);}box(motor,.16,.13,-.03,.14,.13,.13,cast);box(motor,0,-.23,0,.48,.06,.25,steel);
 }
 if(rig.id==='doors'){
  const drive=new THREE.Group();drive.name='Entrainement_porte132';drive.position.set(-.5,2.43,.12);rig.group.add(drive);add(drive,new THREE.CylinderGeometry(.062,.062,.21,24),cast,0,0,0,0,Math.PI/2);box(drive,.15,0,0,.10,.15,.14,steel);for(const x of[-.11,-.055,0,.055])add(drive,new THREE.TorusGeometry(.064,.004,5,24).rotateY(Math.PI/2),steel,x,0,0);
 }
 if(rig.id==='running')for(const id of['wheel','newWheel']){const p=rig.parts[id];for(let i=0;i<48;i++){const a=i*Math.PI/24;add(p,new THREE.BoxGeometry(.004,.017,.17),rubber,Math.cos(a)*.613,Math.sin(a)*.613,0,0,a-Math.PI/2);}for(const r of[.49,.565])add(p,new THREE.TorusGeometry(r,.0018,5,96),rubber,0,0,.147);}
 for(const{parent,m,gs}of buckets.values()){const geometry=mergeGeometries(gs,false);const mesh=new THREE.Mesh(geometry,m);mesh.name=m.name;parent.add(mesh);if(!parent.userData.handTarget)mesh.raycast=()=>{};gs.forEach(g=>g.dispose());}return rig;
}
