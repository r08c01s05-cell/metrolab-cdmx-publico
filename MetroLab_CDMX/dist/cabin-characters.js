import {refinePassengers180} from './passenger-realism180.js?v=204';
import {PASSENGERS145,passengerManifest145} from './passenger-assets145.js?v=180';
import {PassengerContacts122} from './world-contact122.js?v=222';
import {prepareImported137,selectPassenger137,attachInfant138} from './passenger-cast137.js?v=144';
import {InstancedPassengers121,selectDetailed121} from './instanced-passengers121.js?v=222';
import{avatarDetail119,applyCloth120}from'./passenger-cloth119.js?v=130';
import {refineSurfaceMaterials100} from './visual-quality100.js?v=205';
import * as THREE from 'three';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {prepareWardrobe,applyWardrobe} from './passenger-wardrobe.js?v=144';

// Clone the hierarchy and rebind every skin to its own bones. Geometry and
// materials stay shared; skeletons and animation state must never be shared
// between characters.
// Fluidez 222: inside one copy, skins that use the same bones with the same
// inverse bind matrices share one Skeleton. The renderer then computes and
// uploads those bone matrices once per character instead of once per garment.
function sameSkin222(a,b){
 if(a===b)return true;if(a.bones.length!==b.bones.length||a.boneInverses.length!==b.boneInverses.length)return false;
 for(let i=0;i<a.bones.length;i++)if(a.bones[i]!==b.bones[i]||!a.boneInverses[i].equals(b.boneInverses[i]))return false;
 return true;
}
export function cloneCharacter(source){
 const copy=source.clone(true),mapping=new Map(),shared=[];
 function pair(a,b){mapping.set(a,b);a.children.forEach((child,i)=>pair(child,b.children[i]));}pair(source,copy);
 source.traverse(original=>{if(!original.isSkinnedMesh)return;const mesh=mapping.get(original);
  let entry=shared.find(e=>sameSkin222(e.original,original.skeleton));
  if(!entry){const skeleton=original.skeleton.clone();skeleton.bones=original.skeleton.bones.map(b=>mapping.get(b));entry={original:original.skeleton,skeleton};shared.push(entry);}
  mesh.skeleton=entry.skeleton;mesh.bind(mesh.skeleton,original.bindMatrix);mesh.frustumCulled=false;
 });return copy;
}

export function createCharacter(template){
 const root=new THREE.Group(),body=cloneCharacter(template.scene);root.add(body);
 const bones={};body.traverse(o=>{if(o.isBone)bones[o.name]=o;});
 const rest=new Map(Object.values(bones).map(b=>[b,{position:b.position.clone(),quaternion:b.quaternion.clone()}]));
 const mixer=new THREE.AnimationMixer(body),idle=template.animations.find(a=>a.name==='Idle');
 if(idle)mixer.clipAction(idle).play();
 const walk=template.animations.find(a=>a.name==='Walk');
 const wardrobeMaterials=prepareWardrobe(body);const lod119={near:[],distant:[],far:null};body.traverse(o=>{if(o.userData.crowdLOD119==='near')lod119.near.push(o);if(o.userData.crowdLOD119==='far')lod119.distant.push(o);});
 return {root,body,bones,rest,mixer,idle,walk,template,wardrobeMaterials,lod119};
}

export function holdRail(item,target,blend=1){
 const side=target.side||'R',upper=item.bones['UpperArm_'+side],lower=item.bones['LowerArm_'+side];
 if(!upper||!lower)return;
 const beforeUpper=upper.quaternion.clone(),beforeLower=lower.quaternion.clone();
 const hand=item.bones['Hand_'+side];
 const wrist=hand&&(item.template.newFemale119||item.template.imported137)?hand.position.clone().add(new THREE.Vector3(side==='L'?.035:-.035,0,0)):new THREE.Vector3(side==='R'?-.16:.16,-.24,0),goal=new THREE.Vector3(target.x,target.y,target.z);
 const point=new THREE.Vector3(),origin=new THREE.Vector3(),from=new THREE.Vector3(),to=new THREE.Vector3();
 const parent=new THREE.Quaternion(),delta=new THREE.Quaternion();
 // Two-joint CCD keeps the hand at the post using the supplied arm lengths.
 for(let iteration=0;iteration<32;iteration++){lower.updateWorldMatrix(true,false);if(point.copy(wrist).applyMatrix4(lower.matrixWorld).distanceToSquared(goal)<.000001)break;for(const joint of [lower,upper]){
  lower.updateWorldMatrix(true,false);point.copy(wrist).applyMatrix4(lower.matrixWorld);joint.getWorldPosition(origin);
  from.copy(point).sub(origin).normalize();to.copy(goal).sub(origin).normalize();
  delta.setFromUnitVectors(from,to);joint.parent.getWorldQuaternion(parent);
  delta.premultiply(parent.clone().invert()).multiply(parent);joint.quaternion.premultiply(delta).normalize();
 }}
 upper.quaternion.copy(beforeUpper.slerp(upper.quaternion,blend));lower.quaternion.copy(beforeLower.slerp(lower.quaternion,blend));
 lower.updateWorldMatrix(true,false);item.gripPoint=wrist.applyMatrix4(lower.matrixWorld);item.gripTarget=goal;
}

export function poseCharacter(item,actor,time){
 const {root,body,bones,rest,mixer}=item;
 // Restart sampling to avoid the mixer's cached values skipping a write after
 // the seated pose overrides bones, including when the simulation is paused.
 mixer.stopAllAction();
 for(const [b,r]of rest){b.position.copy(r.position);b.quaternion.copy(r.quaternion);}
 const moving=Boolean(actor.moving&&actor.pose!=='seated');
 const fresh=item.poseId116!==actor.id||item.poseTime116===undefined||time<item.poseTime116;
 const dt=fresh?0:Math.min(.1,Math.max(0,time-item.poseTime116));
 item.poseId116=actor.id;item.poseTime116=time;
 item.walkBlend116=fresh?(moving?1:0):THREE.MathUtils.lerp(item.walkBlend116,moving?1:0,1-Math.exp(-12*dt));
 if(actor.pose==='seated')item.walkBlend116=0;
 if(item.idle)mixer.clipAction(item.idle).reset().setEffectiveWeight(item.walk?1-item.walkBlend116:1).play();
 if(item.walk&&item.walkBlend116>1e-5)mixer.clipAction(item.walk).reset().setEffectiveWeight(item.idle?item.walkBlend116:1).play();
 mixer.setTime(time);
 body.position.set(0,0,0);root.position.set(actor.x,actor.y,actor.z);root.rotation.set(0,actor.yaw||0,0);
 root.scale.setScalar(actor.modelType==='child'?.72:1);
 if(actor.pose==='seated'){
  // Legs fold forward into the aisle, with shins vertical and feet on the floor.
  // Use actual segment lengths instead of translating a rigid standing mesh.
  const hips=bones.Hips,upper=bones.UpperLeg_L,lower=bones.LowerLeg_L,foot=bones.Foot_L;
  const hipHeight=(actor.seatHeight-actor.y)/root.scale.y+.075;
  const blend=actor.seatBlend??1;
  hips.position.copy(rest.get(hips).position);hips.position.y=THREE.MathUtils.lerp(hips.position.y,hipHeight,blend);hips.quaternion.identity();
  const thigh=Math.abs(lower.position.y),shin=Math.abs(foot.position.y);
  const bend=Math.acos(THREE.MathUtils.clamp((hipHeight+upper.position.y-shin-.07)/thigh,-1,1));
  for(const side of ['L','R']){
   bones['UpperLeg_'+side].rotation.set(-bend*blend,0,0);
   bones['LowerLeg_'+side].rotation.set(bend*blend,0,0);
   bones['Foot_'+side].rotation.set(0,0,0);
   // Lower arms rest toward the lap; preserve the supplied infant attachments.
   bones['UpperArm_'+side].rotation.set(-.2,0,(side==='L'?-1:1)*(item.template.imported137&&item.template.newFemale119?1.2:.55));
   bones['LowerArm_'+side].rotation.set(-.55,0,0);
  }
 }else if(!actor.moving){
  // The supplied bind poses spread the arms. Bring them alongside the body.
  for(const side of ['L','R'])bones['UpperArm_'+side].rotation.z=THREE.MathUtils.lerp(bones['UpperArm_'+side].rotation.z,(side==='L'?-1:1)*(item.template.newFemale119?1.3:.65),1-item.walkBlend116);
 }
 if(!moving){
  let phase=item.idlePhase121;
  if(phase===undefined||item.idleId121!==actor.id){let h=0;for(const c of actor.id||'')h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;phase=item.idlePhase121=h%6283/1000;item.idleId121=actor.id;}
  const chest=bones.Chest||bones.Spine,head=bones.Head;if(chest)chest.rotation.x+=.009*Math.sin(time*1.5+phase);if(head){head.rotation.y+=.07*Math.sin(time*.31+phase);head.rotation.x+=.015*Math.sin(time*.73+phase);}
 }
 if(actor.pose==='standing'&&!actor.moving&&actor.grip&&actor.modelType!=='child'){
  const target={...actor.grip};
  holdRail(item,target,actor.gripBlend??1);
 }else{item.gripPoint=null;item.gripTarget=null;}
 if(item.template.carryingInfant138){
  root.updateMatrixWorld(true);
  for(const side of ['L','R']){
   const goal=bones.Chest.localToWorld(new THREE.Vector3(side==='L'?.065:-.065,-.10,.27));
   holdRail(item,{side,x:goal.x,y:goal.y,z:goal.z});
  }
 }
 if(item.template.newFemale119)for(const bone of Object.values(bones))bone.quaternion.normalize();
 root.updateMatrixWorld(true); // WebGLRenderer updates each visible skeleton once before drawing.
}

export class CabinCharacters{
 constructor(scene,camera=null){this.scene121=scene;this.camera119=camera;this.group=new THREE.Group();this.group.name='Pasajeros_GLB_aportados';scene.add(this.group);this.templates=[];this.pool=[];this.ready=false;this.error=null;this.failures120=new Map();this.pending120=0;this.retryCount120=0;this.loading=this.load();}
 async load(){
  this.failures120??=new Map();this.templates??=[];this.pending120=1;
  let records;
  try{const response=await fetch('./models/personajes/manifest.json?v=145',{cache:'no-cache',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Manifest '+response.status);records=passengerManifest145(await response.json());}
  catch(error){this.manifestWarning145=error;records=PASSENGERS145.map(r=>({...r}));}

  const pending=records.filter(r=>!this.templates.some(t=>t.name===r.name));this.pending120=pending.length;
  this.assetLoads137??=new Map();
  await Promise.allSettled(pending.map(async record=>{try{
   if(!this.assetLoads137.has(record.url))this.assetLoads137.set(record.url,(async()=>{
   const response=await fetch(record.url+'?v=145',{signal:AbortSignal.timeout(45000)});if(!response.ok)throw new Error(record.name+': HTTP '+response.status);
   const bytes=new Uint8Array(await response.arrayBuffer());
   const buffer=bytes[0]===0x1f&&bytes[1]===0x8b?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
   if(new DataView(buffer).getUint32(0,true)!==0x46546c67)throw new Error(record.name+': respuesta no es GLB');
   const base=await new GLTFLoader().parseAsync(buffer,'');refineSurfaceMaterials100(base.scene);return base;
   })().catch(error=>{this.assetLoads137.delete(record.url);throw error;}));
   const base=await this.assetLoads137.get(record.url),gltf={...base,scene:cloneCharacter(base.scene),animations:[...base.animations]};gltf.name=record.name;gltf.newFemale119=Boolean(record.newFemale119);
   if(record.infant138){const childRecord=records.find(r=>r.kind137==='child');const child=childRecord&&await this.assetLoads137.get(childRecord.url);const infant=cloneCharacter((child||base).scene);refinePassengers180({scene:infant},{kind137:'child'});attachInfant138(gltf,infant);}
   refinePassengers180(gltf,record);prepareImported137(gltf,{...record,kind137:record.kind137||(record.name.includes('madre')?'parent':record.name.includes('adolescente')?'child':record.name.includes('femenino')?'woman':'man')});
   this.templates.push(gltf);this.ready=true;this.failures120.delete(record.name);
  }catch(error){this.failures120.set(record.name,error);console.error('Pasajero no disponible; se conservan los demás modelos',record.name,error);}
  finally{this.pending120--;}}));
  this.ready=this.templates.length>0;this.warning145=this.failures120.size?new Error('Modelos pendientes: '+[...this.failures120.keys()].join(', ')):null;this.error=this.ready?null:this.warning145||this.manifestWarning145||new Error('No se cargó ningún personaje');
  if(this.failures120.size&&(this.retryCount120||0)<2){this.retryCount120=(this.retryCount120||0)+1;this.retryTimer120=globalThis.setTimeout?.(()=>{this.loading=this.load();},this.retryCount120*5000);this.retryTimer120?.unref?.();}
 }
 retry(){if(this.pending120)return this.loading;if(this.retryTimer120)clearTimeout(this.retryTimer120);this.retryCount120=0;this.loading=this.load();return this.loading;}
 animate203(time,running=true){const dt=Math.min(.05,Math.max(0,time-(this.visualAt203??time)));this.visualAt203=time;for(const item of this.pool){if(!item.root.visible||!item.actor203)continue;const a=item.actor203;let p=item.display203;if(!p||p.id!==a.id||Math.hypot(p.x-a.x,p.z-a.z)>3)p=item.display203={id:a.id,x:a.x,y:a.y,z:a.z,yaw:a.yaw||0};const k=a.location==='cabin'||!running?1:1-Math.exp(-22*dt);for(const axis of['x','y','z'])p[axis]+=(a[axis]-p[axis])*k;p.yaw+=Math.atan2(Math.sin((a.yaw||0)-p.yaw),Math.cos((a.yaw||0)-p.yaw))*k;poseCharacter(item,{...a,...p},time+(item.phase203||0));}}
 update(actors,time,running=true){
  if(!this.templates.length)return 0;
  const detailed121=selectDetailed121(actors,this.camera119,24),liveActors121=actors.filter(a=>detailed121.has(a.id)),farEntries121=[];
  const activeIds116=new Set(liveActors121.map(a=>a.id)),byId116=new Map(),free116=new Map();
  for(const item of this.pool){item.root.visible=false;byId116.set(item.actorId,item);if(!activeIds116.has(item.actorId)){if(!free116.has(item.template))free116.set(item.template,[]);free116.get(item.template).push(item);}}
  actors.forEach((actor,i)=>{
   // Identity chooses the model even when boarding actors reorder the frame.
   let hash=2166136261;for(const c of actor.id){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}hash>>>=0;
   const template=selectPassenger137(this.templates,actor,hash);if(!template)return;
   if(!detailed121.has(actor.id)){farEntries121.push({actor,template,hash});return;}
   let item=byId116.get(actor.id);if(item?.root.visible||item?.template!==template)item=null;item??=free116.get(template)?.pop();
   if(!item){item=createCharacter(template);this.pool.push(item);this.group.add(item.root);}
   item.root.visible=true;item.actorId=actor.id;
   applyWardrobe(item,actor.id);applyCloth120(item,actor.id);const variant119=template.imported137?0:(hash>>>9)&1;if(item.variant119!==variant119){item.variant119=variant119;item.body.traverse(o=>{if(o.morphTargetInfluences?.length)o.morphTargetInfluences[0]=variant119;});}avatarDetail119(item,this.camera119?Math.hypot(actor.x-this.camera119.position.x,actor.y-this.camera119.position.y,actor.z-this.camera119.position.z):0);
   const moving=running?actor.moving:(item.lastMoving??actor.moving);item.lastMoving=moving;
   item.actor203={...actor,moving,trainId:this.train203};item.root.userData.passenger203=item.actor203;item.phase203=(hash%1000)/1000;poseCharacter(item,item.actor203,time+item.phase203);
  });
  if(farEntries121.length||this.background121){this.background121??=new InstancedPassengers121(this.scene121||this.group.parent||this.group,{create:createCharacter,pose:poseCharacter});this.background121.camera=this.camera119||null;this.background121.update(farEntries121,time,this.alignment121,this.trainState211);}
  this.contacts122??=new PassengerContacts122(this.scene121||this.group.parent||this.group);this.contacts122.update(actors,time,this.alignment121,this.trainState211);
  this.stats121={detailed:liveActors121.length,instanced:farEntries121.length,platform:actors.filter(a=>a.location==='platform'||a.id.startsWith('wait:')).length,total:actors.length};
  // Remove surplus clones after a change of crowd composition; shared assets stay alive.
  const limit=Math.max(liveActors121.length,this.templates.length)*2;
  for(let i=this.pool.length-1;this.pool.length>limit&&i>=0;i--)if(!this.pool[i].root.visible){const item=this.pool.splice(i,1)[0];this.group.remove(item.root);item.mixer.stopAllAction();for(const material of item.wardrobeMaterials)material.dispose();item.body.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});}
  return actors.length;
 }
}
