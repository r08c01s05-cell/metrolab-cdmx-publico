import * as THREE from 'three';
const Z=new THREE.Vector3(0,0,1),UP=new THREE.Vector3(0,1,0);
// Canonical probe frame: exposed metal tip at origin, handle extends along +Z.
// This tail is the last control point of the native Blender strain relief (139).
export const PROBE_TAIL143=new THREE.Vector3(.06,.01,.241);
export function probeTail143(probe){return probe.localToWorld(new THREE.Vector3(...(probe.userData.tail143||PROBE_TAIL143.toArray())));}
export function probeParking143(meter,colour){meter.updateWorldMatrix(true,false);const q=meter.getWorldQuaternion(new THREE.Quaternion()),normal=Z.clone().applyQuaternion(q);return{point:meter.localToWorld(new THREE.Vector3(colour==='red'?.35:-.35,-.40,.15)),quaternion:q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2)),normal};}
export function probeContact143(target,colour,side=1){target.updateWorldMatrix(true,false);const q=target.getWorldQuaternion(new THREE.Quaternion()),normal=new THREE.Vector3(0,0,side).applyQuaternion(q).normalize(),point=target.localToWorld(new THREE.Vector3(0,0,side*(side===1?.035:.04))),body=normal.clone().multiplyScalar(.8).addScaledVector(UP,.95).add(new THREE.Vector3(colour==='red'?-.2:.2,0,0)).normalize();return{point,normal,quaternion:new THREE.Quaternion().setFromUnitVectors(Z,body)};}
export class ProbeMotion143{
 constructor(probe){this.probe=probe;probe.userData.tip139=[0,0,0];probe.userData.grip118=[0,0,.115];probe.userData.tail143=probe.userData.nativeTool139?PROBE_TAIL143.toArray():[0,0,.245];this.job=null;}
 set(pose,{immediate=false,connected=false}={}){const o=this.probe;o.parent.updateWorldMatrix(true,false);const p=o.parent.worldToLocal(pose.point.clone()),parentQ=o.parent.getWorldQuaternion(new THREE.Quaternion()).invert(),q=parentQ.clone().multiply(pose.quaternion),normal=pose.normal.clone().applyQuaternion(parentQ).normalize();
  if(this.goal&&this.goal.distanceToSquared(p)<1e-10&&this.goalQ.angleTo(q)<1e-5)return;this.goal=p;this.goalQ=q;o.userData.destination135=p.clone();o.userData.connected123=connected;
  if(immediate){o.position.copy(p);o.quaternion.copy(q);this.job=null;this.normal=normal;return;}
  this.job={from:o.position.clone(),to:p.clone(),q0:o.quaternion.clone(),q1:q.clone(),n0:this.normal?.clone()||normal.clone(),n1:normal,t:0,duration:THREE.MathUtils.clamp(.38+o.position.distanceTo(p)*.16,.38,.72)};this.normal=normal;
 }
 update(dt){const j=this.job,o=this.probe;if(!j)return false;j.t=Math.min(j.duration,j.t+Math.max(0,Math.min(.05,dt)));const u=j.t/j.duration,k=u*u*u*(10+u*(-15+6*u));
  // Withdraw from the old contact, travel in front of the panel, then seat the tip.
  const a=j.from.clone().addScaledVector(j.n0,.13),b=j.to.clone().addScaledVector(j.n1,.13);o.position.copy(j.from).multiplyScalar((1-k)**3).addScaledVector(a,3*(1-k)**2*k).addScaledVector(b,3*(1-k)*k*k).addScaledVector(j.to,k**3);o.quaternion.slerpQuaternions(j.q0,j.q1,k);if(u===1){o.position.copy(j.to);o.quaternion.copy(j.q1);this.job=null;}return true;
 }
 finish(){if(this.job){this.probe.position.copy(this.job.to);this.probe.quaternion.copy(this.job.q1);this.job=null;}}
}
