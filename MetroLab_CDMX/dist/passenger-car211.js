import {carSupportPose212} from './car-support212.js?v=212';
import {trainTrack208} from './station-layout208.js?v=209';

// Passengers belong to a rigid car, not to an independently bent route point.
// The snapshot anchor survives the 22 Hz crowd update; drawing uses the current
// train pose, including its sub-step interpolation, without changing physics.
export function passengerCarPose211(point,route,train,position=train?.position){
 if(point.location!=='cabin'||!train)return route?.pose(point.x,point.z)||{x:point.x,z:point.z,yaw:0};
 const index=point.carAnchor211?.index??Math.max(0,Math.min(8,Number.isInteger(point.slot)?point.slot%9:Math.round((point.x-train.position)/train.direction/16.7)+4));
 const offset=train.direction*(index-4)*16.7,anchor=point.carAnchor211||{x:train.position+offset,z:trainTrack208(train)};
 const p=carSupportPose212(route,train,index,position),c=Math.cos(p.yaw),s=Math.sin(p.yaw),x=point.x-anchor.x,z=point.z-anchor.z;
 return{x:p.x+c*x+s*z,z:p.z-s*x+c*z,yaw:p.yaw};
}

export function syncPassengerInstances211(view,state,route,renderPosition){
 const bank=view.cabinCharacters;if(!bank)return;
 const trainFor=a=>state.engine.trains.find(t=>t.id===(a.trainId||bank.train203));
 const far=bank.background121;if(far)for(const entry of far.cabinInstances211||[]){
  const train=trainFor(entry.actor);if(!train)continue;const p=passengerCarPose211(entry.actor,route,train,renderPosition(train,state));
  far.position.set(p.x,entry.actor.y,p.z);far.quaternion.setFromAxisAngle(far.axis,(entry.actor.yaw||0)+p.yaw);far.scale.setScalar(entry.actor.modelType==='child'?.72:1);far.matrix.compose(far.position,far.quaternion,far.scale);
  for(const mesh of entry.meshes){mesh.setMatrixAt(entry.index,far.matrix);mesh.instanceMatrix.needsUpdate=true;}
 }
 const feet=bank.contacts122;if(feet)for(const entry of feet.cabinContacts211||[]){
  const train=trainFor(entry.actor);if(!train)continue;const p=passengerCarPose211(entry.actor,route,train,renderPosition(train,state));
  feet.p.set(p.x,entry.actor.y+.012,p.z);feet.q.setFromAxisAngle(feet.axis,(entry.actor.yaw||0)+p.yaw);feet.s.set(.30*entry.child,1,.44*entry.child);feet.matrix.compose(feet.p,feet.q,feet.s);feet.mesh.setMatrixAt(entry.index,feet.matrix);feet.mesh.instanceMatrix.needsUpdate=true;
 }
}
