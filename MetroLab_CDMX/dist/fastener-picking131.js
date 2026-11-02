import * as THREE from 'three';
const visible=o=>{for(let n=o;n;n=n.parent)if(!n.visible)return false;return true;};
const inside=(o,parent)=>{for(let n=o;n;n=n.parent)if(n===parent)return true;return false;};
// CSS-pixel tolerance is independent of devicePixelRatio, distance and canvas offset.
export function pickFastener131(ray,camera,canvas,roots,allowed,occluder,key='handTarget'){
 if(!camera||!canvas?.getBoundingClientRect||!ray?.ray)return null;
 const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;
 const pointer=ray.ray.at(1,new THREE.Vector3()).project(camera),sx=(pointer.x+1)*rect.width/2,sy=(1-pointer.y)*rect.height/2,candidates=[];
 for(const target of roots){const id=target.userData[key];if(!/^(screw\w*|bolt\d+)$/.test(id||'')||!visible(target)||allowed&&!allowed.includes(id))continue;
  const point=target.getWorldPosition(new THREE.Vector3()),p=point.clone().project(camera);if(p.z<-1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1)continue;
  const distance=Math.hypot((p.x+1)*rect.width/2-sx,(1-p.y)*rect.height/2-sy);if(distance<=20)candidates.push({id,target,point,distance});
 }
 candidates.sort((a,b)=>a.distance-b.distance);
 for(const hit of candidates){if(occluder){const check=new THREE.Raycaster();check.set(camera.getWorldPosition(new THREE.Vector3()),hit.point.clone().sub(camera.getWorldPosition(new THREE.Vector3())).normalize());const depth=check.ray.origin.distanceTo(hit.point);check.far=Math.max(0,depth-.065);const blocked=check.intersectObject(occluder,true).some(h=>visible(h.object)&&!inside(h.object,hit.target)&&!h.object.userData.hitProxy125&&h.object.material?.visible!==false&&!(h.object.material?.transparent&&h.object.material.opacity<.5));if(blocked)continue;}return {...hit,object:hit.target};}
 return null;
}
