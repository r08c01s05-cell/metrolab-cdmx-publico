import * as THREE from 'three';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
// Peripheral cabin structure for the first-person console. No glass or destination
// board crosses the viewing aperture. World/exterior models retain their own shell.
const aperture155=[[-.91,-1.08],[.91,-1.08],[.94,.55],[.84,.85],[-.84,.85],[-.94,.55]];
function ring155(outer,inner,camera,depth){
 const h=Math.tan(camera.fov*Math.PI/360)*depth,w=h*camera.aspect,positions=[],uv=[];
 const vertex=p=>{positions.push(camera.position.x+p[0]*w,camera.position.y+p[1]*h,camera.position.z-depth);uv.push(p[0]*w,p[1]*h);};
 for(let i=0;i<inner.length;i++){const j=(i+1)%inner.length;for(const p of [outer[i],outer[j],inner[j],outer[i],inner[j],inner[i]])vertex(p);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function createCabinSurround155(){
 const root=new THREE.Group();root.name='Envolvente interior de cabina155';root.userData.cabinSurround155=true;
 const paint=new THREE.MeshStandardMaterial({name:'Panel marfil cabina155',color:'#b5bab3',roughness:.64,metalness:.06,side:THREE.DoubleSide});
 const seal=new THREE.MeshStandardMaterial({name:'Goma junta parabrisas155',color:'#171f21',roughness:.86,side:THREE.DoubleSide});
 const accent=new THREE.MeshStandardMaterial({name:'Pintura borde cabina155',color:'#ba612d',roughness:.48,metalness:.12,side:THREE.DoubleSide});
 const meshes=[paint,accent,seal].map(m=>new THREE.Mesh(new THREE.BufferGeometry(),m));for(const m of meshes){m.frustumCulled=false;root.add(m);}
 const outer=aperture155.map(([x,y])=>[x<0?-1.16:1.16,y<0?-1.16:1.16]);
 const border=aperture155.map(([x,y])=>[x*(1.022),y>0?y+.025:y]);
 const gasket=aperture155.map(([x,y])=>[x*(1.011),y>0?y+.014:y]);
 return{root,setVariant(kind){accent.color.set(kind==='modern'?'#ba612d':'#477367');},resize(camera){
  for(const[m,out,inside,depth]of [[meshes[0],outer,border,2.19],[meshes[1],border,gasket,2.18],[meshes[2],gasket,aperture155,2.17]]){m.geometry.dispose();m.geometry=ring155(out,inside,camera,depth);}
  delete root.userData.edgeFinish124;refineSurfaceMaterials100(root);root.updateMatrixWorld(true);
 },aperture:aperture155};
}
