import * as T from 'three';
// Palm down, thumb toward the centre, fingers toward the desk. The authored
// hand has its long axis along +Y; the left and right desk poses need opposite handedness.
export function prepareCabHand200(hand){const side=hand.root.userData.side149;hand.root.rotation.set(-Math.PI/2,Math.PI,side*.06);hand.root.scale.set(-side*.85,.85,.85);hand.pose206=hand.root.quaternion.clone();for(const bone of hand.bones.flat())bone.userData.rest200=bone.rotation.clone();}
export function poseCabHand200(hand,point,mode,dt,leverQuaternion=null){
 const k=1-Math.exp(-16*dt),pointing=mode==='point',holding=mode==='grip';
 hand.root.quaternion.copy(hand.pose206);if(holding&&leverQuaternion)hand.root.quaternion.premultiply(leverQuaternion);
 for(let finger=0;finger<5;finger++)for(let joint=0;joint<3;joint++){
  const bone=hand.bones[finger][joint],base=bone.userData.rest200;
  const curl=finger===4?(holding?[.45,.45,.25]:pointing?[.20,.26,.15]:[.10,.16,.10])[joint]:pointing&&finger===0?[.01,.02,.01][joint]:holding?[.02,.85,.45][joint]:pointing?[.38,.65,.40][joint]:[.12,.22,.14][joint];
  bone.rotation.x=T.MathUtils.lerp(bone.rotation.x,base.x+curl,k);
  bone.rotation.y=T.MathUtils.lerp(bone.rotation.y,finger===4&&joint===0?base.y+(holding?.15:pointing?.20:.10):base.y,k);
  bone.rotation.z=T.MathUtils.lerp(bone.rotation.z,finger===4&&joint===0?(holding?-.50:pointing?.58:.70):base.z,k);
 }
 hand.root.position.copy(point);hand.root.updateWorldMatrix(true,true);
 const landmark=pointing?hand.bones[0][2].localToWorld(new T.Vector3(0,.028,0)):hand.root.localToWorld(hand.grip.clone());
 hand.root.position.add(point.clone().sub(landmark));hand.root.updateWorldMatrix(true,true);
}
