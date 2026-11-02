import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {repairTools116} from './repair-tools116.js?v=134';
// Static workshop context: shared materials and merged geometry, never pickable.
export function workshopDetail132(room){
 const group=new THREE.Group();group.name='Taller_equipado132';const materials={paint:new THREE.MeshStandardMaterial({name:'Pintura taller132',color:'#465559',roughness:.61,metalness:.12}),steel:new THREE.MeshStandardMaterial({name:'Acero taller132',color:'#a2aaab',roughness:.38,metalness:.84}),dark:new THREE.MeshStandardMaterial({name:'Goma taller132',color:'#282c2c',roughness:.89}),wood:new THREE.MeshStandardMaterial({name:'Tablero banco132',color:'#74695a',roughness:.86}),light:new THREE.MeshStandardMaterial({name:'Difusor taller132',color:'#d9e1df',roughness:.5,emissive:'#a7b5b5',emissiveIntensity:.24})},buckets=new Map();
 function add(geometry,m,x,y,z,rx=0,rz=0){geometry.rotateX(rx);geometry.rotateZ(rz);geometry.translate(x,y,z);if(geometry.index){const old=geometry;geometry=old.toNonIndexed();old.dispose();}if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(geometry);}
 const box=(x,y,z,w,h,d,m=materials.paint)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const bar=(x,y,z,r,h,m=materials.steel,rx=0,rz=0)=>add(new THREE.CylinderGeometry(r,r,h,16),m,x,y,z,rx,rz);
 // Continuous floor joints, wall skirting and overhead cable tray give the room scale.
 for(let x=-6;x<=6;x+=2)box(x,-.135,1,.004,.002,8,materials.dark);
 for(let z=-2;z<=5;z+=2)box(0,-.135,z,12,.002,.004,materials.dark);
 box(.35,.02,-.69,12,.19,.035,materials.dark);
 for(const x of[-4,0,4]){box(x,3.46,-.62,2.8,.66,.035,materials.steel);box(x,3.46,-.59,2.7,.56,.024,materials.light);for(const d of[-.9,0,.9])box(x+d,3.46,-.565,.022,.56,.02,materials.paint);}
 box(.35,3.02,-.51,11,.045,.23,materials.steel);for(let i=0;i<36;i++)box(-5+i*.3,3.055,-.51,.02,.10,.24,materials.steel);
 for(const x of[-3,3]){box(x,3.8,.5,.10,.065,2.8,materials.paint);box(x,3.76,.5,.065,.015,2.65,materials.light);}
 // Worktop and perforated tool board flank the active rig, leaving the interaction area clear.
 for(const x of[-2.85,2.85]){
  box(x,.70,-.02,1.05,.07,.84,materials.wood);for(const d of[-.43,.43]){box(x+d,.28,-.24,.055,.84,.055);box(x+d,.28,.26,.055,.84,.055);}box(x,.05,-.02,.94,.04,.64,materials.steel);
  box(x,1.4,-.62,1.05,1.15,.04);for(let i=0;i<9;i++)for(let j=0;j<9;j++)bar(x-.43+i*.107,1+j*.10,-.59,.007,.004,materials.dark,Math.PI/2);
  const tools=repairTools116();let i=0;for(const tool of Object.values(tools)){tool.position.set(x-.31+i*.28,1.22,-.51);tool.rotation.z=i===1?-.17:0;tool.scale.setScalar(1.15);group.add(tool);tool.traverse(o=>{if(o.isMesh)o.raycast=()=>{};});i++;}
  for(let i=0;i<3;i++){box(x-.30+i*.3,.80,-.23,.25,.13,.27);box(x-.30+i*.3,.83,-.09,.21,.065,.006,materials.dark);}
  const mat=new THREE.Mesh(new THREE.BoxGeometry(.83,.007,.30),materials.dark);mat.position.set(x,.741,.18);group.add(mat);
 }
 // Roll-up service door, handles and safety boundary remain in the background.
 box(5,1.45,-.66,1.45,3,.07,materials.steel);for(let i=0;i<17;i++)box(5,.05+i*.17,-.61,1.35,.006,.012,materials.dark);box(5,.92,-.55,.23,.025,.04,materials.dark);
 for(const[m,gs]of buckets){const mesh=new THREE.Mesh(mergeGeometries(gs,false),m);mesh.name=m.name;mesh.raycast=()=>{};mesh.receiveShadow=true;group.add(mesh);gs.forEach(g=>g.dispose());}

 group.traverse(o=>{if(o.isMesh){o.raycast=()=>{};o.receiveShadow=true;o.castShadow=o.material!==materials.light;}});room.add(group);return group;
}
