import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
// Hardware remains parented to the original, pickable Blender nodes.
export function finishBench122(rig){if(rig.finish122)return rig;rig.finish122=true;
 const steel=new THREE.MeshStandardMaterial({name:'Acero satinado fijacion122',color:'#a2acaf',metalness:.86,roughness:.31}),dark=new THREE.MeshStandardMaterial({name:'Goma junta122',color:'#20292b',roughness:.88});
 for(const id of ['screw1','screw2','bolt1','bolt2']){const part=rig.parts[id];if(!part)continue;const group=new THREE.Group();group.name='Arandela_y_cabeza122';const washer=new THREE.Mesh(new THREE.TorusGeometry(.043,.004,6,24),steel);washer.position.z=.017;group.add(washer);const head=new THREE.Mesh(new THREE.CylinderGeometry(.032,.034,.012,6),steel);head.rotation.x=Math.PI/2;head.position.z=.023;group.add(head);const slot=new THREE.Mesh(new THREE.BoxGeometry(.038,.004,.0015),dark);slot.position.z=.0295;group.add(slot);part.add(group);}
 for(const id of ['wheel','newWheel']){const part=rig.parts[id];if(!part)continue;const rings=[.155,.405].map(r=>{const g=new THREE.TorusGeometry(r,.0028,5,64);g.translate(0,0,.134);return g;}),geometry=mergeGeometries(rings,false),mesh=new THREE.Mesh(geometry,steel);mesh.name='Anillos_mecanizado122';part.add(mesh);rings.forEach(g=>g.dispose());}
 if(rig.parts.plug){const geometries=[];for(let i=0;i<5;i++){const g=new THREE.TorusGeometry(.064,.0035,5,24);g.translate(0,0,-.055+i*.022);geometries.push(g);}const mesh=new THREE.Mesh(mergeGeometries(geometries,false),dark);mesh.name='Estrias_conector122';rig.parts.plug.add(mesh);geometries.forEach(g=>g.dispose());}
 return rig;}
