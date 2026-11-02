import {passengerCarPose211} from './passenger-car211.js?v=212';
import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {wardrobeFor} from './passenger-wardrobe.js?v=144';
import {avatarDetail119,applyCloth120} from './passenger-cloth119.js?v=130';

// Vertex clustering for distant GLB silhouettes. Textures and material roles survive.
function simplify121(g,step=.024,uvGrid=4,headStart=1.35){
 const p=g.getAttribute('position'),uv=g.getAttribute('uv'),colour=g.getAttribute('color'),detail=g.getAttribute('uv3'),map=new Map(),indices=new Uint32Array(p.count),vertices=[];
 for(let i=0;i<p.count;i++){
  const detailStep=p.getY(i)>headStart?Math.min(step,.030):step;const key=Math.round(p.getX(i)/detailStep)+','+Math.round(p.getY(i)/detailStep)+','+Math.round(p.getZ(i)/detailStep)+':'+Math.floor((uv?.getX(i)||0)*uvGrid)+','+Math.floor((uv?.getY(i)||0)*uvGrid);
  let n=map.get(key);if(n===undefined){n=vertices.length;map.set(key,n);vertices.push(i);}indices[i]=n;
 }
 const faces=[],seen=new Set(),source=g.index?.array||Array.from({length:p.count},(_,i)=>i);
 for(let i=0;i<source.length;i+=3){
  const a=indices[source[i]],b=indices[source[i+1]],c=indices[source[i+2]];
  if(a===b||b===c||a===c)continue;
  const key=[a,b,c].sort((x,y)=>x-y).join(',');if(seen.has(key))continue;seen.add(key);faces.push(a,b,c);
 }
 const out=new THREE.BufferGeometry(),positions=[],uvs=[],details=[],colours=[];
 for(const i of vertices){positions.push(p.getX(i),p.getY(i),p.getZ(i));uvs.push(uv?.getX(i)||0,uv?.getY(i)||0);details.push(detail?.getX(i)||0,detail?.getY(i)||0);colours.push(colour?.getX(i)??1,colour?.getY(i)??1,colour?.getZ(i)??1);}
 out.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));out.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));out.setAttribute('uv3',new THREE.Float32BufferAttribute(details,2));out.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));out.setIndex(faces);out.computeVertexNormals();out.computeBoundingBox();out.computeBoundingSphere();return out;
}
export function selectDetailed121(actors,camera,limit=64){
 if(!camera||actors.length<=limit)return new Set(actors.map(a=>a.id));
 // Moving passengers share the same finite skeleton budget. Distant boarding
 // flows retain their paths through instanced walking poses instead of each
 // allocating a full animated character.
 const near=actors.map(a=>({actor:a,d:Math.hypot(a.x-camera.position.x,a.z-camera.position.z)})).filter(p=>p.d<24);
 near.sort((a,b)=>(a.d-(a.actor.flow?1.5:0))-(b.d-(b.actor.flow?1.5:0)));
 return new Set(near.slice(0,Math.max(0,limit)).map(p=>p.actor.id));
}
export class InstancedPassengers121{
 constructor(scene,factory,capacity=1160){
  this.factory=factory;this.capacity=capacity;this.group=new THREE.Group();this.group.name='Pasajeros_distantes121';scene.add(this.group);
  this.buckets=new Map();this.templateIds=new WeakMap();this.nextId=0;this.colours121=new Map();this.white=new THREE.Color(1,1,1);
  this.matrix=new THREE.Matrix4();this.position=new THREE.Vector3();this.quaternion=new THREE.Quaternion();this.scale=new THREE.Vector3();this.axis=new THREE.Vector3(0,1,0);
 }
 prototype(template,actor,phase,variant){
  if(!this.templateIds.has(template))this.templateIds.set(template,this.nextId++);
  const key=this.templateIds.get(template)+':'+variant+':'+(actor.pose==='seated'?'seat':actor.moving?'walk'+phase:'idle'+phase);
  if(this.buckets.has(key))return this.buckets.get(key);
  const item=this.factory.create(template);
  item.root.traverse(o=>{if(o.morphTargetInfluences?.length)o.morphTargetInfluences[0]=variant;});
  applyCloth120(item,'background:plain');avatarDetail119(item,100);
  const sample={...actor,id:'prototype:'+phase,modelType:'woman',x:0,y:0,z:0,yaw:0,grip:undefined,seatHeight:(actor.seatHeight??actor.y+.505)-actor.y};
  this.factory.pose(item,sample,actor.moving?phase*(template.walkDuration137||1)/(template.imported137?3:4):phase*1.4);
  item.root.updateMatrixWorld(true);item.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.update();});
  const inverse=item.root.matrixWorld.clone().invert(),parts=new Map(),v=new THREE.Vector3();
  item.root.traverse(o=>{
   if(!o.isMesh||!o.visible||Array.isArray(o.material))return;
   for(let p=o.parent;p&&p!==item.root;p=p.parent)if(!p.visible)return;
   if(/Cornea|Teeth|Tongue|Eyelash|Eye_lash/i.test(o.name+' '+o.material.name))return;
   const g=o.geometry.clone(),m=new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld),p=g.getAttribute('position');
   for(let i=0;i<p.count;i++){o.getVertexPosition(i,v);v.applyMatrix4(m);p.setXYZ(i,v.x,v.y,v.z);}
   g.morphAttributes={};for(const a of Object.keys(g.attributes))if(!['position','normal','uv','uv3','color'].includes(a))g.deleteAttribute(a);
   const low=simplify121(g,template.imported137?.055:.035,template.imported137?2:3,actor.pose==='seated'?.95:1.35);g.dispose();const role=o.userData.wardrobeRole||o.material.userData?.wardrobeRole||(/Std_Eye_[LR]/.test(o.material.name)?'eyes':null),partKey=role||o.material.uuid;
   if(!parts.has(partKey))parts.set(partKey,{role,material:o.material,geometries:[]});parts.get(partKey).geometries.push(low);
  });
  const meshes=[];
  for(const data of parts.values()){
   const geometry=mergeGeometries(data.geometries,false);data.geometries.forEach(g=>g.dispose());if(!geometry)continue;
   const material=new THREE.MeshStandardMaterial();THREE.MeshStandardMaterial.prototype.copy.call(material,data.material);
   if(data.role)material.color.set(0xffffff);material.vertexColors=true;material.onBeforeCompile=THREE.Material.prototype.onBeforeCompile;material.customProgramCacheKey=THREE.Material.prototype.customProgramCacheKey;
   const mesh=new THREE.InstancedMesh(geometry,material,this.capacity);mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.userData.role121=data.role;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.group.add(mesh);meshes.push(mesh);
  }
  item.wardrobeMaterials?.forEach?.(m=>m.dispose());item.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});
  const bucket={key,meshes,count:0};this.buckets.set(key,bucket);return bucket;
 }
 update(entries,time,route,train){
  this.cabinInstances211=[];
  for(const b of this.buckets.values())b.count=0;
  for(const {actor,template,hash} of entries){
   const cycle=template.walkDuration137||1,phases=template.imported137?3:4,phase=actor.moving?Math.floor(((time+(hash%1000)/1000)%cycle)/cycle*phases):0,variant=template.newFemale119&&!template.imported137?(hash>>>9)&1:0,b=this.prototype(template,actor,phase,variant),n=b.count;
   const pose=passengerCarPose211(actor,route,train);this.position.set(pose?.x??actor.x,actor.y,pose?.z??actor.z);this.quaternion.setFromAxisAngle(this.axis,actor.yaw+(pose?.yaw||0));this.scale.setScalar(actor.modelType==='child'?.72:1);this.matrix.compose(this.position,this.quaternion,this.scale);
   let colours=this.colours121.get(actor.id);if(!colours){colours=wardrobeFor(actor.id);this.colours121.set(actor.id,colours);if(this.colours121.size>this.capacity*3)this.colours121.delete(this.colours121.keys().next().value);}
   for(const mesh of b.meshes){mesh.setMatrixAt(n,this.matrix);const colour=colours[mesh.userData.role121];mesh.setColorAt(n,colour?colour:this.white);}if(actor.location==='cabin')this.cabinInstances211.push({actor,index:n,meshes:b.meshes});b.count++;
  }
  for(const b of this.buckets.values())for(const mesh of b.meshes){mesh.count=b.count;mesh.visible=b.count>0;if(b.count){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}}
  this.actorCount=entries.length;this.group.visible=entries.length>0;
 }
}
