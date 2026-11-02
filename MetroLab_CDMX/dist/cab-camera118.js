import {carSupportPose212} from './car-support212.js?v=212';
import {trainTrack208,doorSide208} from './station-layout208.js?v=209';
import * as THREE from 'three';
// The eye and sightline share the leading car's rigid frame, even on a curve.
// Mapping each eye/look point independently along the route cuts through the cab.
export function cabPose118(route,train,mode){
 const d=train.direction,p=carSupportPose212(route,train,8),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.yaw),origin=new THREE.Vector3(p.x,0,p.z),world=v=>v.applyQuaternion(q).add(origin),side=doorSide208(train);
 if(mode==='cab-platform')return{eye:world(new THREE.Vector3(d*4.2,2.8,side*1.55)),target:world(new THREE.Vector3(-d*111.8,2.4,side*3.5))};
 return{eye:world(new THREE.Vector3(d*6.9,2.75,0)),target:world(new THREE.Vector3(d*38.2,2.75,0))};
}
