import * as THREE from'three';import{mergeGeometries}from'./vendor/BufferGeometryUtils.js';
// Background props are batched and never participate in maintenance picking.
export function addWorkshopBay117(parent){
 const materials={paint:new THREE.MeshStandardMaterial({name:'Pintura gabinete taller117',color:'#304c58',metalness:.08,roughness:.43}),steel:new THREE.MeshStandardMaterial({name:'Acero satinado taller117',color:'#8d999c',metalness:.86,roughness:.36}),dark:new THREE.MeshStandardMaterial({name:'Caucho ruedas carro117',color:'#1b282e',roughness:.87}),yellow:new THREE.MeshStandardMaterial({name:'Pintura amarilla piso117',color:'#b09a65',roughness:.72})},buckets=new Map();
 function add(g,m,x,y,z,rx=0,rz=0){if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}g.rotateX(rx);g.rotateZ(rz);g.translate(x,y,z);if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(g);}
 function bevel(w,h,d){const r=.012,s=new THREE.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,steps:1});g.translate(0,0,-d/2+r);return g;}
 for(const x of[-3.8,3.8]){add(bevel(.95,1.1,.56),materials.paint,x,.59,-.34);for(let i=0;i<4;i++){const y=.23+i*.235;add(bevel(.84,.20,.04),materials.paint,x,y,-.03);add(new THREE.CapsuleGeometry(.009,.30,2,8),materials.steel,x,y+.02,.004,0,Math.PI/2);}for(const dx of[-.31,.31])for(const z of[-.53,-.16])add(new THREE.CylinderGeometry(.085,.085,.045,12),materials.dark,x+dx,-.055,z,0,Math.PI/2);add(bevel(1.02,.05,.63),materials.steel,x,1.17,-.34);}
 // Painted limits give the bank an actual work zone within the larger room.
 for(let i=0;i<22;i++)for(const z of[-.57,1.5])add(new THREE.BoxGeometry(.17,.006,.11),i%2?materials.dark:materials.yellow,-2.95+i*.28,-.133,z);
 for(const x of[-3.1,3.1])add(new THREE.BoxGeometry(.06,.006,2.07),materials.yellow,x,-.133,.465);
 // Return pipes and mounting clips introduce scale and depth behind the bay.
 for(const x of[-2.8,2.8]){add(new THREE.CylinderGeometry(.023,.023,3.04,12),materials.steel,x,1.38,-.60);for(const y of[.35,1.4,2.4])add(new THREE.BoxGeometry(.12,.05,.09),materials.dark,x,y,-.62);}
 const group=new THREE.Group();group.name='Bahia_taller117';for(const[m,gs]of buckets){const geometry=mergeGeometries(gs,false),mesh=new THREE.Mesh(geometry,m);mesh.raycast=()=>{};group.add(mesh);gs.forEach(g=>g.dispose());}parent.add(group);return group;
}
