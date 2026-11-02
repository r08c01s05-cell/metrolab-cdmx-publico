import * as THREE from 'three';
const visible=o=>{for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;};
export function nearestAction143(object,key='handTarget'){for(let n=object;n;n=n.parent)if(n.userData[key])return n;return null;}
// Ring-shaped or recessed destinations need a small screen-space hit area at their centre.
// Only the current action is expanded; hidden or back-facing objects remain unavailable.
export function pickActionCentre143(ray,camera,canvas,targets,allowed,key='handTarget'){
 if(!allowed?.length)return null;const r=canvas.getBoundingClientRect(),mouse=ray.ray.at(1,new THREE.Vector3()).project(camera);let best;
 for(const target of targets){const id=target.userData[key];if(!allowed.includes(id)||!visible(target)||/^(screw|bolt)/.test(id))continue;const b=new THREE.Box3().setFromObject(target),point=b.isEmpty()?target.getWorldPosition(new THREE.Vector3()):b.getCenter(new THREE.Vector3()),p=point.clone().project(camera);if(p.z< -1||p.z>1)continue;const distance=Math.hypot((p.x-mouse.x)*r.width/2,(p.y-mouse.y)*r.height/2);if(distance<=18&&(!best||distance<best.distance))best={id,target,object:target,point,distance};}return best||null;
}
