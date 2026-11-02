import {edgeFinish124} from './edge-finish124.js?v=205';
import * as THREE from 'three';
import {refineMaterials110} from './material-realism110.js?v=205';
export function refineSurfaceMaterials100(root,anisotropy=4){edgeFinish124(root);return refineMaterials110(root,anisotropy);}
export function setupCabinLighting100(view){view.cabinLights100=[-1,0,1].map(offset=>{const light=new THREE.PointLight(0xfff4e9,0,32,2);light.userData.offset100=offset;light.visible=true;view.scene.add(light);return light;});
 const head=new THREE.SpotLight(0xfff3db,0,65,.40,.78,2);head.name='Haz_cabecera122';head.castShadow=false;view.scene.add(head,head.target);view.headlight122=head;
}
export function headlightPose122(route,train){const d=train.direction,front=train.position+d*4*16.7,p=route?.pose(front,-d*1.8)||{x:front,z:-d*1.8,yaw:0},q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.yaw),base=new THREE.Vector3(p.x,0,p.z);return{eye:new THREE.Vector3(d*7.9,1.5,0).applyQuaternion(q).add(base),target:new THREE.Vector3(d*48,.45,0).applyQuaternion(q).add(base)};}
export function updateQualityLighting100(view){
 const state=view.getState(),e=state?.engine,line=e?.lines[state.currentLine],train=e?.trains.find(t=>t.id===state.selectedTrain),inside=['car','driver','cab-platform'].includes(view.cameraMode),index=view.lastStation>=0?view.lastStation:view.cameraStation??0;
 const surface=state.currentLine===8&&(inside||view.cameraMode==='train'?Boolean(train&&e.weatherExposure({...train,position:view.camera.position.x})):line?.stations[index]?.entorno_visual?.tipo==='superficial'),wet=surface&&e?.weather==='rain';
 const now=view.elapsed??0,dt=view.lightTime122===undefined?1:Math.max(0,Math.min(.08,(now-view.lightTime122)/1000)),blend=dt===1?1:1-Math.exp(-4*dt);view.lightTime122=now;
 if(view.ambientLight)view.ambientLight.intensity=THREE.MathUtils.lerp(view.ambientLight.intensity,inside?.48:surface?wet?.64:.82:.55,blend);
 view.scene.environmentIntensity=THREE.MathUtils.lerp(view.scene.environmentIntensity??.65,inside?.50:surface?wet?.42:.62:.48,blend);
 if(view.sun)view.sun.intensity=THREE.MathUtils.lerp(view.sun.intensity,inside?.08:surface?wet?.65:1.55:.14,blend);
 view.palette122??={surface:new THREE.Color('#bac7cd'),wet:new THREE.Color('#8e9fa9'),covered:new THREE.Color('#18232a'),current:new THREE.Color('#18232a')};const bg=wet?view.palette122.wet:surface?view.palette122.surface:view.palette122.covered;view.palette122.current.lerp(bg,blend);view.scene.background=view.palette122.current;
 if(view.scene.fog){view.scene.fog.color.copy(view.palette122.current);view.scene.fog.near=surface?(wet?110:260):145;view.scene.fog.far=surface?(wet?580:850):620;}
 for(const light of view.cabinLights100||[]){const offset=light.userData.offset100,p=inside?new THREE.Vector3(view.camera.position.x+offset*5.6,3.25,train?-train.direction*1.8:view.camera.position.z):new THREE.Vector3(view.camera.position.x+offset*19,4.15,view.camera.position.z>0?5.6:-5.6);light.position.copy(view.alignment97?view.alignment97.map(p):p);light.color.set(state.currentLine===1?0xf5f3ec:0xeff2eb);const target=inside?(view.cameraMode==='car'?6.5:4.2):surface?0:14;light.intensity=THREE.MathUtils.lerp(light.intensity,target,blend);}
 if(view.headlight122&&train){const pose=headlightPose122(view.alignment97,train);view.headlight122.position.copy(pose.eye);view.headlight122.target.position.copy(pose.target);view.headlight122.intensity=THREE.MathUtils.lerp(view.headlight122.intensity,surface?0:90,blend);}
}
