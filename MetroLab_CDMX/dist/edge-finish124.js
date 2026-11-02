import * as THREE from 'three';
import {materialCategory115} from './material-realism110.js?v=205';
const cache=new WeakMap();
// Restrict fillets to plain rectangular solids. Glass, signs, skin and authored UVs survive.
export function edgeFinish124(root){if(root.userData.edgeFinish124)return root.userData.edgeFinish124;root.updateMatrixWorld(true);let base=0;root.traverse(o=>{if(o.isMesh)base+=o.geometry.attributes.position?.count||0;});const budget=Math.min(11520,Math.max(576,base*.12));let added=0,count=0;
 root.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||Array.isArray(o.material))return;const g=o.geometry,m=o.material,p=g.attributes.position,kind=m.userData.realism110||materialCategory115(m);
 if(!p||![24,36].includes(p.count)||g.morphAttributes.position?.length||g.attributes.skinIndex||!['paint','panel','seat','brushed','polished','steel','copper','cast','rubber'].includes(kind)||m.map||m.normalMap&&!m.normalMap.userData.quality110Shared||added+96-p.count>budget)return;
 const normals=g.attributes.normal;if(!normals)return;for(let i=0;i<normals.count;i++)if(Math.max(Math.abs(normals.getX(i)),Math.abs(normals.getY(i)),Math.abs(normals.getZ(i)))<.9999)return;
 g.computeBoundingBox();const b=g.boundingBox,size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3()),scale=o.getWorldScale(new THREE.Vector3()),real=size.clone().multiply(scale),small=Math.min(real.x,real.y,real.z);if(small<.018||Math.max(real.x,real.y,real.z)>25||Math.min(scale.x,scale.y,scale.z)<.0001)return;
 for(let i=0;i<p.count;i++)for(const [j,axis]of ['x','y','z'].entries()){const v=[p.getX(i),p.getY(i),p.getZ(i)][j];if(Math.min(Math.abs(v-b.min[axis]),Math.abs(v-b.max[axis]))>Math.max(.000001,size[axis]*.00001))return;}
 const radius=Math.min(.0035,Math.max(.0008,small*.045)),key=[real.x,real.y,real.z,radius,scale.x,scale.y,scale.z].map(n=>n.toPrecision(7)).join(':'),variants=cache.get(g)||new Map();if(!cache.has(g))cache.set(g,variants);
 if(!variants.has(key)){const rounded=new THREE.BoxGeometry(1,1,1,3,3,3),pos=rounded.attributes.position,norm=rounded.attributes.normal,half=real.clone().multiplyScalar(.5),inner=half.clone().addScalar(-radius),q=new THREE.Vector3(),c=new THREE.Vector3(),dir=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){for(const axis of ['x','y','z']){const v=pos['get'+axis.toUpperCase()](i);q[axis]=Math.sign(v)*(Math.abs(v)>.4?half[axis]:inner[axis]);c[axis]=THREE.MathUtils.clamp(q[axis],-inner[axis],inner[axis]);}dir.copy(q).sub(c).normalize();q.copy(c).addScaledVector(dir,radius).divide(scale).add(center);pos.setXYZ(i,q.x,q.y,q.z);dir.multiply(scale).normalize();norm.setXYZ(i,dir.x,dir.y,dir.z);}
  rounded.computeBoundingBox();rounded.computeBoundingSphere();rounded.userData.edgeFinish124={radiusMeters:radius,sourceVertices:p.count};variants.set(key,rounded);
 }o.geometry=variants.get(key);o.userData.edgeFinish124=true;added+=o.geometry.attributes.position.count-p.count;count++;
 });root.userData.edgeFinish124={count,addedVertices:added,budget};return root.userData.edgeFinish124;}
