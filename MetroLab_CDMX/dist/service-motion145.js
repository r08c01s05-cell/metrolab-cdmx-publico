import * as THREE from 'three';
const smooth=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
// Visual motions follow successful actions; existing mission states and targets remain authoritative.
export function serviceMotion145(bench,id){
 const apply=bench.apply,update=bench.update,dispose=bench.dispose;let motion=null;const device=bench.instrument142,home=device?.position.clone(),leaves=[];bench.group.traverse(o=>{if(o.name==='sr134_fuseLeaf')leaves.push(o);});let hinges=[];
 bench.apply=(state,result)=>{const before=leaves.map(o=>o.position.clone());apply(state,result);if(!result?.ok)return;
  if(id==='ventilation'&&!bench.carry188?.enabled&&device&&['airBefore','airAfter'].includes(result.effect)){const fan=bench.targets.get('fan');if(fan){const goal=bench.group.worldToLocal(fan.getWorldPosition(new THREE.Vector3()));goal.sub(new THREE.Vector3(0,.60,0).multiply(device.scale).applyQuaternion(device.quaternion));goal.z-=.15;motion={time:0,start:device.position.clone(),goal};}}
  if(['open','close'].includes(result.effect)){hinges=leaves.map((o,i)=>({object:o,from:before[i],to:o.position.clone(),time:0}));for(const h of hinges)h.object.position.copy(h.from);}
 };
 bench.update=dt=>{update(dt);for(const h of hinges){h.time+=dt;h.object.position.lerpVectors(h.from,h.to,smooth(h.time/.42));}hinges=hinges.filter(h=>h.time<.42);if(motion){motion.time+=dt;const t=motion.time;if(t<.38)device.position.lerpVectors(motion.start,motion.goal,smooth(t/.38));else if(t<.78)device.position.copy(motion.goal);else device.position.lerpVectors(motion.goal,home,smooth((t-.78)/.42));if(t>=1.2){device.position.copy(home);motion=null;}}};bench.dispose=()=>{motion=null;hinges=[];dispose();};return bench;
}
export function technicalMotion145(bench,id){const apply=bench.apply,update=bench.update,dispose=bench.dispose,part=bench.targets.get({diodes:'module',insulation:'sample',relay:'relay'}[id]);let motion=null,ghost=null,ghostMaterials=[];const home=part?.position.clone();
 function clear(){ghost?.removeFromParent();for(const m of ghostMaterials)m.dispose();ghostMaterials=[];ghost=null;}
 bench.apply=(state,result)=>{apply(state,result);if(!result?.ok||result.effect!=='replace'||!part)return;clear();ghost=part.clone(true);ghost.name='Componente retirado145';ghost.position.copy(home);ghost.traverse(o=>{if(!o.isMesh)return;o.raycast=()=>{};const clone=m=>{const c=m.clone();c.transparent=true;c.opacity=.75;c.depthWrite=false;ghostMaterials.push(c);return c;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});bench.group.add(ghost);const tray=home.clone().add(new THREE.Vector3(-.36,.12,-.18));part.position.copy(tray);motion={time:0,tray};};
 bench.update=dt=>{update(dt);if(!motion)return;motion.time+=dt;const t=smooth(motion.time/.8);part.position.lerpVectors(motion.tray,home,t);if(ghost){ghost.position.copy(home).addScaledVector(new THREE.Vector3(.4,-.12,-.14),t);for(const m of ghostMaterials)m.opacity=.75*(1-t);}if(motion.time>=.8){part.position.copy(home);motion=null;clear();}};bench.dispose=()=>{clear();dispose();};return bench;
}
