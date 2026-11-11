import {visualState105} from './visual-settings105.js?v=105';
import {passengerCarPose211} from './passenger-car211.js?v=212';
import * as THREE from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {wardrobeFor} from './passenger-wardrobe.js?v=225';
import {avatarDetail119,applyCloth120} from './passenger-cloth119.js?v=130';

// Vertex clustering for distant GLB silhouettes. Textures and material roles survive.
function simplify121(g,step=.024,uvGrid=4,headStart=1.35,headStep=.030){
 const p=g.getAttribute('position'),uv=g.getAttribute('uv'),colour=g.getAttribute('color'),detail=g.getAttribute('uv3'),map=new Map(),indices=new Uint32Array(p.count),vertices=[];
 for(let i=0;i<p.count;i++){
  const detailStep=p.getY(i)>headStart?Math.min(step,headStep):step;const key=Math.round(p.getX(i)/detailStep)+','+Math.round(p.getY(i)/detailStep)+','+Math.round(p.getZ(i)/detailStep)+':'+Math.floor((uv?.getX(i)||0)*uvGrid)+','+Math.floor((uv?.getY(i)||0)*uvGrid);
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
// Fluidez: distance tiers re-cluster the distant silhouette (tier 0 is the
// original instanced model). Distances in metres from the view camera, with
// hysteresis so a person does not flicker between tiers at the boundary.
// 260: tiers start closer and a fourth, coarser one covers the far end of the platform; the
// distances follow the chosen quality.
export const LOD_DISTANCES221=[22,50,110],LOD_FACTORS221=[1,1.9,3.2,6],LOD_HYSTERESIS221=2.5,LOD_QUALITY260={performance:.75,balanced:1,cinematic:1.5};
export function lodTier221(distance,previous=0,scale=1){
 let tier=0;for(let i=0;i<LOD_DISTANCES221.length;i++){const edge=LOD_DISTANCES221[i]*scale+(previous>i?-LOD_HYSTERESIS221:LOD_HYSTERESIS221);if(distance>edge)tier=i+1;}
 return tier;
}
// Only instances whose transform or colour actually changed are copied to the
// GPU; the whole 1160-slot buffers used to be re-uploaded on every frame.
function writeInstance221(attr,index,values,size,force,range){
 const a=attr.array,o=index*size;let changed=force;
 if(!changed)for(let k=0;k<size;k++)if(a[o+k]!==Math.fround(values[k])){changed=true;break;}
 if(!changed)return;for(let k=0;k<size;k++)a[o+k]=values[k];
 if(index<range.lo)range.lo=index;if(index>range.hi)range.hi=index;
}
// Meshes added from outside instancedMesh221 get the same bookkeeping lazily, as setColorAt did.
function ensureRanges221(mesh,capacity){
 const d=mesh.userData;d.matrixRange221??={lo:Infinity,hi:-1};d.colourRange221??={lo:Infinity,hi:-1};
 if(!mesh.instanceColor){const size=mesh.instanceMatrix.count||capacity;mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(size*3).fill(1),3);}
}
export function flushRange221(attr,range,size){
 if(range.hi<range.lo)return false;attr.addUpdateRange(range.lo*size,(range.hi-range.lo+1)*size);attr.needsUpdate=true;range.lo=Infinity;range.hi=-1;return true;
}
export class InstancedPassengers121{
 constructor(scene,factory,capacity=1160){
  this.factory=factory;this.capacity=capacity;this.group=new THREE.Group();this.group.name='Pasajeros_distantes121';scene.add(this.group);
  this.buckets=new Map();this.templateIds=new WeakMap();this.nextId=0;this.colours121=new Map();this.white=new THREE.Color(1,1,1);this.tiers221=new Map();this.camera=null;
  this.matrix=new THREE.Matrix4();this.position=new THREE.Vector3();this.quaternion=new THREE.Quaternion();this.scale=new THREE.Vector3();this.axis=new THREE.Vector3(0,1,0);this.rgb221=[1,1,1];
 }
 instancedMesh221(geometry,material,role){
  const mesh=new THREE.InstancedMesh(geometry,material,this.capacity);mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.userData.role121=role;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(this.capacity*3).fill(1),3);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  mesh.userData.matrixRange221={lo:Infinity,hi:-1};mesh.userData.colourRange221={lo:Infinity,hi:-1};this.group.add(mesh);return mesh;
 }
 prototype(template,actor,phase,variant,tier=0){
  if(!this.templateIds.has(template))this.templateIds.set(template,this.nextId++);
  const base=this.templateIds.get(template)+':'+variant+':'+(actor.pose==='seated'?'seat':actor.moving?'walk'+phase:'idle'+phase),key=tier?base+':lod'+tier:base;
  if(this.buckets.has(key))return this.buckets.get(key);
  if(tier){
   // Coarser tiers re-cluster the already simplified parts and share their materials.
   const source=this.prototype(template,actor,phase,variant,0),step=(template.imported137?.055:.035)*LOD_FACTORS221[tier],meshes=[];
   for(const original of source.meshes){
    const geometry=simplify121(original.geometry,step,template.imported137?2:3,actor.pose==='seated'?.95:1.35,.030*LOD_FACTORS221[tier]);
    // Fragments of a few triangles are sub-pixel at these distances but still cost a draw call each.
    if((geometry.index?.count||0)<24){geometry.dispose();continue;}
    meshes.push(this.instancedMesh221(geometry,original.material,original.userData.role121));
   }
   const bucket={key,meshes,count:0,tier};this.buckets.set(key,bucket);return bucket;
  }
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
   const geometry=mergeGeometries(data.geometries,false);data.geometries.forEach(g=>g.dispose());if(!geometry)continue;if(!geometry.index?.count){geometry.dispose();continue;}
   const material=new THREE.MeshStandardMaterial();THREE.MeshStandardMaterial.prototype.copy.call(material,data.material);
   if(data.role)material.color.set(0xffffff);material.vertexColors=true;material.onBeforeCompile=THREE.Material.prototype.onBeforeCompile;material.customProgramCacheKey=THREE.Material.prototype.customProgramCacheKey;
   meshes.push(this.instancedMesh221(geometry,material,data.role));
  }
  item.wardrobeMaterials?.forEach?.(m=>m.dispose());item.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});
  const bucket={key,meshes,count:0,tier:0};this.buckets.set(key,bucket);return bucket;
 }
 tierFor221(actor){
  const camera=this.camera;if(!camera)return 0;
  const previous=this.tiers221.get(actor.id)||0,tier=lodTier221(Math.hypot(actor.x-camera.position.x,(actor.y||0)-camera.position.y,actor.z-camera.position.z),previous,LOD_QUALITY260[visualState105().quality]??1);
  if(tier!==previous){this.tiers221.set(actor.id,tier);if(this.tiers221.size>this.capacity*3)this.tiers221.delete(this.tiers221.keys().next().value);}
  return tier;
 }
 update(entries,time,route,train){
  this.cabinInstances211=[];
  for(const b of this.buckets.values())b.count=0;
  const rgb=this.rgb221;
  for(const {actor,template,hash} of entries){
   const cycle=template.walkDuration137||1,phases=template.imported137?3:4,phase=actor.moving?Math.floor(((time+(hash%1000)/1000)%cycle)/cycle*phases):0,variant=template.newFemale119&&!template.imported137?(hash>>>9)&1:0,tier260=this.tierFor221(actor),b=this.prototype(template,actor,tier260>=3?0:phase,tier260>=3?0:variant,tier260),n=b.count;
   const pose=passengerCarPose211(actor,route,train);this.position.set(pose?.x??actor.x,actor.y,pose?.z??actor.z);this.quaternion.setFromAxisAngle(this.axis,actor.yaw+(pose?.yaw||0));this.scale.setScalar(actor.modelType==='child'?.72:1);this.matrix.compose(this.position,this.quaternion,this.scale);
   let colours=this.colours121.get(actor.id);if(!colours){colours=wardrobeFor(actor.id);this.colours121.set(actor.id,colours);if(this.colours121.size>this.capacity*3)this.colours121.delete(this.colours121.keys().next().value);}
   // Cabin slots are moved again by syncPassengerInstances211 before drawing, so they are always uploaded.
   const cabin=actor.location==='cabin';
   for(const mesh of b.meshes){ensureRanges221(mesh,this.capacity);writeInstance221(mesh.instanceMatrix,n,this.matrix.elements,16,cabin,mesh.userData.matrixRange221);const colour=colours[mesh.userData.role121]||this.white;rgb[0]=colour.r;rgb[1]=colour.g;rgb[2]=colour.b;writeInstance221(mesh.instanceColor,n,rgb,3,false,mesh.userData.colourRange221);}
   if(cabin)this.cabinInstances211.push({actor,index:n,meshes:b.meshes});b.count++;
  }
  for(const b of this.buckets.values())for(const mesh of b.meshes){ensureRanges221(mesh,this.capacity);mesh.count=b.count;mesh.visible=b.count>0;flushRange221(mesh.instanceMatrix,mesh.userData.matrixRange221,16);flushRange221(mesh.instanceColor,mesh.userData.colourRange221,3);}
  this.actorCount=entries.length;this.group.visible=entries.length>0;
 }
}
